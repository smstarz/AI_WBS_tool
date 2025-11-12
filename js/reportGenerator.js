const REPORT_TITLE = 'WBS 진행 상황 리포트';
const REPORT_FILENAME_PREFIX = 'wbs_report';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RISK_WINDOW_DAYS = 7;
const LOW_PROGRESS_THRESHOLD = 50;

const numberFormatter = new Intl.NumberFormat('ko-KR');

function pad(number) {
  return number.toString().padStart(2, '0');
}

function formatFileTimestamp(date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function sanitizeProjectSegment(projectName) {
  if (!projectName || typeof projectName !== 'string') {
    return '';
  }
  const ascii = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return ascii || '';
}

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return value
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeString(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function formatDisplayTimestamp(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return Number.NaN;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.NaN;
  }
  const sanitized = value.toString().replace(/,/g, '');
  const numeric = Number(sanitized);
  return Number.isFinite(numeric) ? numeric : Number.NaN;
}

function normalizePercent(value) {
  const numeric = toNumber(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.max(0, Math.min(100, numeric));
}

function parseDate(value) {
  if (!value) {
    return null;
  }
  const candidate = new Date(value);
  if (Number.isNaN(candidate.getTime())) {
    return null;
  }
  const normalized = new Date(candidate.getTime());
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function isTaskComplete(row) {
  const progress = normalizePercent(row.progress || row.Progress);
  if (progress !== null && progress >= 100) {
    return true;
  }
  const status = normalizeString(row.status || row.Status).toLowerCase();
  return Boolean(status && (status.includes('complete') || status.includes('완료')));
}

function isDelayedTask(row, today) {
  const status = normalizeString(row.status || row.Status).toLowerCase();
  if (status && (status.includes('delay') || status.includes('지연'))) {
    return true;
  }
  const endDate = parseDate(row.endDate || row['end date']);
  const progress = normalizePercent(row.progress || row.Progress) || 0;
  return Boolean(endDate && endDate.getTime() < today.getTime() && progress < 100);
}

function getWeight(row) {
  const candidates = [row.weight, row.Weight, row['weight']];
  for (let i = 0; i < candidates.length; i += 1) {
    const numeric = toNumber(candidates[i]);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }
  return 1;
}

function describeSpiStatus(ratio) {
  if (!Number.isFinite(ratio)) {
    return { label: '데이터 부족', className: 'status-badge--muted', helper: '계획 대비 완료 기준이 부족합니다.' };
  }
  if (ratio >= 1.05) {
    return { label: 'Ahead', className: 'status-badge--ahead', helper: '계획보다 빠르게 진행 중입니다.' };
  }
  if (ratio <= 0.95) {
    return { label: 'Delay', className: 'status-badge--delay', helper: '계획 대비 완료 속도가 느립니다.' };
  }
  return { label: 'On-track', className: 'status-badge--ontrack', helper: '계획과 유사한 속도로 진행 중입니다.' };
}

function clampPercent(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

function average(values) {
  if (!values.length) {
    return null;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return value.toFixed(1) + '%';
}

function formatFractionAsPercent(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return (value * 100).toFixed(1) + '%';
}

function formatInteger(value) {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return numberFormatter.format(Math.round(value));
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) {
    return '₩0';
  }
  return '₩' + numberFormatter.format(Math.round(value));
}

function computeReportInsights(rows = [], generatedAt = new Date()) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const totalTasks = safeRows.length;
  const today = new Date(generatedAt.getTime());
  today.setHours(0, 0, 0, 0);

  const progressValues = [];
  const plannedValues = [];
  const levelProgress = [];
  const ownerMap = new Map();
  const ownerProgressMap = new Map();
  let ownerWeightTotal = 0;
  let delayedCount = 0;
  let actualCompleteCount = 0;
  let plannedCompleteCount = 0;
  let reviewOverdue = 0;
  let reviewTotal = 0;
  let reviewCompleted = 0;
  const completedDeliverables = [];
  let completedWeightValue = 0;
  let totalWeightValue = 0;
  const riskCandidates = [];

  safeRows.forEach(row => {
    const progress = normalizePercent(row.progress || row.Progress);
    if (progress !== null) {
      progressValues.push(progress);
    }
    const planned = normalizePercent(row.planned || row.Planned);
    if (planned !== null) {
      plannedValues.push(planned);
    }

    const levelValue = toNumber(row.level || row.Level || row['level']);
    if (Number.isFinite(levelValue) && levelValue === 1) {
      levelProgress.push({
        name: normalizeString(row.taskName || row['task name'] || row.wbsId || row['wbs id'] || '레벨 1 작업'),
        progress: progress !== null ? progress : 0,
        planned: planned !== null ? planned : null
      });
    }

    const owner = normalizeString(row.owner || row.Owner) || '미지정';
    const weight = getWeight(row);
    ownerWeightTotal += weight;
    ownerMap.set(owner, (ownerMap.get(owner) || 0) + weight);
    let ownerProgressEntry = ownerProgressMap.get(owner);
    if (!ownerProgressEntry) {
      ownerProgressEntry = { progressValues: [], plannedValues: [] };
      ownerProgressMap.set(owner, ownerProgressEntry);
    }
    if (progress !== null) {
      ownerProgressEntry.progressValues.push(progress);
    }
    if (planned !== null) {
      ownerProgressEntry.plannedValues.push(planned);
    }

    const endDate = parseDate(row.endDate || row['end date']);
    if (isTaskComplete(row)) {
      actualCompleteCount += 1;
      if (endDate) {
        completedDeliverables.push({
          name: normalizeString(row.taskName || row['task name'] || row.wbsId || '작업'),
          wbsId: normalizeString(row.wbsId || row['wbs id']),
          deliverable: normalizeString(row.deliverable || row.Deliverable),
          endDate: endDate.toISOString().slice(0, 10)
        });
      }
    }
    if (endDate && endDate.getTime() <= today.getTime()) {
      plannedCompleteCount += 1;
    } else if (planned !== null && planned >= 100) {
      plannedCompleteCount += 1;
    }

    if (isDelayedTask(row, today)) {
      delayedCount += 1;
    }

    if (endDate) {
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / MS_PER_DAY);
      const currentProgress = progress !== null ? progress : 0;
      if (
        daysLeft >= 0 &&
        daysLeft <= RISK_WINDOW_DAYS &&
        planned !== null &&
        currentProgress < planned
      ) {
        riskCandidates.push({
          name: normalizeString(row.taskName || row['task name'] || row.wbsId || '작업'),
          owner,
          daysLeft,
          progress: currentProgress,
          planned: planned !== null ? planned : null,
          deliverable: normalizeString(row.deliverable || row.Deliverable),
          endDate: endDate.toISOString().slice(0, 10),
          wbsId: normalizeString(row.wbsId || row['wbs id'])
        });
      }
    }

    const reviewDate = parseDate(row.reviewDate || row['review date']);
    if (reviewDate) {
      reviewTotal += 1;
      if (reviewDate.getTime() < today.getTime() && !isTaskComplete(row)) {
        reviewOverdue += 1;
      }
      if (isTaskComplete(row)) {
        reviewCompleted += 1;
      }
    }

    const costEstimate =
      toNumber(row.costEstimate || row['cost estimate'] || row.cost || row.Cost);
    const safeCost = Number.isFinite(costEstimate) && costEstimate > 0 ? costEstimate : 0;
    const weightedValue = weight * safeCost;
    totalWeightValue += weightedValue;
    if (isTaskComplete(row)) {
      completedWeightValue += weightedValue;
    }
  });

  const ownerDistribution = Array.from(ownerMap.entries())
    .map(([owner, weight]) => ({
      owner,
      weight,
      percent: ownerWeightTotal ? (weight / ownerWeightTotal) * 100 : 0
    }))
    .sort((a, b) => b.weight - a.weight);

  const ownerProgress = ownerDistribution.map(entry => {
    const progressEntry = ownerProgressMap.get(entry.owner) || { progressValues: [], plannedValues: [] };
    return {
      owner: entry.owner,
      progress: average(progressEntry.progressValues),
      planned: average(progressEntry.plannedValues)
    };
  });

  const spiRatio = plannedCompleteCount > 0 ? actualCompleteCount / plannedCompleteCount : null;
  const spiStatus = describeSpiStatus(spiRatio);

  const riskTasks = riskCandidates
    .sort((a, b) => a.daysLeft - b.daysLeft || a.progress - b.progress)
    .slice(0, 5);

  completedDeliverables.sort((a, b) => {
    if (a.endDate === b.endDate) {
      return a.name.localeCompare(b.name);
    }
    return a.endDate.localeCompare(b.endDate);
  });

  return {
    totalTasks,
    averages: {
      progress: average(progressValues),
      planned: average(plannedValues)
    },
    levelProgress,
    schedule: {
      actualCompleteCount,
      plannedCompleteCount,
      ratio: spiRatio,
      status: spiStatus
    },
    delayed: {
      count: delayedCount,
      ratio: totalTasks ? (delayedCount / totalTasks) * 100 : null
    },
    riskTasks,
    review: {
      overdueCount: reviewOverdue,
      totalReviewable: reviewTotal,
      completionRate: reviewTotal ? reviewCompleted / reviewTotal : null
    },
    completedDeliverables,
    budget: {
      completedValue: completedWeightValue,
      totalValue: totalWeightValue,
      completionRatio: totalWeightValue ? completedWeightValue / totalWeightValue : null
    },
    ownerDistribution,
    ownerProgress
  };
}

export function buildReportFilename(projectName, generatedAt = new Date()) {
  const timestamp = formatFileTimestamp(generatedAt);
  const sanitizedProject = sanitizeProjectSegment(projectName);
  const suffix = sanitizedProject ? `_${sanitizedProject}` : '';
  return `${REPORT_FILENAME_PREFIX}${suffix}_${timestamp}.html`;
}

export function generateReportHtml({
  projectName,
  rows = [],
  generatedAt = new Date(),
  fileName
} = {}) {
  const safeProjectName = escapeHtml(projectName || '미지정 프로젝트');
  const generatedAtDate = generatedAt instanceof Date ? generatedAt : new Date(generatedAt);
  const generatedAtDisplay = escapeHtml(formatDisplayTimestamp(generatedAtDate));
  const normalizedFileName =
    escapeHtml(fileName || buildReportFilename(projectName, generatedAtDate));
  const insights = computeReportInsights(rows, generatedAtDate);

  const progressDifference =
    Number.isFinite(insights.averages.progress) && Number.isFinite(insights.averages.planned)
      ? insights.averages.progress - insights.averages.planned
      : null;
  const progressComparisonText = progressDifference === null
    ? '비교 가능한 예정치가 없습니다.'
    : progressDifference >= 0
      ? `예정보다 +${Math.abs(progressDifference).toFixed(1)}% 앞서 있습니다.`
      : `예정보다 ${Math.abs(progressDifference).toFixed(1)}%p 느립니다.`;

  const levelProgressMarkup = insights.levelProgress.length
    ? insights.levelProgress
        .map(item => {
          const actualValue = clampPercent(item.progress);
          const displayActual = formatPercent(item.progress);
          const displayPlanned = Number.isFinite(item.planned) ? formatPercent(item.planned) : '—';
          return `<li>
            <div class="list-row__meta">
              <span class="list-row__title">${escapeHtml(item.name || '레벨 1')}</span>
              <span class="list-row__value">${displayActual} / ${displayPlanned}</span>
            </div>
            <div class="progress-track progress-track--thin" aria-hidden="true">
              <span class="progress-thumb" style="width: ${actualValue}%;"></span>
            </div>
          </li>`;
        })
        .join('')
    : '<li class="metric-empty">레벨 1 작업 데이터가 없습니다.</li>';

  const riskTasksMarkup = insights.riskTasks.length
    ? insights.riskTasks
        .map(task => {
          const plannedText = Number.isFinite(task.planned) ? formatPercent(task.planned) : '—';
          const deliverableText = task.deliverable ? escapeHtml(task.deliverable) : '미정';
          const wbsText = task.wbsId ? '#' + escapeHtml(task.wbsId) : '#—';
          return `<li class="risk-row">
            <div class="risk-row__header">
              <span class="risk-row__wbs">${wbsText}</span>
              <span class="risk-row__name">${escapeHtml(task.name)}</span>
              <span class="risk-row__chip">${task.daysLeft}일 남음</span>
            </div>
            <div class="risk-row__stats">
              <div>
                <span>Planned</span>
                <strong>${plannedText}</strong>
              </div>
              <div>
                <span>Progress</span>
                <strong>${formatPercent(task.progress)}</strong>
              </div>
              <div>
                <span>Owner</span>
                <strong>${escapeHtml(task.owner)}</strong>
              </div>
              <div>
                <span>마감일</span>
                <strong>${escapeHtml(task.endDate)}</strong>
              </div>
            </div>
            <p class="risk-row__deliverable"><span>Deliverable</span>${deliverableText}</p>
          </li>`;
        })
        .join('')
    : '<li class="metric-empty">예상 지연 조건에 해당하는 작업이 없습니다.</li>';

  const ownerProgressMarkup = insights.ownerProgress.length
    ? insights.ownerProgress
        .map(item => {
          const actualValue = clampPercent(item.progress ?? 0);
          const displayActual = formatPercent(item.progress);
          const displayPlanned = Number.isFinite(item.planned) ? formatPercent(item.planned) : '—';
          return `<li>
            <div class="list-row__meta">
              <span class="list-row__title">${escapeHtml(item.owner)}</span>
              <span class="list-row__value">${displayActual} / ${displayPlanned}</span>
            </div>
            <div class="progress-track progress-track--thin" aria-hidden="true">
              <span class="progress-thumb" style="width: ${actualValue}%;"></span>
            </div>
          </li>`;
        })
        .join('')
    : '<li class="metric-empty">오너별 진행률을 계산할 데이터가 없습니다.</li>';

  const deliverableListMarkup = insights.completedDeliverables.length
    ? insights.completedDeliverables
        .map(item => {
          const label = [
            item.wbsId ? '#' + escapeHtml(item.wbsId) : '#—',
            escapeHtml(item.name),
            item.deliverable ? escapeHtml(item.deliverable) : 'Deliverable 미정',
            escapeHtml(item.endDate || '')
          ].join(' · ');
          return `<li class="deliverable-row">${label}</li>`;
        })
        .join('')
    : '<li class="metric-empty">완료된 산출물이 없습니다.</li>';

  const chartPayload = {
    progress: {
      labels: ['Actual', 'Planned'],
      values: [
        clampPercent(insights.averages.progress || 0),
        clampPercent(insights.averages.planned || 0)
      ]
    },
    owner: {
      labels: insights.ownerDistribution.map(item => item.owner || '미지정'),
      values: insights.ownerDistribution.map(item => clampPercent(item.percent))
    }
  };

  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(REPORT_TITLE)} - ${safeProjectName}</title>
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        margin: 0;
        background: #f3f4f8;
        color: #0f172a;
        display: flex;
        justify-content: center;
        padding: 40px 0;
      }
      .report-shell {
        width: 800px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 30px 60px rgba(15, 23, 42, 0.12);
        padding: 32px 36px;
      }
      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 40px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 24px;
        margin-bottom: 32px;
      }
      .report-title {
        margin: 0;
        font-size: 18px;
        line-height: 24px;
      }
      .report-meta {
        margin: 6px 0 0;
        color: #6b7280;
        font-size: 11px;
      }
      .report-download {
        border: none;
        border-radius: 999px;
        background: #4d7cff;
        color: #fff;
        width: 120px;
        height: 24px;
        font-size: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      .report-download:hover {
        background: #3b66d6;
      }
      .metric-section + .metric-section {
        margin-top: 32px;
      }
      .section-header {
        margin-bottom: 16px;
      }
      .section-header h2 {
        margin: 0 0 6px;
        font-size: 16px;
      }
      .section-header p {
        margin: 0;
        color: #6b7280;
        font-size: 10px;
      }
      .metric-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
        justify-content: center;
      }
      .metric-grid--two {
        grid-template-columns: 340px 340px;
      }
      .metric-grid--three {
        grid-template-columns: 228px 228px 228px;
      }
      .metric-card {
        border: 1px solid #dfe5fb;
        border-radius: 14px;
        padding: 24px;
        background: #fbfcff;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .chart-block {
        width: 100%;
        min-height: 160px;
        padding: 4px 0;
      }
      .chart-block canvas {
        width: 100% !important;
        height: 160px !important;
      }
      .metric-card h3 {
        margin: 0;
        font-size: 15px;
        color: #111827;
      }
      .stat-pair {
        display: flex;
        gap: 32px;
        flex-wrap: nowrap;
        align-items: flex-start;
      }
      .stat-label {
        margin: 0;
        font-size: 11px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0;
        font-family: inherit;
      }
      .stat-value {
        margin: 6px 0 0;
        font-size: 28px;
        font-weight: 600;
        font-family: inherit;
      }
      .stat-value--compact {
        font-size: 20px;
      }
      .stat-triple {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 8px;
      }
      .stat-triple > div {
        flex: 1;
      }
      .stat-helper {
        margin: 4px 0 0;
        color: #6b7280;
        font-size: 12px;
      }
      .stat-helper--compact {
        margin-top: 2px;
      }
      .progress-track {
        width: 100%;
        height: 12px;
        border-radius: 6px;
        background: #e2e6ff;
        overflow: hidden;
      }
      .metric-list--progress .progress-track {
        margin-top: 8px;
      }
      .progress-track--thin {
        height: 8px;
      }
      .progress-thumb {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #4d7cff, #61d5ff);
      }
      .progress-thumb--secondary {
        background: #94a3f3;
      }
      .spi-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 2px;
        margin-bottom: 4px;
      }
      .spi-header .stat-value {
        margin: 0;
        font-size: 18px;
        order: 1;
      }
      .spi-header .status-badge {
        order: 2;
      }
      .spi-progress {
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: #e2e6ff;
        overflow: hidden;
        margin-top: 0;
      }
      .spi-progress__thumb {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #ec4899, #fbbf24, #4d7cff);
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 14px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
      }
      .status-badge--ahead {
        color: #0f5132;
        background: #d1fae5;
      }
      .status-badge--delay {
        color: #b42318;
        background: #fee2e2;
      }
      .status-badge--ontrack {
        color: #1d4ed8;
        background: #dbeafe;
      }
      .status-badge--muted {
        color: #6b7280;
        background: #f3f4f6;
      }
      .metric-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .metric-list--progress {
        gap: 20px;
      }
      .metric-empty {
        margin: 0;
        color: #94a3b8;
        font-size: 13px;
      }
      .metric-list--deliverable {
        gap: 10px;
      }
      .deliverable-row {
        font-size: 12px;
        color: #0f172a;
        padding: 6px 8px;
        border-radius: 10px;
        background: #f8fafc;
      }
      .list-row__meta {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
      }
      .metric-list--progress .list-row__title {
        font-size: 11px;
      }
      .metric-list--progress .list-row__value {
        font-size: 10px;
      }
      .list-row__value {
        color: #4d7cff;
      }
      .risk-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 4px 0;
      }
      .risk-row__header {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .risk-row__wbs {
        font-size: 10px;
        font-weight: 600;
        color: #4d7cff;
        background: #edf1ff;
        padding: 2px 6px;
        border-radius: 999px;
      }
      .risk-row__name {
        font-size: 12px;
        font-weight: 600;
        color: #0f172a;
      }
      .risk-row__chip {
        font-size: 11px;
        color: #b45309;
        background: #fff7ed;
        padding: 2px 8px;
        border-radius: 999px;
      }
      .risk-row__stats {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 11px;
        color: #6b7280;
      }
      .risk-row__stats div {
        min-width: 120px;
      }
      .risk-row__stats span {
        font-size: 10px;
        text-transform: uppercase;
        color: #9ca3af;
      }
      .risk-row__stats strong {
        display: block;
        font-size: 14px;
        color: #0f172a;
        margin-top: 2px;
      }
      .risk-row__deliverable {
        margin: 0;
        font-size: 11px;
        color: #4b5563;
      }
      .risk-row__deliverable span {
        font-weight: 600;
        margin-right: 4px;
      }
      .list-row__sub {
        margin: 6px 0 0;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="report-shell">
      <header class="report-header">
        <div>
          <h1 class="report-title">${escapeHtml(REPORT_TITLE)}</h1>
          <p class="report-meta">${safeProjectName} · 생성 ${generatedAtDisplay}</p>
        </div>
        <button class="report-download" data-report-download="${normalizedFileName}">HTML 다운로드</button>
      </header>

      <section class="metric-section">
        <div class="section-header">
          <h2>진척률 관련 지표</h2>
          <p>현재 프로젝트의 실제/예정 대비 상태를 요약합니다.</p>
        </div>
        <div class="metric-grid metric-grid--three">
          <article class="metric-card">
            <h3>전체 WBS 평균 Progress</h3>
            <p class="stat-helper stat-helper--compact">${escapeHtml(progressComparisonText)}</p>
            <div class="chart-block" aria-hidden="true">
              <canvas id="progressChart"></canvas>
            </div>
          </article>

          <article class="metric-card">
            <h3>상위 레벨 Progress</h3>
            <ul class="metric-list metric-list--progress">
              ${levelProgressMarkup}
            </ul>
          </article>

          <article class="metric-card">
            <h3>기한 대비 진행률 (SPI)</h3>
            <p class="stat-helper stat-helper--compact">${escapeHtml(insights.schedule.status.helper)}</p>
            <div class="spi-header">
              <span class="status-badge ${insights.schedule.status.className}">${insights.schedule.status.label}</span>
              <p class="stat-value">${Number.isFinite(insights.schedule.ratio) ? (insights.schedule.ratio * 100).toFixed(1) + '%' : '—'}</p>
            </div>
            <div class="spi-progress" aria-hidden="true">
              <span class="spi-progress__thumb" style="width: ${clampPercent((insights.schedule.ratio || 0) * 100)}%;"></span>
            </div>
            <div class="stat-triple">
              <div>
                <p class="stat-label">완료</p>
                <p class="stat-value stat-value--compact">${formatInteger(insights.schedule.actualCompleteCount)}</p>
              </div>
              <div>
                <p class="stat-label">계획</p>
                <p class="stat-value stat-value--compact">${formatInteger(insights.schedule.plannedCompleteCount)}</p>
              </div>
              <div>
                <p class="stat-label">지연</p>
                <p class="stat-value stat-value--compact">${formatInteger(insights.delayed.count)}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="metric-section">
        <div class="section-header">
          <h2>앞으로 일정 위험 Task</h2>
          <p>마감이 임박했지만 진행률이 낮은 작업을 우선 확인하세요.(최대 5개까지 표출됩니다)</p>
        </div>
        <article class="metric-card">
          <ul class="metric-list">
            ${riskTasksMarkup}
          </ul>
        </article>
      </section>

      <section class="metric-section">
        <div class="section-header">
          <h2>리소스 지표</h2>
          <p>오너별 작업량 분포와 Planned 대비 Progress를 제공합니다.</p>
        </div>
        <div class="metric-grid metric-grid--two">
          <article class="metric-card">
            <h3>오너별 작업량 분포</h3>
            <div class="chart-block">
              <canvas id="ownerChart"></canvas>
            </div>
          </article>
          <article class="metric-card">
            <h3>오너별 Progress</h3>
            <ul class="metric-list metric-list--progress">
              ${ownerProgressMarkup}
            </ul>
          </article>
        </div>
      </section>

      <section class="metric-section">
        <div class="section-header">
          <h2>산출물 리스트</h2>
          <p>완료된 작업의 Deliverable을 마감일 기준으로 확인합니다.</p>
        </div>
        <article class="metric-card">
          <h3>완료된 산출물</h3>
          <ul class="metric-list metric-list--deliverable">
            ${deliverableListMarkup}
          </ul>
        </article>
      </section>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script id="reportChartPayload" type="application/json">${JSON.stringify(chartPayload).replace(/</g, '\\u003c')}</script>
    <script>
      (function () {
        function initCharts() {
          if (!window.Chart) {
            console.warn('Chart.js is not available.');
            return;
          }
          const progressValuePlugin = {
            id: 'progressValuePlugin',
            afterDatasetsDraw(chart) {
              if (chart.config.type !== 'bar') {
                return;
              }
              const { ctx } = chart;
              ctx.save();
              ctx.font = '600 12px "Pretendard",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
              ctx.fillStyle = '#0f172a';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              chart.getDatasetMeta(0).data.forEach((bar, index) => {
                const value = chart.data.datasets[0].data[index];
                if (typeof value !== 'number') {
                  return;
                }
                const label = value.toFixed(1) + '%';
                ctx.fillText(label, bar.x, bar.y - 4);
              });
              ctx.restore();
            }
          };
          Chart.register(progressValuePlugin);
          const payloadNode = document.getElementById('reportChartPayload');
          if (!payloadNode) {
            return;
          }
          let payload = null;
          try {
            payload = JSON.parse(payloadNode.textContent || '{}');
          } catch (error) {
            console.warn('Failed to parse chart payload', error);
            return;
          }
          const progressCtx = document.getElementById('progressChart');
          if (progressCtx && payload.progress) {
            new Chart(progressCtx, {
              type: 'bar',
              data: {
                labels: payload.progress.labels,
                datasets: [
                  {
                    data: payload.progress.values,
                    backgroundColor: ['#4d7cff', '#b1c2ff'],
                    borderRadius: 8,
                    maxBarThickness: 48
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label(context) {
                        return context.parsed + '%';
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                  },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 25, font: { size: 10 } }
                  }
                }
              }
            });
          }
          const ownerCtx = document.getElementById('ownerChart');
          if (ownerCtx && payload.owner && payload.owner.labels.length) {
            new Chart(ownerCtx, {
              type: 'doughnut',
              data: {
                labels: payload.owner.labels,
                datasets: [
                  {
                    data: payload.owner.values,
                    backgroundColor: ['#4d7cff', '#61d5ff', '#94a3f3', '#fbbf24', '#f472b6', '#34d399'],
                    borderWidth: 0
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      font: { size: 10 },
                      generateLabels(chart) {
                        const data = chart.data;
                        if (!data.labels.length) {
                          return [];
                        }
                        return data.labels.map((label, index) => {
                          const value = data.datasets[0].data[index];
                          return {
                            text: label + ' ' + value.toFixed(1) + '%',
                            fillStyle: data.datasets[0].backgroundColor[index],
                            strokeStyle: data.datasets[0].backgroundColor[index],
                            lineWidth: 0,
                            index
                          };
                        });
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label(context) {
                        const label = context.label || '';
                        const value = typeof context.parsed === 'number' ? context.parsed.toFixed(1) : context.parsed;
                        return label + ': ' + value + '%';
                      }
                    }
                  }
                }
              }
            });
          }
        }
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initCharts);
        } else {
          initCharts();
        }
      })();
    </script>
    <script>
      (function () {
        const button = document.querySelector('[data-report-download]');
        if (!button) {
          return;
        }
        const fileName = button.getAttribute('data-report-download') || 'wbs_report.html';
        button.addEventListener('click', () => {
          const serializer = '<!DOCTYPE html>' + document.documentElement.outerHTML;
          const blob = new Blob([serializer], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        });
      })();
    </script>
  </body>
</html>`;
}
