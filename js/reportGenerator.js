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
  let ownerWeightTotal = 0;
  let delayedCount = 0;
  let actualCompleteCount = 0;
  let plannedCompleteCount = 0;
  let reviewOverdue = 0;
  let reviewTotal = 0;
  let reviewCompleted = 0;
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
        progress: progress !== null ? progress : 0
      });
    }

    if (isTaskComplete(row)) {
      actualCompleteCount += 1;
    }

    const owner = normalizeString(row.owner || row.Owner) || '미지정';
    const weight = getWeight(row);
    ownerWeightTotal += weight;
    ownerMap.set(owner, (ownerMap.get(owner) || 0) + weight);

    const endDate = parseDate(row.endDate || row['end date']);
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
      if (daysLeft >= 0 && daysLeft <= RISK_WINDOW_DAYS && currentProgress < LOW_PROGRESS_THRESHOLD) {
        riskCandidates.push({
          name: normalizeString(row.taskName || row['task name'] || row.wbsId || '작업'),
          owner,
          daysLeft,
          progress: currentProgress,
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

  const spiRatio = plannedCompleteCount > 0 ? actualCompleteCount / plannedCompleteCount : null;
  const spiStatus = describeSpiStatus(spiRatio);

  const riskTasks = riskCandidates
    .sort((a, b) => a.daysLeft - b.daysLeft || a.progress - b.progress)
    .slice(0, 5);

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
    budget: {
      completedValue: completedWeightValue,
      totalValue: totalWeightValue,
      completionRatio: totalWeightValue ? completedWeightValue / totalWeightValue : null
    },
    ownerDistribution
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
          const value = clampPercent(item.progress);
          return `<li>
            <div class="list-row__meta">
              <span class="list-row__title">${escapeHtml(item.name || '레벨 1')}</span>
              <span class="list-row__value">${formatPercent(item.progress)}</span>
            </div>
            <div class="progress-track progress-track--thin" aria-hidden="true">
              <span class="progress-thumb" style="width: ${value}%;"></span>
            </div>
          </li>`;
        })
        .join('')
    : '<li class="metric-empty">레벨 1 작업 데이터가 없습니다.</li>';

  const riskTasksMarkup = insights.riskTasks.length
    ? insights.riskTasks
        .map(task => {
          return `<li>
            <div class="list-row__meta">
              <span class="list-row__title">${escapeHtml(task.name)}</span>
              <span class="list-row__value">${task.daysLeft}일 남음 · ${formatPercent(task.progress)}</span>
            </div>
            <p class="list-row__sub">${escapeHtml(task.owner)} · 마감 ${escapeHtml(task.endDate)} (${escapeHtml(task.wbsId || '')})</p>
          </li>`;
        })
        .join('')
    : '<li class="metric-empty">예상 지연 조건에 해당하는 작업이 없습니다.</li>';

  const ownerDistributionMarkup = insights.ownerDistribution.length
    ? insights.ownerDistribution
        .map(item => {
          return `<li>
            <div class="list-row__meta">
              <span class="list-row__title">${escapeHtml(item.owner)}</span>
              <span class="list-row__value">${formatPercent(item.percent)}</span>
            </div>
            <div class="progress-track progress-track--thin" aria-hidden="true">
              <span class="progress-thumb progress-thumb--secondary" style="width: ${clampPercent(item.percent)}%;"></span>
            </div>
          </li>`;
        })
        .join('')
    : '<li class="metric-empty">오너 정보가 포함된 작업이 없습니다.</li>';

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
        padding: 2rem;
        background: #f5f6fa;
        color: #0f172a;
      }
      .report-shell {
        max-width: 1100px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 30px 60px rgba(15, 23, 42, 0.12);
        padding: 2.5rem;
      }
      .report-header {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1.25rem;
        margin-bottom: 2rem;
      }
      .report-title {
        margin: 0;
        font-size: 2rem;
      }
      .report-meta {
        margin: 0.3rem 0 0;
        color: #6b7280;
        font-size: 0.95rem;
      }
      .report-download {
        border: none;
        border-radius: 999px;
        background: #4d7cff;
        color: #fff;
        padding: 0.6rem 1.4rem;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      .report-download:hover {
        background: #3b66d6;
      }
      .metric-section + .metric-section {
        margin-top: 2rem;
      }
      .section-header {
        margin-bottom: 1rem;
      }
      .section-header h2 {
        margin: 0 0 0.3rem;
        font-size: 1.2rem;
      }
      .section-header p {
        margin: 0;
        color: #6b7280;
        font-size: 0.9rem;
      }
      .metric-grid {
        display: grid;
        gap: 1rem;
      }
      .metric-grid--two {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      .metric-grid--three {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      }
      .metric-card {
        border: 1px solid #eef2ff;
        border-radius: 16px;
        padding: 1.5rem;
        background: #fdfdff;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .metric-card h3 {
        margin: 0;
        font-size: 1rem;
        color: #111827;
      }
      .stat-pair {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
      .stat-label {
        margin: 0;
        font-size: 0.75rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .stat-value {
        margin: 0.15rem 0 0;
        font-size: 1.8rem;
        font-weight: 600;
      }
      .stat-helper {
        margin: 0;
        color: #6b7280;
        font-size: 0.9rem;
      }
      .progress-track {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        background: #e5e9ff;
        overflow: hidden;
      }
      .progress-track--thin {
        height: 6px;
      }
      .progress-thumb {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #4d7cff, #61d5ff);
      }
      .progress-thumb--secondary {
        background: #94a3f3;
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.15rem 0.75rem;
        border-radius: 999px;
        font-size: 0.8rem;
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
        gap: 0.75rem;
      }
      .metric-empty {
        margin: 0;
        color: #94a3b8;
        font-size: 0.9rem;
      }
      .list-row__meta {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: #0f172a;
      }
      .list-row__value {
        color: #4d7cff;
      }
      .list-row__sub {
        margin: 0.2rem 0 0;
        color: #6b7280;
        font-size: 0.85rem;
      }
      @media (max-width: 640px) {
        body {
          padding: 1rem;
        }
        .report-shell {
          padding: 1.5rem;
        }
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
            <div class="stat-pair">
              <div>
                <p class="stat-label">Actual</p>
                <p class="stat-value">${formatPercent(insights.averages.progress)}</p>
              </div>
              <div>
                <p class="stat-label">Planned</p>
                <p class="stat-value">${formatPercent(insights.averages.planned)}</p>
              </div>
            </div>
            <div class="progress-track" aria-hidden="true">
              <span class="progress-thumb" style="width: ${clampPercent(insights.averages.progress || 0)}%;"></span>
            </div>
            <p class="stat-helper">${escapeHtml(progressComparisonText)}</p>
          </article>

          <article class="metric-card">
            <h3>상위 레벨 Progress</h3>
            <ul class="metric-list">
              ${levelProgressMarkup}
            </ul>
          </article>

          <article class="metric-card">
            <h3>기한 대비 진행률 (SPI)</h3>
            <div>
              <span class="status-badge ${insights.schedule.status.className}">${insights.schedule.status.label}</span>
              <p class="stat-value" style="margin-top: 0.5rem;">${Number.isFinite(insights.schedule.ratio) ? insights.schedule.ratio.toFixed(2) : '—'}</p>
              <p class="stat-helper">${escapeHtml(insights.schedule.status.helper)}</p>
            </div>
            <div class="stat-pair" style="margin-top: 0.5rem;">
              <div>
                <p class="stat-label">완료 작업</p>
                <p class="stat-value">${formatInteger(insights.schedule.actualCompleteCount)}</p>
              </div>
              <div>
                <p class="stat-label">계획 완료 기준</p>
                <p class="stat-value">${formatInteger(insights.schedule.plannedCompleteCount)}</p>
              </div>
            </div>
            <div>
              <p class="stat-label" style="margin-top: 0.5rem;">지연 Task</p>
              <p class="stat-value" style="font-size: 1.4rem;">${formatInteger(insights.delayed.count)} (${formatPercent(insights.delayed.ratio)})</p>
            </div>
          </article>
        </div>
      </section>

      <section class="metric-section">
        <div class="section-header">
          <h2>앞으로 일정 위험 Task</h2>
          <p>마감이 임박했지만 진행률이 낮은 작업을 우선 확인하세요.</p>
        </div>
        <article class="metric-card">
          <ul class="metric-list">
            ${riskTasksMarkup}
          </ul>
        </article>
      </section>

      <section class="metric-section">
        <div class="section-header">
          <h2>산출물 검수 지표</h2>
          <p>검토 일정과 완료 현황을 통해 품질 리스크를 파악합니다.</p>
        </div>
        <div class="metric-grid metric-grid--two">
          <article class="metric-card">
            <h3>Review Due 대비 Overdue</h3>
            <p class="stat-value">${formatInteger(insights.review.overdueCount)}</p>
            <p class="stat-helper">기한이 지난 리뷰 대기 작업 수</p>
          </article>
          <article class="metric-card">
            <h3>검토 완료율</h3>
            <p class="stat-value">${formatFractionAsPercent(insights.review.completionRate)}</p>
            <p class="stat-helper">${formatInteger(insights.review.totalReviewable)}건 중 완료된 리뷰 비율</p>
          </article>
        </div>
      </section>

      <section class="metric-section">
        <div class="section-header">
          <h2>예산 / 리소스 지표</h2>
          <p>단순화된 EVA 및 오너별 작업량 분포를 제공합니다.</p>
        </div>
        <div class="metric-grid metric-grid--two">
          <article class="metric-card">
            <h3>Earned Value (Weight × Cost)</h3>
            <p class="stat-label">완료 가치</p>
            <p class="stat-value">${formatCurrency(insights.budget.completedValue)}</p>
            <div class="progress-track" aria-hidden="true">
              <span class="progress-thumb" style="width: ${clampPercent((insights.budget.completionRatio || 0) * 100)}%;"></span>
            </div>
            <p class="stat-helper">총 계획 대비 ${formatFractionAsPercent(insights.budget.completionRatio)} 달성</p>
          </article>
          <article class="metric-card">
            <h3>오너별 작업량 분포</h3>
            <ul class="metric-list">
              ${ownerDistributionMarkup}
            </ul>
          </article>
        </div>
      </section>
    </div>

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
