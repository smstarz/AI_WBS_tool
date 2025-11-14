require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const { createChatCompletion, isConfigured } = require('./lib/llm');
const {
  CHAT_TOOL_DEFINITIONS,
  executeLoadProjectData
} = require('./lib/chatTools');

const PORT = Number(process.env.PORT) || 5173;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_HOST = process.env.PUBLIC_HOST || '127.0.0.1';
const BASE_DIR = path.resolve(__dirname);
const PROJECTS_DIR = path.join(BASE_DIR, 'projects');
const CSV_FILENAME = 'wbs.csv';
const JSON_FILENAME = 'wbs.json';
const CHAT_FILENAME = 'chat_sessions.json';
const DEFAULT_CSV_PATH = path.join(BASE_DIR, 'mobile_app_wbs_sample.csv');
const projectLocks = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const FIELD_DEFS = [
  { key: 'wbsId', header: 'wbs id', aliases: ['task id', 'id'] },
  { key: 'taskName', header: 'task name', aliases: ['task description', 'name'] },
  { key: 'level', header: 'level' },
  {
    key: 'parentWbsId',
    header: 'parent id',
    aliases: ['parent', 'parent wbs id', 'parentwbsid']
  },
  { key: 'startDate', header: 'start date', aliases: ['start'] },
  { key: 'endDate', header: 'end date', aliases: ['end'] },
  { key: 'duration', header: 'duration' },
  { key: 'progress', header: 'progress', aliases: ['completion'] },
  { key: 'planned', header: 'planned', optional: true },
  { key: 'owner', header: 'owner', aliases: ['resource'] },
  { key: 'costEstimate', header: 'cost estimate', aliases: ['cost'] },
  { key: 'priority', header: 'priority' },
  { key: 'weight', header: 'weight' },
  { key: 'status', header: 'status' },
  { key: 'deliverable', header: 'deliverable' },
  { key: 'acceptanceCriteria', header: 'acceptance criteria', aliases: ['acceptance'] },
  { key: 'reviewDate', header: 'review date' }
];
const REQUIRED_HEADERS = FIELD_DEFS.filter(field => !field.optional).map(field => field.header);
const LEGACY_HEADERS = ['task id', 'task description', 'start date', 'end date', 'owner', 'progress'];
const FIELD_DEFS_BY_KEY = FIELD_DEFS.reduce((acc, field) => {
  acc[field.key] = field;
  return acc;
}, Object.create(null));

const STATUS_OPTIONS = ['작업중', '대기중', '완료', '지연', '보류', '취소'];
const STATUS_DEFAULT = '대기중';
const STATUS_VALUE_ALIASES = {
  '': STATUS_DEFAULT,
  none: STATUS_DEFAULT,
  'no status': STATUS_DEFAULT,
  'no-status': STATUS_DEFAULT,
  'not started': STATUS_DEFAULT,
  notstarted: STATUS_DEFAULT,
  'not-started': STATUS_DEFAULT,
  '상태 없음': STATUS_DEFAULT,
  상태없음: STATUS_DEFAULT,
  '—': STATUS_DEFAULT,
  '-': STATUS_DEFAULT
};

function getFieldNames(field) {
  if (!field) return [];
  const names = new Set();
  if (field.header) {
    names.add(field.header.toLowerCase());
  }
  (field.aliases || []).forEach(alias => {
    if (typeof alias === 'string' && alias.trim()) {
      names.add(alias.trim().toLowerCase());
    }
  });
  return Array.from(names);
}

function findHeaderIndex(headerMap, field) {
  const names = getFieldNames(field);
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    if (headerMap.has(name)) {
      return headerMap.get(name);
    }
  }
  return undefined;
}

function getCandidateKeys(field) {
  if (!field) return [];
  const keys = new Set();
  if (field.key) keys.add(field.key);
  if (field.header) {
    keys.add(field.header);
    keys.add(field.header.replace(/\s+/g, ''));
  }
  (field.aliases || []).forEach(alias => {
    if (typeof alias === 'string' && alias.trim()) {
      keys.add(alias.trim());
      keys.add(alias.trim().replace(/\s+/g, ''));
    }
  });
  return Array.from(keys).filter(Boolean);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function ensureProjectsRoot() {
  await fs.promises.mkdir(PROJECTS_DIR, { recursive: true });
}

async function withProjectLock(projectDir, task) {
  const key = path.resolve(projectDir);
  const previous = projectLocks.get(key) || Promise.resolve();
  let release;
  const next = new Promise(resolve => {
    release = resolve;
  });
  projectLocks.set(key, previous.then(() => next));
  await previous;
  try {
    return await task();
  } finally {
    release();
    if (projectLocks.get(key) === next) {
      projectLocks.delete(key);
    }
  }
}

async function writeFileAtomic(filePath, data, encoding = 'utf8') {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const tempPath = path.join(
    dir,
    `.${base}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`
  );
  await fs.promises.writeFile(tempPath, data, encoding);
  try {
    await fs.promises.rename(tempPath, filePath);
  } catch (error) {
    if (error.code === 'EEXIST' || error.code === 'EPERM') {
      await fs.promises.rm(filePath, { force: true });
      await fs.promises.rename(tempPath, filePath);
    } else {
      await fs.promises.rm(tempPath, { force: true });
      throw error;
    }
  }
}

async function clearReportFiles(reportsDir) {
  try {
    const entries = await fs.promises.readdir(reportsDir, { withFileTypes: true });
    await Promise.all(
      entries.map(entry => {
        if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
          const target = path.join(reportsDir, entry.name);
          return fs.promises.rm(target, { force: true });
        }
        return null;
      })
    );
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function isValidProjectName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) return false;
  if (trimmed.length > 80) return false;
  return true;
}

function sanitizeString(value) {
  if (value === null || value === undefined) return '';
  return value.toString().trim();
}

function sanitizeReportFileName(value) {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  let baseName = path.basename(trimmed).replace(/[^a-zA-Z0-9._-]/g, '_');
  baseName = baseName.replace(/^\.+/, '');
  if (!baseName) {
    baseName = 'report';
  }
  if (!baseName.toLowerCase().endsWith('.html')) {
    baseName += '.html';
  }
  if (baseName.length > 120) {
    const ext = '.html';
    const maxBaseLength = 120 - ext.length;
    baseName = baseName.slice(0, maxBaseLength) + ext;
  }
  return baseName;
}

function createRandomId(prefix) {
  const base = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${base}${random}`;
}

function truncateText(value, maxLength = 80) {
  if (!value) {
    return '';
  }
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, Math.max(0, maxLength - 3)) + '...';
}

function normalizeStatusValue(value) {
  if (value === undefined || value === null) {
    return STATUS_DEFAULT;
  }
  const stringValue = value.toString().trim();
  if (!stringValue) {
    return STATUS_DEFAULT;
  }
  if (STATUS_OPTIONS.includes(stringValue)) {
    return stringValue;
  }
  const lower = stringValue.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(STATUS_VALUE_ALIASES, lower)) {
    return STATUS_VALUE_ALIASES[lower];
  }
  if (Object.prototype.hasOwnProperty.call(STATUS_VALUE_ALIASES, stringValue)) {
    return STATUS_VALUE_ALIASES[stringValue];
  }
  return stringValue;
}

function toFiniteNumber(value) {
  if (Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.replace(/%/g, '').trim();
    if (!trimmed) {
      return 0;
    }
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function deriveStatusFromProgress(progress, planned) {
  if (progress === null || progress === undefined || progress === '') {
    return null;
  }
  const numericProgress = Number(progress);
  if (!Number.isFinite(numericProgress)) {
    return null;
  }
  if (numericProgress >= 100) {
    return '완료';
  }
  const plannedNumeric = toFiniteNumber(planned);
  if (plannedNumeric > 0 && numericProgress < plannedNumeric) {
    return '지연';
  }
  if (numericProgress <= 0) {
    if (plannedNumeric > 0) {
      return '지연';
    }
    return '대기중';
  }
  if (numericProgress > 0 && numericProgress < 100) {
    return '작업중';
  }
  return null;
}

function getFieldValue(source, key) {
  if (!source || typeof source !== 'object') {
    return '';
  }
  if (Object.prototype.hasOwnProperty.call(source, key)) {
    return source[key];
  }
  const field = FIELD_DEFS_BY_KEY[key] || FIELD_DEFS.find(def => def.key === key);
  if (!field) {
    return '';
  }
  const candidates = getCandidateKeys(field);
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    if (Object.prototype.hasOwnProperty.call(source, candidate)) {
      return source[candidate];
    }
    const compressed = candidate.replace(/\s+/g, '');
    if (compressed && Object.prototype.hasOwnProperty.call(source, compressed)) {
      return source[compressed];
    }
  }
  return '';
}

function normalizeDate(value, contextLabel, fieldLabel) {
  const label = contextLabel ? `${contextLabel}: ` : '';
  if (value === null || value === undefined || value === '') {
    throw new Error(`${label}${fieldLabel}가 비어 있습니다.`);
  }
  const trimmed = value.toString().trim();
  const match = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  const parsedDate = new Date(trimmed);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${label}${fieldLabel} 형식이 올바르지 않습니다.`);
  }
  return parsedDate.toISOString().slice(0, 10);
}

function normalizeOptionalDate(value, contextLabel, fieldLabel) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return normalizeDate(value, contextLabel, fieldLabel);
}

function normalizeProgress(value, contextLabel) {
  const label = contextLabel ? `${contextLabel}: ` : '';
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const numeric =
    typeof value === 'number'
      ? value
      : Number(value.toString().replace(/%/g, '').trim());
  if (!Number.isFinite(numeric)) {
    throw new Error(`${label}Progress 값이 숫자가 아닙니다.`);
  }
  return Math.min(Math.max(Math.round(numeric), 0), 100);
}

function normalizeCostEstimate(value, contextLabel) {
  const label = contextLabel ? `${contextLabel}: ` : '';
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`${label}Cost Estimate는 숫자여야 합니다.`);
    }
    return value;
  }
  const trimmed = value.toString().replace(/,/g, '').trim();
  if (!trimmed) {
    return null;
  }
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    throw new Error(`${label}Cost Estimate는 숫자여야 합니다.`);
  }
  return numeric;
}

function normalizeDurationValue(value, contextLabel) {
  const label = contextLabel ? `${contextLabel}: ` : '';
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`${label}Duration 값이 올바르지 않습니다.`);
  }
  return numeric;
}

function normalizePlannedValue(value, contextLabel) {
  const label = contextLabel ? `${contextLabel}: ` : '';
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
    throw new Error(`${label}Planned 값이 0에서 100 사이의 숫자가 아닙니다.`);
  }
  return numeric;
}

function normalizeWeightValue(value, contextLabel) {
  const label = contextLabel ? `${contextLabel}: ` : '';
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const numeric =
    typeof value === 'number'
      ? value
      : Number(value.toString().replace(/%/g, '').trim());
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new Error(`${label}Weight 값이 올바르지 않습니다.`);
  }
  return numeric;
}

function computeLevelFromWbsId(wbsId) {
  const normalized = sanitizeString(wbsId);
  if (!normalized) return 0;
  const separators = normalized.match(/[-.]/g);
  return (separators ? separators.length : 0) + 1;
}

function normalizeLevel(value, wbsId, contextLabel) {
  const label = contextLabel ? `${contextLabel}: ` : '';
  if (value === null || value === undefined || value === '') {
    const derived = computeLevelFromWbsId(wbsId);
    if (derived <= 0) {
      throw new Error(`${label}Level 값을 계산할 수 없습니다.`);
    }
    return derived;
  }
  const numeric = Number.parseInt(value, 10);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new Error(`${label}Level 값이 올바르지 않습니다.`);
  }
  return numeric;
}

function deriveParentFromWbsId(wbsId) {
  const normalized = sanitizeString(wbsId);
  if (!normalized) {
    return '';
  }
  const hyphenIndex = normalized.lastIndexOf('-');
  const dotIndex = normalized.lastIndexOf('.');
  const delimiterIndex = Math.max(hyphenIndex, dotIndex);
  if (delimiterIndex === -1) {
    return '';
  }
  return normalized.substring(0, delimiterIndex);
}

function normalizeExtendedRecord(source, contextLabel) {
  const labelPrefix = contextLabel ? `${contextLabel}: ` : '';
  const wbsId = sanitizeString(getFieldValue(source, 'wbsId'));
  if (!wbsId) {
    throw new Error(`${labelPrefix}WBS ID가 비어 있습니다.`);
  }
  const taskName = sanitizeString(getFieldValue(source, 'taskName'));
  if (!taskName) {
    throw new Error(`${labelPrefix}Task Name이 비어 있습니다.`);
  }
  const level = normalizeLevel(getFieldValue(source, 'level'), wbsId, contextLabel);
  let parentWbsId = sanitizeString(getFieldValue(source, 'parentWbsId'));
  const derivedParent = deriveParentFromWbsId(wbsId);
  if (!parentWbsId) {
    parentWbsId = derivedParent;
  }
  const startDate = normalizeDate(getFieldValue(source, 'startDate'), contextLabel, 'Start Date');
  const endDate = normalizeDate(getFieldValue(source, 'endDate'), contextLabel, 'End Date');
  if (startDate > endDate) {
    throw new Error(`${labelPrefix}Start Date가 End Date보다 늦습니다.`);
  }
  const duration = normalizeDurationValue(getFieldValue(source, 'duration'), contextLabel);
  const progress = normalizeProgress(getFieldValue(source, 'progress'), contextLabel);
  const planned = normalizePlannedValue(getFieldValue(source, 'planned'), contextLabel);
  const owner = sanitizeString(getFieldValue(source, 'owner'));
  const costEstimate = normalizeCostEstimate(getFieldValue(source, 'costEstimate'), contextLabel);
  const priority = sanitizeString(getFieldValue(source, 'priority'));
  const weight = normalizeWeightValue(getFieldValue(source, 'weight'), contextLabel);
  const statusValue = sanitizeString(getFieldValue(source, 'status'));
  const normalizedStatus = normalizeStatusValue(statusValue);
  const derivedStatus = deriveStatusFromProgress(progress, planned);
  const finalStatus = derivedStatus || normalizedStatus;
  const deliverable = sanitizeString(getFieldValue(source, 'deliverable'));
  const acceptanceCriteria = sanitizeString(getFieldValue(source, 'acceptanceCriteria'));
  const reviewDate = normalizeOptionalDate(
    getFieldValue(source, 'reviewDate'),
    contextLabel,
    'Review Date'
  );

  return {
    wbsId,
    taskName,
    level,
    parentWbsId: parentWbsId || '',
    startDate,
    endDate,
    duration,
    progress,
    planned,
    owner,
    costEstimate,
    priority,
    weight,
    status: finalStatus,
    deliverable,
    acceptanceCriteria,
    reviewDate
  };
}

function normalizeLegacyRecord(source, contextLabel) {
  if (!source || typeof source !== 'object') {
    throw new Error(`${contextLabel}: 작업 데이터를 해석할 수 없습니다.`);
  }
  const fallbackId = sanitizeString(
    source.wbsId !== undefined ? source.wbsId : source.id
  );
  const legacyRow = {
    wbsId: fallbackId,
    taskName: sanitizeString(
      source.taskName !== undefined
        ? source.taskName
        : source.name !== undefined
        ? source.name
        : fallbackId
    ),
    level: source.level,
    parentWbsId:
      source.parentWbsId !== undefined && source.parentWbsId !== null
        ? source.parentWbsId
        : source.parentId !== undefined && source.parentId !== null
        ? source.parentId
        : source.parent !== undefined && source.parent !== null
        ? source.parent
        : '',
    startDate: source.startDate !== undefined ? source.startDate : source.start,
    endDate: source.endDate !== undefined ? source.endDate : source.end,
    duration: source.duration !== undefined ? source.duration : '',
    progress: source.progress,
    owner: source.owner,
    costEstimate: source.costEstimate,
    priority: source.priority,
    planned: source.planned,
    weight: source.weight,
    status: source.status,
    deliverable: source.deliverable,
    acceptanceCriteria:
      source.acceptanceCriteria !== undefined
        ? source.acceptanceCriteria
        : source.acceptance,
    reviewDate: source.reviewDate
  };
  return normalizeExtendedRecord(legacyRow, contextLabel);
}

function escapeCsv(value) {
  const stringValue = (value ?? '').toString();
  const needsQuotes = /[",\n]/.test(stringValue);
  let escaped = stringValue.replace(/"/g, '""');
  if (needsQuotes) {
    escaped = `"${escaped}"`;
  }
  return escaped;
}

function rowsToCsv(rows) {
  const header = FIELD_DEFS.map(field => field.header);
  const csvLines = [header.join(',')];
  rows.forEach(row => {
    const line = FIELD_DEFS.map(field => {
      let value = row ? row[field.key] : '';
      if (field.key === 'progress') {
        value = Number.isFinite(value) ? value : '';
      } else if (field.key === 'reviewDate') {
        value = value || '';
      }
      if (value === undefined || value === null) {
        value = '';
      }
      return escapeCsv(value);
    }).join(',');
    csvLines.push(line);
  });
  return csvLines.join('\r\n');
}

function parseCsvRecords(csvText) {
  const content = csvText.replace(/^\uFEFF/, '');
  const rows = [];
  let current = '';
  let row = [];
  let insideQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    if (char === '"') {
      if (insideQuotes && content[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }
    if (char === ',' && !insideQuotes) {
      row.push(current);
      current = '';
      continue;
    }
    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && content[i + 1] === '\n') {
        i += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
      continue;
    }
    current += char;
  }
  if (insideQuotes) {
    throw new Error('CSV 구문 오류: 닫히지 않은 따옴표가 있습니다.');
  }
  row.push(current);

  const isLastRowEmpty = row.every(cell => !cell || !cell.trim());
  if (!isLastRowEmpty || rows.length === 0) {
    rows.push(row);
  }
  return rows;
}

function parseCsvToRows(csvText) {
  const records = parseCsvRecords(csvText);
  while (records.length && records[0].every(cell => !cell || !cell.trim())) {
    records.shift();
  }
  if (!records.length) {
    return [];
  }

  const headers = records[0].map(header => header.trim().toLowerCase());
  const headerMap = new Map();
  headers.forEach((header, index) => {
    if (header) {
      headerMap.set(header, index);
    }
  });

  const requiredFields = FIELD_DEFS.filter(field => !field.optional);
  const hasExtendedHeaders = requiredFields.every(
    field => findHeaderIndex(headerMap, field) !== undefined
  );
  const hasLegacyHeaders = LEGACY_HEADERS.every(header => headerMap.has(header));
  if (!hasExtendedHeaders && !hasLegacyHeaders) {
    const missingExtended = requiredFields.filter(
      field => findHeaderIndex(headerMap, field) === undefined
    );
    const missingLegacy = LEGACY_HEADERS.filter(header => !headerMap.has(header));
    const missing =
      missingExtended.length && missingLegacy.length
        ? missingExtended.map(field => field.header)
        : missingExtended.length
        ? missingExtended.map(field => field.header)
        : missingLegacy;
    throw new Error('필수 헤더가 누락되었습니다: ' + missing.join(', '));
  }

  const rows = [];
  for (let i = 1; i < records.length; i += 1) {
    const record = records[i];
    if (hasExtendedHeaders) {
      const fieldValues = {};
      let hasData = false;
      FIELD_DEFS.forEach(field => {
        const idx = findHeaderIndex(headerMap, field);
        const value = idx !== undefined ? record[idx] ?? '' : '';
        fieldValues[field.header] = value;
        if (
          !hasData &&
          value !== null &&
          value !== undefined &&
          value.toString().trim()
        ) {
          hasData = true;
        }
      });
      if (!hasData) {
        continue;
      }
      const normalized = normalizeExtendedRecord(fieldValues, `CSV ${i + 1}`);
      rows.push(normalized);
    } else {
      const idx = headerMap.get('task id');
      const taskIdValue = idx !== undefined ? record[idx] : '';
      if (!taskIdValue || !taskIdValue.toString().trim()) {
        const remaining = LEGACY_HEADERS.filter(header => {
          const headerIdx = headerMap.get(header);
          const value = headerIdx !== undefined ? record[headerIdx] : '';
          return value && value.toString().trim();
        });
        if (!remaining.length) {
          continue;
        }
      }
      const normalized = normalizeLegacyRecord(
        {
          id: record[headerMap.get('task id')] ?? '',
          name: record[headerMap.get('task description')] ?? '',
          start: record[headerMap.get('start date')] ?? '',
          end: record[headerMap.get('end date')] ?? '',
          owner: record[headerMap.get('owner')] ?? '',
          progress: record[headerMap.get('progress')] ?? ''
        },
        `CSV ${i + 1}`
      );
      rows.push(normalized);
    }
  }

  return rows;
}

function normalizeJsonRows(rawRows) {
  if (!Array.isArray(rawRows)) {
    throw new Error('JSON 데이터 구조가 올바르지 않습니다.');
  }
  return rawRows.map((row, index) => {
    const context = `JSON ${index + 1}`;
    if (row && typeof row === 'object') {
      const hasExtendedKey =
        FIELD_DEFS.some(field => Object.prototype.hasOwnProperty.call(row, field.key)) ||
        FIELD_DEFS.some(field => Object.prototype.hasOwnProperty.call(row, field.header));
      if (hasExtendedKey) {
        return normalizeExtendedRecord(row, context);
      }
    }
    return normalizeLegacyRecord(row, context);
  });
}

function normalizeChatSessions(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map(session => {
      if (!session || typeof session !== 'object') {
        return null;
      }
      const id = session.id ? sanitizeString(session.id) : createRandomId('chat');
      const title = sanitizeString(session.title) || '제목 없는 대화';
      const createdAt =
        session.createdAt && !Number.isNaN(Date.parse(session.createdAt))
          ? session.createdAt
          : new Date().toISOString();
      const updatedAt =
        session.updatedAt && !Number.isNaN(Date.parse(session.updatedAt))
          ? session.updatedAt
          : createdAt;
      const messages = Array.isArray(session.messages)
        ? session.messages
            .map(message => {
              if (!message || typeof message !== 'object') {
                return null;
              }
              const content = sanitizeString(message.content);
              if (!content) {
                return null;
              }
              const role = message.role === 'user' ? 'user' : 'assistant';
              const created =
                message.createdAt && !Number.isNaN(Date.parse(message.createdAt))
                  ? message.createdAt
                  : new Date().toISOString();
              return {
                id: message.id ? sanitizeString(message.id) : createRandomId('msg'),
                role,
                content,
                createdAt: created
              };
            })
            .filter(Boolean)
        : [];
      return {
        id,
        title,
        createdAt,
        updatedAt,
        messages
      };
    })
    .filter(Boolean);
}

async function readChatSessions(projectDir) {
  const chatPath = path.join(projectDir, CHAT_FILENAME);
  try {
    const raw = await fs.promises.readFile(chatPath, 'utf8');
    const parsed = JSON.parse(raw);
    const sessionsSource = Array.isArray(parsed && parsed.sessions) ? parsed.sessions : parsed;
    return normalizeChatSessions(sessionsSource);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`채팅 데이터를 읽는 중 오류 발생 (${chatPath}):`, error);
    }
    return [];
  }
}

async function writeChatSessions(projectDir, sessions) {
  await fs.promises.mkdir(projectDir, { recursive: true });
  const chatPath = path.join(projectDir, CHAT_FILENAME);
  const payload = {
    updatedAt: new Date().toISOString(),
    sessions
  };
  await fs.promises.writeFile(chatPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function summarizeChatSession(session) {
  if (!session) {
    return null;
  }
  const messageCount = Array.isArray(session.messages) ? session.messages.length : 0;
  const lastMessage =
    messageCount > 0 ? session.messages[messageCount - 1] : null;
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messageCount,
    preview: lastMessage ? truncateText(lastMessage.content || '', 80) : ''
  };
}


async function buildToolResponseMessages(toolCalls, projectDir, cachedRows) {
  if (!Array.isArray(toolCalls) || !toolCalls.length) {
    return [];
  }
  const responses = [];
  let rows = cachedRows;
  
  for (const call of toolCalls) {
    if (!call || !call.function) {
      continue;
    }
    
    let args = {};
    if (call.function.arguments) {
      try {
        args = JSON.parse(call.function.arguments);
      } catch (error) {
        args = { parseError: String(error) };
      }
    }
    
    let content;
    
    if (call.function.name === 'load_project_data') {
      // 프로젝트 데이터 로드
      if (!rows) {
        try {
          rows = await readProjectRows(projectDir);
        } catch (error) {
          console.warn('프로젝트 데이터를 불러오는 중 오류', error);
          rows = [];
        }
      }
      const payload = executeLoadProjectData(args, rows);
      content = JSON.stringify(payload);
    } else {
      content = JSON.stringify({ error: '알 수 없는 함수 호출입니다.' });
    }
    
    responses.push({
      tool_call_id: call.id,
      role: 'tool',
      name: call.function.name,
      content
    });
  }
  
  return responses;
}

async function writeProjectRows(projectDir, rows) {
  return withProjectLock(projectDir, async () => writeProjectRowsUnlocked(projectDir, rows));
}

async function writeProjectRowsUnlocked(projectDir, rows) {
  await fs.promises.mkdir(projectDir, { recursive: true });
  const jsonPath = path.join(projectDir, JSON_FILENAME);
  const csvPath = path.join(projectDir, CSV_FILENAME);
  const payload = {
    updatedAt: new Date().toISOString(),
    rows
  };
  await writeFileAtomic(jsonPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  const csvContent = rowsToCsv(rows);
  await writeFileAtomic(csvPath, '\uFEFF' + csvContent, 'utf8');
  try {
    await writeTaskIndex(projectDir, rows);
  } catch (error) {
    console.warn('Failed to update task index', error);
  }
}

async function readProjectRows(projectDir) {
  return withProjectLock(projectDir, async () => readProjectRowsUnlocked(projectDir));
}

async function readProjectRowsUnlocked(projectDir) {
  const jsonPath = path.join(projectDir, JSON_FILENAME);
  try {
    const rawJson = await fs.promises.readFile(jsonPath, 'utf8');
    const parsed = JSON.parse(rawJson);
    const rawRows = parsed && Array.isArray(parsed.rows) ? parsed.rows : parsed;
    const rows = normalizeJsonRows(rawRows);
    if (Array.isArray(rawRows)) {
      const rawSnapshot = JSON.stringify(rawRows);
      const normalizedSnapshot = JSON.stringify(rows);
      if (rawSnapshot !== normalizedSnapshot) {
        await writeProjectRowsUnlocked(projectDir, rows);
      }
    }
    return rows;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`JSON 데이터를 읽는 중 오류 발생 (${jsonPath}):`, error);
    }
  }

  const csvPath = path.join(projectDir, CSV_FILENAME);
  try {
    const rawCsv = await fs.promises.readFile(csvPath, 'utf8');
    const rows = parseCsvToRows(rawCsv);
    await writeProjectRowsUnlocked(projectDir, rows);
    return rows;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('프로젝트 데이터를 찾을 수 없습니다.');
    }
    throw error;
  }
}

async function initializeProjectFiles(projectDir) {
  let rows = [];
  try {
    const sampleCsv = await fs.promises.readFile(DEFAULT_CSV_PATH, 'utf8');
    rows = parseCsvToRows(sampleCsv);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('샘플 CSV를 읽는 중 오류가 발생했습니다.', error);
    }
    rows = [];
  }
  await writeProjectRows(projectDir, rows);
  await writeChatSessions(projectDir, []);
}

async function handleApi(req, res, url) {
  await ensureProjectsRoot();
  const segments = url.pathname.split('/').filter(Boolean);

  if (segments.length === 2) {
    if (req.method === 'GET') {
      try {
        const dirents = await fs.promises.readdir(PROJECTS_DIR, { withFileTypes: true });
        const projects = await Promise.all(
          dirents
            .filter(entry => entry.isDirectory())
            .map(async entry => {
              const projectDir = path.join(PROJECTS_DIR, entry.name);
              const csvPath = path.join(projectDir, CSV_FILENAME);
              const jsonPath = path.join(projectDir, JSON_FILENAME);
              const hasCsv = await fs.promises
                .access(csvPath)
                .then(() => true)
                .catch(() => false);
              const hasJson = await fs.promises
                .access(jsonPath)
                .then(() => true)
                .catch(() => false);
              return { name: entry.name, hasCsv, hasJson };
            })
        );
        sendJson(res, 200, { projects });
      } catch (error) {
        console.error('Failed to list projects', error);
        sendJson(res, 500, { message: '프로젝트 목록을 불러오지 못했습니다.' });
      }
      return;
    }

    if (req.method === 'POST') {
      try {
        const body = await readRequestBody(req);
        let parsed;
        try {
          parsed = JSON.parse(body || '{}');
        } catch {
          sendJson(res, 400, { message: 'JSON 형식이 올바르지 않습니다.' });
          return;
        }
        const desiredName = typeof parsed.name === 'string' ? parsed.name.trim() : '';
        if (!isValidProjectName(desiredName)) {
          sendJson(res, 400, { message: '프로젝트 이름이 올바르지 않습니다.' });
          return;
        }
        const projectDir = path.join(PROJECTS_DIR, desiredName);
        try {
          await fs.promises.mkdir(projectDir, { recursive: false });
        } catch (error) {
          if (error.code === 'EEXIST') {
            sendJson(res, 409, { message: '이미 존재하는 프로젝트입니다.' });
          } else {
            console.error('Failed to create project directory', error);
            sendJson(res, 500, { message: '프로젝트를 생성하지 못했습니다.' });
          }
          return;
        }
        await initializeProjectFiles(projectDir);
        sendJson(res, 201, { name: desiredName });
      } catch (error) {
        console.error('Failed to create project', error);
        sendJson(res, 500, { message: '프로젝트를 생성하지 못했습니다.' });
      }
      return;
    }

    sendJson(res, 405, { message: '허용되지 않은 요청입니다.' });
    return;
  }

  if (segments.length >= 4 && segments[2]) {
    const projectName = decodeURIComponent(segments[2]);
    if (!isValidProjectName(projectName)) {
      sendJson(res, 400, { message: '프로젝트 이름이 올바르지 않습니다.' });
      return;
    }
    const projectDir = path.join(PROJECTS_DIR, projectName);

    if (segments[3] === 'data') {
      if (req.method === 'GET') {
        try {
          await fs.promises.access(projectDir);
        } catch {
          sendJson(res, 404, { message: '프로젝트를 찾을 수 없습니다.' });
          return;
        }
        try {
          const rows = await readProjectRows(projectDir);
          sendJson(res, 200, { project: projectName, rows });
        } catch (error) {
          console.error('Failed to load project data', error);
          sendJson(res, 500, { message: error.message || '프로젝트 데이터를 불러오지 못했습니다.' });
        }
        return;
      }

      if (req.method === 'PUT') {
        try {
          await fs.promises.access(projectDir);
        } catch {
          sendJson(res, 404, { message: '프로젝트를 찾을 수 없습니다.' });
          return;
        }
        try {
          const body = await readRequestBody(req);
          if (!body) {
            sendJson(res, 400, { message: '저장할 JSON 내용이 비어 있습니다.' });
            return;
          }
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            sendJson(res, 400, { message: 'JSON 형식이 올바르지 않습니다.' });
            return;
          }
          const rows = normalizeJsonRows(parsed && parsed.rows ? parsed.rows : parsed);
          await writeProjectRows(projectDir, rows);
          sendJson(res, 200, { message: '프로젝트 데이터를 저장했습니다.' });
        } catch (error) {
          console.error('Failed to save project JSON', error);
          sendJson(res, 500, { message: error.message || '프로젝트 데이터를 저장하지 못했습니다.' });
        }
        return;
      }

      sendJson(res, 405, { message: '허용되지 않은 요청입니다.' });
      return;
    }

    if (segments[3] === 'task-search') {
      if (req.method !== 'GET') {
        sendJson(res, 405, { message: '허용되지 않은 요청입니다.' });
        return;
      }
      try {
        await fs.promises.access(projectDir);
      } catch {
        sendJson(res, 404, { message: '프로젝트를 찾을 수 없습니다.' });
        return;
      }
      const url = new URL(req.url, `http://${req.headers.host}`);
      const query = sanitizeString(url.searchParams.get('q') || url.searchParams.get('query'));
      const limitParam = Number.parseInt(url.searchParams.get('limit') || '0', 10);
      const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 5, 1), 15);
      if (!query) {
        sendJson(res, 400, { message: '검색 질의를 입력하세요.' });
        return;
      }
      try {
        const indexItems = await readTaskIndex(projectDir, () => readProjectRows(projectDir));
        const matches = searchTaskIndex(indexItems, query, { limit });
        sendJson(res, 200, { query, limit, matches });
      } catch (error) {
        console.error('Failed to search task index', error);
        sendJson(res, 500, { message: error.message || '작업 검색에 실패했습니다.' });
      }
      return;
    }

    if (segments[3] === 'report') {
      if (req.method !== 'POST') {
        sendJson(res, 405, { message: '허용되지 않은 요청입니다.' });
        return;
      }
      try {
        await fs.promises.access(projectDir);
      } catch {
        sendJson(res, 404, { message: '프로젝트를 찾을 수 없습니다.' });
        return;
      }
      try {
        const body = await readRequestBody(req);
        let parsed;
        try {
          parsed = JSON.parse(body || '{}');
        } catch {
          sendJson(res, 400, { message: 'JSON 형식이 올바르지 않습니다.' });
          return;
        }
        const html = typeof parsed.html === 'string' ? parsed.html : '';
        if (!html.trim()) {
          sendJson(res, 400, { message: '리포트 내용이 비어 있습니다.' });
          return;
        }
        const requestedFileName = typeof parsed.fileName === 'string' ? parsed.fileName : '';
        const fileName = sanitizeReportFileName(requestedFileName);
        if (!fileName) {
          sendJson(res, 400, { message: '리포트 파일 이름이 올바르지 않습니다.' });
          return;
        }
        const reportsDir = path.join(projectDir, 'reports');
        await fs.promises.mkdir(reportsDir, { recursive: true });
        await clearReportFiles(reportsDir);
        const reportPath = path.join(reportsDir, fileName);
        await writeFileAtomic(reportPath, html, 'utf8');
        const encodedProject = encodeURIComponent(projectName);
        const encodedFile = encodeURIComponent(fileName);
        const publicUrl = `/projects/${encodedProject}/reports/${encodedFile}`;
        sendJson(res, 200, {
          message: '리포트를 저장했습니다.',
          fileName,
          url: publicUrl
        });
      } catch (error) {
        console.error('Failed to save report', error);
        sendJson(res, 500, { message: error.message || '리포트를 저장하지 못했습니다.' });
      }
      return;
    }

    if (segments[3] === 'chats') {
      try {
        await fs.promises.access(projectDir);
      } catch {
        sendJson(res, 404, { message: '프로젝트를 찾을 수 없습니다.' });
        return;
      }
      if (segments.length === 4) {
        if (req.method === 'GET') {
          try {
            const sessions = await readChatSessions(projectDir);
            const summaries = sessions
              .slice()
              .sort((a, b) => {
                const aTime = Date.parse(a.updatedAt || '') || 0;
                const bTime = Date.parse(b.updatedAt || '') || 0;
                return bTime - aTime;
              })
              .map(summarizeChatSession)
              .filter(Boolean);
            sendJson(res, 200, { sessions: summaries });
          } catch (error) {
            console.error('Failed to load chat sessions', error);
            sendJson(res, 500, { message: '채팅 기록을 불러오지 못했습니다.' });
          }
          return;
        }
        if (req.method === 'POST') {
          try {
            const body = await readRequestBody(req);
            let parsed;
            try {
              parsed = JSON.parse(body || '{}');
            } catch {
              sendJson(res, 400, { message: 'JSON 형식이 올바르지 않습니다.' });
              return;
            }
            const rawTitle = sanitizeString(parsed.title);
            const now = new Date().toISOString();
            const title = (rawTitle || '새 대화 ' + now.slice(0, 10)).slice(0, 80);
            const sessions = await readChatSessions(projectDir);
            const newSession = {
              id: createRandomId('chat'),
              title,
              createdAt: now,
              updatedAt: now,
              messages: []
            };
            sessions.unshift(newSession);
            await writeChatSessions(projectDir, sessions);
            sendJson(res, 201, { session: newSession });
          } catch (error) {
            console.error('Failed to create chat session', error);
            sendJson(res, 500, { message: '새 대화를 만들지 못했습니다.' });
          }
          return;
        }
        sendJson(res, 405, { message: '허용되지 않은 요청입니다.' });
        return;
      }
      if (segments.length >= 5 && segments[4]) {
        const chatId = decodeURIComponent(segments[4]);
        if (req.method === 'GET') {
          try {
            const sessions = await readChatSessions(projectDir);
            const session = sessions.find(item => item.id === chatId);
            if (!session) {
              sendJson(res, 404, { message: '대화를 찾을 수 없습니다.' });
              return;
            }
            sendJson(res, 200, { session });
          } catch (error) {
            console.error('Failed to load chat conversation', error);
            sendJson(res, 500, { message: '대화를 불러오지 못했습니다.' });
          }
          return;
        }
        if (req.method === 'DELETE') {
          try {
            const sessions = await readChatSessions(projectDir);
            const sessionIndex = sessions.findIndex(item => item.id === chatId);
            if (sessionIndex === -1) {
              sendJson(res, 404, { message: '대화를 찾을 수 없습니다.' });
              return;
            }
            sessions.splice(sessionIndex, 1);
            await writeChatSessions(projectDir, sessions);
            sendJson(res, 200, { message: '대화를 삭제했습니다.' });
          } catch (error) {
            console.error('Failed to delete chat session', error);
            sendJson(res, 500, { message: '대화를 삭제하지 못했습니다.' });
          }
          return;
        }
        if (segments.length >= 6 && segments[5] === 'messages' && req.method === 'POST') {
          try {
            const body = await readRequestBody(req);
            let parsed;
            try {
              parsed = JSON.parse(body || '{}');
            } catch {
              sendJson(res, 400, { message: 'JSON 형식이 올바르지 않습니다.' });
              return;
            }
            const content = sanitizeString(parsed.content);
            if (!content) {
              sendJson(res, 400, { message: '메시지 내용을 입력하세요.' });
              return;
            }
            if (!isConfigured()) {
              sendJson(res, 503, { message: 'LLM API 키가 설정되지 않았습니다.' });
              return;
            }
            const sessions = await readChatSessions(projectDir);
            const sessionIndex = sessions.findIndex(item => item.id === chatId);
            if (sessionIndex === -1) {
              sendJson(res, 404, { message: '대화를 찾을 수 없습니다.' });
              return;
            }
            const now = new Date().toISOString();
            const userMessage = {
              id: createRandomId('msg'),
              role: 'user',
              content,
              createdAt: now
            };
            const session = sessions[sessionIndex];
            const existingMessages = Array.isArray(session.messages) ? session.messages.slice() : [];
            const historyMessages = existingMessages
              .map(message => ({
                role: message.role === 'assistant' ? 'assistant' : 'user',
                content: sanitizeString(message.content)
              }))
              .filter(item => item.content);
            const baseMessages = [...historyMessages, { role: 'user', content }];

            let assistantContent = '';
            let firstResponse;
            try {
              firstResponse = await createChatCompletion(baseMessages, {
                stream: false,
                tools: CHAT_TOOL_DEFINITIONS,
                tool_choice: 'auto'
              });
            } catch (error) {
              throw new Error(error.message || 'LLM 호출에 실패했습니다.');
            }
            const initialMessages = Array.isArray(firstResponse.messages)
              ? firstResponse.messages.slice()
              : baseMessages.slice();
            const responseMessage = firstResponse.message;
            const toolCalls = responseMessage && responseMessage.tool_calls;
            let conversationContext = initialMessages;
            if (responseMessage && Array.isArray(toolCalls) && toolCalls.length) {
              conversationContext.push(responseMessage);
            }
            let projectRowsCache = null;
            async function ensureProjectRows() {
              if (!projectRowsCache) {
                try {
                  projectRowsCache = await readProjectRows(projectDir);
                } catch (error) {
                  console.warn('프로젝트 WBS를 불러오는 중 오류가 발생했습니다.', error);
                  projectRowsCache = [];
                }
              }
              return projectRowsCache;
            }
            async function appendToolResponses(calls) {
              if (!Array.isArray(calls) || !calls.length) {
                return [];
              }
              const responses = await buildToolResponseMessages(
                calls,
                projectDir,
                projectRowsCache
              );
              conversationContext = conversationContext.concat(responses);
              return responses;
            }
            function extractTaskNamesFromSearchResponses(responses, max = 3) {
              if (!Array.isArray(responses)) {
                return [];
              }
              const names = [];
              responses.forEach(response => {
                if (response && response.name === 'search_project_tasks') {
                  try {
                    const payload = JSON.parse(response.content || '{}');
                    const matches = Array.isArray(payload.matches) ? payload.matches : [];
                    matches.forEach(match => {
                      if (names.length >= max) {
                        return;
                      }
                      if (match && match.taskName) {
                        names.push(match.taskName);
                      }
                    });
                  } catch (error) {
                    console.warn('검색 응답 파싱 실패', error);
                  }
                }
              });
              return names;
            }

            async function requestTaskDetails(taskNames) {
              const uniqueNames = Array.from(new Set(taskNames.filter(Boolean)));
              if (!uniqueNames.length) {
                return;
              }
              await ensureProjectRows();
              const detailCall = {
                id: createRandomId('tool'),
                function: {
                  name: 'get_project_tasks',
                  arguments: JSON.stringify({ taskNames: uniqueNames })
                }
              };
              conversationContext.push({
                role: 'assistant',
                content: null,
                tool_calls: [detailCall]
              });
              await appendToolResponses([detailCall]);
            }

            async function buildFallbackToolCalls() {
              const searchArgs = {
                query: content,
                limit: 5
              };
              const searchCall = {
                id: createRandomId('tool'),
                function: {
                  name: 'search_project_tasks',
                  arguments: JSON.stringify(searchArgs)
                }
              };
              conversationContext.push({
                role: 'assistant',
                content: null,
                tool_calls: [searchCall]
              });
              const searchResponses = await appendToolResponses([searchCall]);
              const detailNames = extractTaskNamesFromSearchResponses(searchResponses);
              await requestTaskDetails(detailNames);
            }

            // LLM의 Tool 사용 판단 결과 처리
            const firstContent = sanitizeString(firstResponse && firstResponse.content);
            if (!toolCalls || !toolCalls.length) {
              // LLM이 Tool을 사용하지 않기로 판단한 경우
              if (firstContent) {
                // 직접 답변이 있으면 그대로 사용 (LLM의 판단 신뢰)
                assistantContent = firstContent;
                const assistantMessage = {
                  id: createRandomId('msg'),
                  role: 'assistant',
                  content: assistantContent,
                  createdAt: new Date().toISOString()
                };
                session.messages = existingMessages;
                session.messages.push(userMessage, assistantMessage);
                session.updatedAt = assistantMessage.createdAt;
                await writeChatSessions(projectDir, sessions);
                sendJson(res, 201, { session });
                return;
              } else {
                // 답변도 없고 Tool도 없으면 문제 상황 - 에러 처리
                throw new Error('LLM이 답변을 생성하지 못했습니다.');
              }
            } else {
              // Tool 호출이 있는 경우 처리
              const toolResponses = await buildToolResponseMessages(
                toolCalls,
                projectDir,
                projectRowsCache
              );
              conversationContext = conversationContext.concat(toolResponses);
              const hasDetailCall = toolCalls.some(
                call => call && call.function && call.function.name === 'get_project_tasks'
              );
              const hasSearchCall = toolCalls.some(
                call => call && call.function && call.function.name === 'search_project_tasks'
              );
              if (!hasDetailCall && hasSearchCall) {
                const detailNames = extractTaskNamesFromSearchResponses(toolResponses);
                await requestTaskDetails(detailNames);
              }
            }

            const secondResponse = await createChatCompletion(conversationContext, {
              stream: false,
              skipSystemPrompt: true
            });
            assistantContent = sanitizeString(secondResponse && secondResponse.content);
            if (!assistantContent) {
              if (process.env.DEBUG_LLM === 'true') {
                console.error('[2nd LLM] Empty response! Context length:', conversationContext.length);
              }
              throw new Error('LLM 응답이 비어 있습니다.');
            }
            const assistantMessage = {
              id: createRandomId('msg'),
              role: 'assistant',
              content: assistantContent,
              createdAt: new Date().toISOString()
            };
            session.messages = existingMessages;
            session.messages.push(userMessage, assistantMessage);
            session.updatedAt = assistantMessage.createdAt;
            await writeChatSessions(projectDir, sessions);
            sendJson(res, 201, { session });
          } catch (error) {
            console.error('Failed to append chat message', error);
            sendJson(res, 500, { message: error.message || '메시지를 전송하지 못했습니다.' });
          }
          return;
        }
        sendJson(res, 405, { message: '허용되지 않은 요청입니다.' });
        return;
      }
      sendJson(res, 400, { message: '요청 경로가 올바르지 않습니다.' });
      return;
    }

    if (segments[3] === 'wbs') {
      if (req.method === 'GET') {
        try {
          await fs.promises.access(projectDir);
        } catch {
          sendJson(res, 404, { message: '프로젝트를 찾을 수 없습니다.' });
          return;
        }
        try {
          const rows = await readProjectRows(projectDir);
          const csvContent = '\uFEFF' + rowsToCsv(rows);
          res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8' });
          res.end(csvContent);
        } catch (error) {
          console.error('Failed to stream project CSV', error);
          sendJson(res, 500, { message: error.message || 'CSV를 불러오지 못했습니다.' });
        }
        return;
      }

      if (req.method === 'PUT') {
        try {
          await fs.promises.access(projectDir);
        } catch {
          sendJson(res, 404, { message: '프로젝트를 찾을 수 없습니다.' });
          return;
        }
        try {
          const body = await readRequestBody(req);
          if (!body) {
            sendJson(res, 400, { message: '저장할 CSV 내용이 비어 있습니다.' });
            return;
          }
          const rows = parseCsvToRows(body);
          if (!rows.length) {
            sendJson(res, 400, { message: 'CSV에서 유효한 작업 데이터를 찾지 못했습니다.' });
            return;
          }
          await writeProjectRows(projectDir, rows);
          sendJson(res, 200, { message: '프로젝트 CSV를 저장했습니다.' });
        } catch (error) {
          console.error('Failed to save project CSV', error);
          sendJson(res, 500, { message: error.message || 'CSV 저장에 실패했습니다.' });
        }
        return;
      }

      if (req.method === 'PATCH' && segments.length >= 5 && segments[4]) {
        const wbsId = decodeURIComponent(segments[4]);
        try {
          await fs.promises.access(projectDir);
        } catch {
          sendJson(res, 404, { message: '프로젝트를 찾을 수 없습니다.' });
          return;
        }
        try {
          const body = await readRequestBody(req);
          let parsed;
          try {
            parsed = JSON.parse(body || '{}');
          } catch {
            sendJson(res, 400, { message: 'JSON 형식이 올바르지 않습니다.' });
            return;
          }
          const rows = await readProjectRows(projectDir);
          const rowIndex = rows.findIndex(row => row.wbsId === wbsId);
          if (rowIndex === -1) {
            sendJson(res, 404, { message: '작업을 찾을 수 없습니다.' });
            return;
          }
          const updatedRow = { ...rows[rowIndex] };
          Object.keys(parsed).forEach(key => {
            if (key in updatedRow) {
              updatedRow[key] = parsed[key];
            }
          });
          // 유효성 검사 및 정규화
          let normalizedRow;
          try {
            normalizedRow = normalizeExtendedRecord(updatedRow, '업데이트');
          } catch (error) {
            sendJson(res, 400, { message: error.message });
            return;
          }
          rows[rowIndex] = normalizedRow;
          await writeProjectRows(projectDir, rows);
          sendJson(res, 200, { message: '작업을 업데이트했습니다.' });
        } catch (error) {
          console.error('Failed to update task', error);
          sendJson(res, 500, { message: error.message || '작업 업데이트에 실패했습니다.' });
        }
        return;
      }

      if (req.method === 'DELETE' && segments.length >= 5 && segments[4]) {
        const wbsId = decodeURIComponent(segments[4]);
        try {
          await fs.promises.access(projectDir);
        } catch {
          sendJson(res, 404, { message: '프로젝트를 찾을 수 없습니다.' });
          return;
        }
        try {
          const rows = await readProjectRows(projectDir);
          const rowIndex = rows.findIndex(row => row.wbsId === wbsId);
          if (rowIndex === -1) {
            sendJson(res, 404, { message: '작업을 찾을 수 없습니다.' });
            return;
          }
          rows.splice(rowIndex, 1);
          await writeProjectRows(projectDir, rows);
          sendJson(res, 200, { message: '작업을 삭제했습니다.' });
        } catch (error) {
          console.error('Failed to delete task', error);
          sendJson(res, 500, { message: error.message || '작업 삭제에 실패했습니다.' });
        }
        return;
      }

      sendJson(res, 405, { message: '허용되지 않은 요청입니다.' });
      return;
    }
  }

  sendJson(res, 405, { message: '허용되지 않은 요청입니다.' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/projects')) {
      await handleApi(req, res, url);
      return;
    }

    const requestPath = decodeURIComponent(url.pathname);
    let safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
    if (safePath === '/' || safePath === '') {
      safePath = '/index.html';
    }

    let filePath = path.join(BASE_DIR, safePath);
    let stat;
    try {
      stat = await fs.promises.stat(filePath);
    } catch (error) {
      console.warn(`[${new Date().toISOString()}] 404 Not Found -> ${safePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    console.log(`[${new Date().toISOString()}] 200 OK -> ${safePath}`);

    const stream = fs.createReadStream(filePath);
    stream.on('open', () => {
      res.writeHead(200, { 'Content-Type': contentType });
    });
    stream.on('error', () => {
      console.error(`[${new Date().toISOString()}] 500 Stream Error -> ${safePath}`);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
    });
    stream.pipe(res);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 500 Internal Error`, error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

server.on('error', (error) => {
  if (['EACCES', 'EPERM'].includes(error.code)) {
    console.error(
      `포트 ${PORT}에 접근 권한이 없습니다. 관리자 권한으로 실행하거나 다른 포트를 사용하세요.`
    );
  } else if (error.code === 'EADDRINUSE') {
    console.error(`포트 ${PORT}이(가) 이미 사용 중입니다. 환경 변수 PORT로 다른 포트를 지정하세요.`);
  } else {
    console.error('서버 실행 중 치명적인 오류가 발생했습니다:', error);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`WBS demo server running at http://${PUBLIC_HOST}:${PORT}`);
});
