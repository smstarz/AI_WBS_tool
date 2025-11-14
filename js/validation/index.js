const FIELD_DEFS = [
  { key: 'wbsId', header: 'wbs id', label: 'WBS ID', aliases: ['task id', 'id'] },
  { key: 'taskName', header: 'task name', label: 'Task Name', aliases: ['task description', 'name'] },
  { key: 'level', header: 'level', label: 'Level' },
  {
    key: 'parentWbsId',
    header: 'parent id',
    label: 'Parent ID',
    aliases: ['parent', 'parent wbs id', 'parentwbsid']
  },
  { key: 'startDate', header: 'start date', label: 'Start Date', aliases: ['start'] },
  { key: 'endDate', header: 'end date', label: 'End Date', aliases: ['end'] },
  { key: 'duration', header: 'duration', label: 'Duration' },
  { key: 'progress', header: 'progress', label: 'Progress', aliases: ['completion'] },
  { key: 'planned', header: 'planned', label: 'Planned', optional: true },
  { key: 'owner', header: 'owner', label: 'Owner', aliases: ['resource'] },
  { key: 'costEstimate', header: 'cost estimate', label: 'Cost Estimate', aliases: ['cost'] },
  { key: 'priority', header: 'priority', label: 'Priority' },
  { key: 'weight', header: 'weight', label: 'Weight' },
  { key: 'status', header: 'status', label: 'Status' },
  { key: 'deliverable', header: 'deliverable', label: 'Deliverable' },
  { key: 'acceptanceCriteria', header: 'acceptance criteria', label: 'Acceptance Criteria', aliases: ['acceptance'] },
  { key: 'reviewDate', header: 'review date', label: 'Review' }
];

const FIELD_DEFS_BY_KEY = FIELD_DEFS.reduce((acc, field) => {
  acc[field.key] = field;
  return acc;
}, Object.create(null));

function getFieldNames(field) {
  if (!field) return [];
  const names = new Set();
  if (field.header) names.add(field.header.toLowerCase());
  (field.aliases || []).forEach(alias => {
    if (typeof alias === 'string' && alias.trim()) {
      names.add(alias.trim().toLowerCase());
    }
  });
  return Array.from(names);
}

function resolveFieldValue(normalizedRow, field) {
  if (!normalizedRow || typeof normalizedRow !== 'object') return undefined;
  const names = getFieldNames(field);
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    if (Object.prototype.hasOwnProperty.call(normalizedRow, name)) {
      return normalizedRow[name];
    }
  }
  return undefined;
}

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
  return STATUS_DEFAULT;
}

const PRIORITY_OPTIONS = ['Very High', 'High', 'Medium', 'Low', 'Very Low'];

function normalizePriorityValue(value) {
  if (value === undefined || value === null) {
    return '';
  }
  const stringValue = value.toString().trim();
  if (!stringValue) {
    return '';
  }
  const lower = stringValue.toLowerCase();
  const match = PRIORITY_OPTIONS.find(option => option.toLowerCase() === lower);
  return match || stringValue;
}

function toFiniteNumber(value) {
  if (Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return 0;
    }
    const numeric = Number.parseFloat(trimmed);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeCostEstimateValue(value, contextLabel) {
  const label = contextLabel ? contextLabel + ': ' : '';
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(label + 'Cost Estimate는 숫자여야 합니다.');
    }
    return value;
  }
  const trimmed = value.toString().replace(/,/g, '').trim();
  if (!trimmed) {
    return null;
  }
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    throw new Error(label + 'Cost Estimate는 숫자여야 합니다.');
  }
  return numeric;
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

function coerceString(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return value.toString();
}

function normalizeDate(value, contextLabel, fieldLabel) {
  const label = contextLabel ? contextLabel + ': ' : '';
  if (value === null || value === undefined || value === '') {
    throw new Error(label + fieldLabel + '가 비어 있습니다.');
  }
  const trimmed = value.toString().trim();
  const match = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (match) {
    return [match[1], match[2], match[3]].join('-');
  }
  const parsedDate = new Date(trimmed);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(label + fieldLabel + ' 형식이 올바르지 않습니다.');
  }
  return parsedDate.toISOString().slice(0, 10);
}

function normalizeOptionalDate(value, contextLabel, fieldLabel) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return normalizeDate(value, contextLabel, fieldLabel);
}

function normalizePositiveInteger(value, contextLabel, fieldLabel) {
  const label = contextLabel ? contextLabel + ': ' : '';
  if (value === null || value === undefined || value === '') {
    throw new Error(label + fieldLabel + '가 비어 있습니다.');
  }
  const numeric = Number.parseInt(value, 10);
  if (!Number.isInteger(numeric) || numeric < 1) {
    throw new Error(label + fieldLabel + ' 값이 올바르지 않습니다.');
  }
  return numeric;
}

function inferLevelFromWbsId(wbsId) {
  const trimmed = (wbsId || '').toString().trim();
  if (!trimmed) return 1;
  const separators = trimmed.match(/[-.]/g);
  return (separators ? separators.length : 0) + 1;
}

function computeParentWbsId(wbsId) {
  if (!wbsId) {
    return null;
  }
  const trimmed = wbsId.toString().trim();
  const lastHyphen = trimmed.lastIndexOf('-');
  const lastDot = trimmed.lastIndexOf('.');
  const index = Math.max(lastHyphen, lastDot);
  if (index === -1) {
    return null;
  }
  return trimmed.substring(0, index);
}

function normalizeProgress(value, contextLabel) {
  const label = contextLabel ? contextLabel + ': ' : '';
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const numericString = value.toString().replace(/%/g, '').trim();
  const numeric = Number(numericString);
  if (!Number.isFinite(numeric)) {
    throw new Error(label + 'Progress 값이 숫자가 아닙니다.');
  }
  return Math.min(Math.max(Math.round(numeric), 0), 100);
}

const WEIGHT_TOLERANCE = 0.01;
const ROOT_PARENT_KEY = '__ROOT__';

function parseWeightValue(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
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
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function areWeightsEqual(expected, actual) {
  if (!Number.isFinite(expected) && !Number.isFinite(actual)) {
    return true;
  }
  const expectedValue = Number.isFinite(expected) ? expected : 0;
  const actualValue = Number.isFinite(actual) ? actual : 0;
  return Math.abs(expectedValue - actualValue) <= WEIGHT_TOLERANCE;
}

function sumWeightValues(rows) {
  return (rows || []).reduce((total, row) => total + parseWeightValue(row ? row.weight : 0), 0);
}

function formatWeightDisplay(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '0';
  }
  return (Math.round(numeric * 100) / 100).toString();
}

function groupChildrenByParent(rows) {
  const childrenByParent = new Map();
  (rows || []).forEach(row => {
    if (!row || !row.wbsId) {
      return;
    }
    const parentCandidate =
      row.parentWbsId && row.parentWbsId.toString().trim()
        ? row.parentWbsId.toString().trim()
        : '';
    const parentKey = parentCandidate || ROOT_PARENT_KEY;
    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }
    childrenByParent.get(parentKey).push(row);
  });
  return childrenByParent;
}

function addFieldIssue(map, wbsId, field, message, severity = 'warning') {
  if (!wbsId) {
    return;
  }
  if (!map.has(wbsId)) {
    map.set(wbsId, []);
  }
  map.get(wbsId).push({
    field,
    message,
    severity
  });
}

function calculateWeightedProgress(children) {
  if (!children || !children.length) {
    return null;
  }
  let weightedSum = 0;
  let totalWeight = 0;
  let simpleSum = 0;
  let count = 0;
  children.forEach(child => {
    const progress = Number(child ? child.progress : 0);
    if (!Number.isFinite(progress)) {
      return;
    }
    const weight = parseWeightValue(child.weight);
    if (weight > 0) {
      weightedSum += progress * weight;
      totalWeight += weight;
    }
    simpleSum += progress;
    count += 1;
  });
  if (!count) {
    return null;
  }
  const average = totalWeight > 0 ? weightedSum / totalWeight : simpleSum / count;
  return Math.min(Math.max(Math.round(average), 0), 100);
}

function evaluateHierarchyFieldConsistency(rows, childrenByParent = groupChildrenByParent(rows)) {
  const issuesByWbsId = new Map();
  const autoUpdates = [];
  (rows || []).forEach(parent => {
    if (!parent || !parent.wbsId) {
      return;
    }
    const children = childrenByParent.get(parent.wbsId);
    if (!children || !children.length) {
      return;
    }
    const childStartDates = children.map(child => child.startDate).filter(Boolean);
    if (childStartDates.length) {
      const earliest = childStartDates.reduce((min, date) => (date < min ? date : min), childStartDates[0]);
      if (parent.startDate !== earliest) {
        addFieldIssue(
          issuesByWbsId,
          parent.wbsId,
          'startDate',
          '하위 Start Date 중 가장 빠른 날짜(' + earliest + ')와 일치하지 않습니다.'
        );
      }
    }
    const childEndDates = children.map(child => child.endDate).filter(Boolean);
    if (childEndDates.length) {
      const latest = childEndDates.reduce((max, date) => (date > max ? date : max), childEndDates[0]);
      if (parent.endDate !== latest) {
        addFieldIssue(
          issuesByWbsId,
          parent.wbsId,
          'endDate',
          '하위 End Date 중 가장 늦은 날짜(' + latest + ')와 일치하지 않습니다.'
        );
      }
    }
    const derivedProgress = calculateWeightedProgress(children);
    if (derivedProgress !== null && derivedProgress !== undefined && parent.progress !== derivedProgress) {
      const previousProgress = parent.progress;
      parent.progress = derivedProgress;
      parent.progressDisplay = Number.isFinite(derivedProgress) ? derivedProgress + '%' : '';
      autoUpdates.push({
        wbsId: parent.wbsId,
        field: 'progress',
        value: derivedProgress,
        previousValue: previousProgress
      });
    }
  });
  return {
    issuesByWbsId,
    childrenByParent,
    autoUpdates
  };
}

function createTaskRecordFromNormalized(normalizedRow, contextLabel) {
  const label = contextLabel ? contextLabel + ': ' : '';
  const wbsIdValue = resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.wbsId);
  const wbsId = coerceString(wbsIdValue).trim();
  if (!wbsId) {
    throw new Error(label + 'WBS ID가 비어 있습니다.');
  }
  const taskNameValue = resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.taskName);
  const taskName = coerceString(taskNameValue).trim();
  if (!taskName) {
    throw new Error(label + 'Task Name이 비어 있습니다.');
  }
  const rawLevel = resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.level);
  const level =
    rawLevel === null || rawLevel === undefined || rawLevel === ''
      ? inferLevelFromWbsId(wbsId)
      : normalizePositiveInteger(rawLevel, contextLabel, 'Level');
  const explicitParent = coerceString(
    resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.parentWbsId)
  ).trim();
  const parentWbsId = explicitParent || computeParentWbsId(wbsId) || '';
  const startDate = normalizeDate(
    resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.startDate),
    contextLabel,
    'Start Date'
  );
  const endDate = normalizeDate(
    resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.endDate),
    contextLabel,
    'End Date'
  );
  if (startDate > endDate) {
    throw new Error(label + 'Start Date가 End Date보다 늦습니다.');
  }
  const duration = coerceString(resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.duration)).trim();
  const progress = normalizeProgress(
    resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.progress),
    contextLabel
  );
  const planned = coerceString(resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.planned)).trim();
  const owner = coerceString(resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.owner)).trim();
  const costEstimate = normalizeCostEstimateValue(
    resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.costEstimate),
    contextLabel
  );
  const priority = normalizePriorityValue(resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.priority));
  const weight = coerceString(resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.weight)).trim();
  const status = normalizeStatusValue(resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.status));
  const deliverable = coerceString(resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.deliverable)).trim();
  const acceptanceCriteria = coerceString(
    resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.acceptanceCriteria)
  ).trim();
  const reviewDate = normalizeOptionalDate(
    resolveFieldValue(normalizedRow, FIELD_DEFS_BY_KEY.reviewDate),
    contextLabel,
    'Review'
  );
  return {
    wbsId,
    taskName,
    level,
    parentWbsId,
    startDate,
    endDate,
    duration,
    progress,
    planned,
    owner,
    costEstimate,
    priority,
    weight,
    status,
    deliverable,
    acceptanceCriteria,
    reviewDate
  };
}

function createTaskRecordFromStorage(row, contextLabel) {
  if (!row || typeof row !== 'object') {
    throw new Error(contextLabel + ': 저장된 작업 데이터를 해석할 수 없습니다.');
  }
  const normalized = {};
  FIELD_DEFS.forEach(field => {
    normalized[field.header] = row[field.key];
  });
  return createTaskRecordFromNormalized(normalized, contextLabel);
}

function createTaskRecordFromLegacyJson(row, contextLabel) {
  if (!row || typeof row !== 'object') {
    throw new Error(contextLabel + ': 작업 데이터를 해석할 수 없습니다.');
  }
  const wbsIdValue = row.wbsId !== undefined ? row.wbsId : row.id;
  const fallbackParent = computeParentWbsId(wbsIdValue) || '';
  const hasExplicitLevel = row.level !== undefined && row.level !== null && row.level !== '';
  const hasExplicitParentWbs =
    row.parentWbsId !== undefined && row.parentWbsId !== null && row.parentWbsId !== '';
  const hasLegacyParent =
    row.parentId !== undefined && row.parentId !== null && row.parentId !== '';
  const normalized = {
    'wbs id': wbsIdValue,
    'task name': row.taskName !== undefined ? row.taskName : row.name,
    level: hasExplicitLevel ? row.level : inferLevelFromWbsId(wbsIdValue),
    'parent id': hasExplicitParentWbs
      ? row.parentWbsId
      : hasLegacyParent
      ? row.parentId
      : fallbackParent,
    'start date': row.startDate !== undefined ? row.startDate : row.start,
    'end date': row.endDate !== undefined ? row.endDate : row.end,
    duration: row.duration !== undefined ? row.duration : '',
    progress: row.progress !== undefined ? row.progress : 0,
    planned: row.planned !== undefined ? row.planned : '',
    owner: row.owner !== undefined ? row.owner : '',
    'cost estimate': row.costEstimate !== undefined ? row.costEstimate : '',
    priority: row.priority !== undefined ? row.priority : '',
    weight: row.weight !== undefined ? row.weight : '',
    status: row.status !== undefined ? row.status : '',
    deliverable: row.deliverable !== undefined ? row.deliverable : '',
    'acceptance criteria': row.acceptanceCriteria !== undefined ? row.acceptanceCriteria : '',
    'review date': row.reviewDate !== undefined ? row.reviewDate : ''
  };
  return createTaskRecordFromNormalized(normalized, contextLabel);
}

function parseCsvText(csvText, options = {}) {
  const parser = options.parser || options.Papa || (typeof window !== 'undefined' ? window.Papa : undefined);
  if (!parser || typeof parser.parse !== 'function') {
    throw new Error('CSV 파서를 초기화하지 못했습니다.');
  }
  const parsed = parser.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors && parsed.errors.length) {
    const firstError = parsed.errors[0];
    throw new Error('CSV 구문 오류: ' + firstError.message + ' (행 ' + firstError.row + ')');
  }

  const fieldMap = {};
  const fields = parsed.meta && parsed.meta.fields ? parsed.meta.fields : [];
  fields.forEach(field => {
    if (typeof field === 'string') {
      fieldMap[field.trim().toLowerCase()] = field;
    }
  });

  const missingFields = FIELD_DEFS.filter(field => {
    if (field.optional) {
      return false;
    }
    const names = getFieldNames(field);
    return !names.some(name => Object.prototype.hasOwnProperty.call(fieldMap, name));
  });
  if (missingFields.length) {
    throw new Error(
      '필수 헤더가 누락되었습니다: ' +
        missingFields.map(field => field.label || field.header).join(', ')
    );
  }

  const rows = [];
  (parsed.data || []).forEach((originalRow, index) => {
    const normalized = {};
    Object.keys(originalRow || {}).forEach(key => {
      if (typeof key === 'string') {
        normalized[key.trim().toLowerCase()] = originalRow[key];
      }
    });
    const context = 'CSV ' + (index + 2) + '행';
    rows.push(createTaskRecordFromNormalized(normalized, context));
  });

  return rows;
}

function evaluateRecord(record, { rows = [], autoUpdates } = {}) {
  const issues = [];
  const localAutoUpdates = [];
  const pushAutoUpdate = update => {
    if (!update) {
      return;
    }
    localAutoUpdates.push(update);
    if (Array.isArray(autoUpdates)) {
      autoUpdates.push(update);
    }
  };
  if (!record || typeof record !== 'object') {
    return {
      issues: [{ field: '*', message: '작업 데이터가 존재하지 않습니다.', severity: 'error' }],
      autoUpdates: localAutoUpdates
    };
  }
  if (!record.wbsId || !record.wbsId.toString().trim()) {
    issues.push({ field: 'wbsId', message: 'WBS ID가 비어 있습니다.', severity: 'error' });
  }
  if (!record.taskName || !record.taskName.toString().trim()) {
    issues.push({ field: 'taskName', message: 'Task Name이 비어 있습니다.', severity: 'error' });
  }
  if (!record.startDate || !record.endDate) {
    issues.push({ field: 'startDate', message: '시작/종료 일자를 모두 입력하세요.', severity: 'error' });
  } else if (record.startDate > record.endDate) {
    issues.push({ field: 'startDate', message: 'Start Date가 End Date보다 늦습니다.', severity: 'error' });
  }
  if (record.progress !== '' && record.progress !== undefined && record.progress !== null) {
    const numeric = Number(record.progress);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
      issues.push({ field: 'progress', message: 'Progress는 0에서 100 사이여야 합니다.', severity: 'error' });
    }
  }
  const derivedStatus = deriveStatusFromProgress(record.progress, record.planned);
  if (derivedStatus && derivedStatus !== record.status) {
    const previousStatus = record.status;
    record.status = derivedStatus;
    pushAutoUpdate({
      wbsId: record.wbsId,
      field: 'status',
      value: derivedStatus,
      previousValue: previousStatus,
      requiresFullSave: true
    });
    issues.push({
      field: 'status',
      message: 'Progress 값에 따라 Status가 "' + derivedStatus + '"로 자동 변경되었습니다.',
      severity: 'warning'
    });
  } else {
    const normalizedStatus = normalizeStatusValue(record.status);
    if (normalizedStatus !== record.status) {
      const previousStatus = record.status;
      record.status = normalizedStatus;
      pushAutoUpdate({
        wbsId: record.wbsId,
        field: 'status',
        value: normalizedStatus,
        previousValue: previousStatus,
        requiresFullSave: true
      });
      issues.push({
        field: 'status',
        message: 'Status 값이 자동으로 보정되었습니다.',
        severity: 'warning'
      });
    }
  }
  const existingIds = rows.filter(Boolean).map(row => row.wbsId);
  if (record.parentWbsId && !existingIds.includes(record.parentWbsId)) {
    issues.push({
      field: 'parentWbsId',
      message: '상위 작업 ID가 현재 목록에 없습니다.',
      severity: 'warning'
    });
  }
  return { issues, autoUpdates: localAutoUpdates };
}

function evaluateWeightHierarchy(rows, childrenByParent = groupChildrenByParent(rows)) {
  const issuesByWbsId = new Map();
  if (!Array.isArray(rows) || !rows.length) {
    return issuesByWbsId;
  }
  const topLevelChildren = childrenByParent.get(ROOT_PARENT_KEY) || [];
  if (topLevelChildren.length) {
    const topLevelSum = sumWeightValues(topLevelChildren);
    if (!areWeightsEqual(100, topLevelSum)) {
      const message =
        '최상위 Weight 합계가 100%가 아닙니다. (현재 ' + formatWeightDisplay(topLevelSum) + '%)';
      topLevelChildren.forEach(child => addWeightIssue(issuesByWbsId, child.wbsId, message));
    }
  }

  rows.forEach(parent => {
    if (!parent || !parent.wbsId) {
      return;
    }
    const children = childrenByParent.get(parent.wbsId);
    if (!children || !children.length) {
      return;
    }
    const parentWeight = parseWeightValue(parent.weight);
    const childrenSum = sumWeightValues(children);
    if (!areWeightsEqual(parentWeight, childrenSum)) {
      const message =
        '하위 Weight 합계(' +
        formatWeightDisplay(childrenSum) +
        '%)가 상위 Weight(' +
        formatWeightDisplay(parentWeight) +
        '%)와 다릅니다.';
      addWeightIssue(issuesByWbsId, parent.wbsId, message);
      children.forEach(child => addWeightIssue(issuesByWbsId, child.wbsId, message));
    }
  });

  return issuesByWbsId;
}

function addWeightIssue(map, wbsId, message) {
  if (!wbsId) {
    return;
  }
  if (!map.has(wbsId)) {
    map.set(wbsId, []);
  }
  map.get(wbsId).push({
    field: 'weight',
    message,
    severity: 'error'
  });
}

function evaluateRecords(rows) {
  const issuesByWbsId = new Map();
  const autoUpdates = [];
  (rows || []).forEach(row => {
    const { issues } = evaluateRecord(row, { rows, autoUpdates });
    if (issues.length) {
      issuesByWbsId.set(row.wbsId, issues);
    }
  });
  const {
    issuesByWbsId: hierarchyIssues,
    childrenByParent,
    autoUpdates: hierarchyAutoUpdates
  } = evaluateHierarchyFieldConsistency(rows);
  if (Array.isArray(hierarchyAutoUpdates) && hierarchyAutoUpdates.length) {
    hierarchyAutoUpdates.forEach(update => autoUpdates.push(update));
  }
  hierarchyIssues.forEach((issues, wbsId) => {
    if (!issues || !issues.length) {
      return;
    }
    const existing = issuesByWbsId.get(wbsId) || [];
    issuesByWbsId.set(wbsId, existing.concat(issues));
  });
  const weightIssues = evaluateWeightHierarchy(rows, childrenByParent);
  weightIssues.forEach((issues, wbsId) => {
    if (!issues || !issues.length) {
      return;
    }
    const existing = issuesByWbsId.get(wbsId) || [];
    issuesByWbsId.set(wbsId, existing.concat(issues));
  });
  return {
    issuesByWbsId,
    hasIssues: issuesByWbsId.size > 0,
    autoUpdates
  };
}

export {
  FIELD_DEFS,
  FIELD_DEFS_BY_KEY,
  STATUS_OPTIONS,
  STATUS_DEFAULT,
  STATUS_VALUE_ALIASES,
  PRIORITY_OPTIONS,
  getFieldNames,
  resolveFieldValue,
  normalizeStatusValue,
  normalizePriorityValue,
  normalizeDate,
  normalizeOptionalDate,
  normalizePositiveInteger,
  normalizeProgress,
  deriveStatusFromProgress,
  inferLevelFromWbsId,
  computeParentWbsId,
  createTaskRecordFromNormalized,
  createTaskRecordFromStorage,
  createTaskRecordFromLegacyJson,
  parseCsvText,
  evaluateRecord,
  evaluateRecords
};
