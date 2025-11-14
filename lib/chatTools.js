const path = require('path');
const fs = require('fs');

/**
 * 프로젝트 WBS 데이터를 로드하는 단일 Tool
 * 사용자가 프로젝트 관련 질문을 하면 전체 WBS JSON을 반환
 * LLM이 직접 데이터를 분석/필터링/집계
 */
function executeLoadProjectData(args, rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  
  if (!safeRows.length) {
    return {
      error: '프로젝트 데이터가 없습니다.',
      tasks: []
    };
  }
  
  return {
    tasks: safeRows,
    meta: {
      totalTasks: safeRows.length,
      loadedAt: new Date().toISOString()
    }
  };
}

const CHAT_TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'load_project_data',
      description:
        '프로젝트의 전체 WBS 데이터를 로드합니다. 사용자가 프로젝트 작업, 일정, 진행률, 담당자 등에 대해 질문할 때 사용합니다. 로드된 데이터에는 모든 작업의 WBS ID, 작업명, 레벨, 부모-자식 관계(parentWbsId), 날짜, 진행률, 담당자, 비용 등이 포함됩니다.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];

module.exports = {
  CHAT_TOOL_DEFINITIONS,
  executeLoadProjectData
};
