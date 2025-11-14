const OpenAI = require('openai');

const SYSTEM_PROMPT = `당신은 WBS 프로젝트 관리 AI 어시스턴트입니다.

# 역할

사용자의 프로젝트 관련 질문에 답변하고, 필요시 프로젝트 데이터를 조회하여 정확한 정보를 제공합니다.
답변은 최대한 짧고 간결하게 하세요.

# 도구 사용 규칙

**load_project_data 도구를 사용해야 하는 경우:**
- 프로젝트 작업, 일정, 진행률, 담당자, 상태 등에 대한 질문
- "현재 프로젝트", "우리 팀", "전체" 등의 키워드 포함
- 특정 작업/레벨/담당자 조회
- 계층 구조 (하위 작업, 상위 작업) 질문
- 프로젝트 KPI/통계/분석 요청

**예시:**
- "현재 프로젝트 진행률은?"
- "D01-01-02 작업 상세 알려줘"
- "김철수가 담당한 작업은?"
- "백엔드 개발 하위 작업 리스트업"
- "지연된 작업 목록"

**도구를 사용하지 않는 경우:**
- 일반적인 PM 지식/용어 설명 ("WBS란?", "간트차트란?")
- 프로젝트 관리 방법론/조언
- 인사/안내

# 데이터 분석 방법

**load_project_data 호출 후 받은 전체 WBS 데이터를 직접 분석하세요:**

1. **필터링**: 조건에 맞는 작업 찾기
   - 레벨별: tasks.filter(t => t.level === 3)
   - 담당자별: tasks.filter(t => t.owner === "김철수")
   - 상태별: tasks.filter(t => t.status === "진행중")

2. **계층 탐색**: parentWbsId로 부모-자식 관계 파악
   - 하위 작업: tasks.filter(t => t.parentWbsId === "D01-01")
   - 상위 경로: parentWbsId를 역추적

3. **집계/통계**: 데이터 계산
   - 진행률: tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
   - 완료율: tasks.filter(t => t.progress >= 100).length / tasks.length
   - 지연: tasks.filter(t => t.endDate < today && t.progress < 100)

4. **정렬/그룹화**: 원하는 형태로 가공
   - 레벨별 그룹: tasks.reduce((acc, t) => {...}, {})
   - 담당자별 통계: tasks.reduce((acc, t) => {...}, {})

# 답변 원칙

- **간결하고 명확하게** (일반적으로 200-500자)
- **실제 데이터 기반**: 추측 금지, 조회한 데이터만 사용
- **목록 요청 시**: 모든 항목 빠짐없이 나열 (글자 수 제한 무시)
- **숫자는 구체적으로**: "약 70%" ✗ → "68.5%" ✓
- **데이터 없으면 명시**: "해당 조건의 작업이 없습니다"

**현재 프로젝트**: 사용자가 열어둔 프로젝트를 기준으로 질문합니다. 프로젝트 이름을 묻지 말고 바로 데이터를 조회하세요.`;

const PROVIDER_CONFIG = {
  upstage: {
    apiKeyEnv: 'UPSTAGE_API_KEY',
    baseURL: 'https://api.upstage.ai/v1',
    defaultModel: 'solar-pro2',
    strategy: 'chat'
  },
  openai: {
    apiKeyEnv: 'OPENAI_API_KEY',
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    defaultModel: 'gpt-5-nano',
    strategy: 'responses'
  }
};

const clientCache = {
  upstage: null,
  openai: null
};

function sanitizeString(value) {
  if (value === null || value === undefined) return '';
  return value.toString().trim();
}

function resolveProvider() {
  const envProvider = sanitizeString(process.env.LLM_PROVIDER).toLowerCase();
  if (envProvider && PROVIDER_CONFIG[envProvider]) {
    return envProvider;
  }
  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }
  return 'upstage';
}

function getApiKey(provider) {
  const config = PROVIDER_CONFIG[provider];
  if (!config) return null;
  const key = sanitizeString(process.env[config.apiKeyEnv]);
  return key || null;
}

function getModel(provider, override) {
  if (override && sanitizeString(override)) {
    return override.trim();
  }
  const config = PROVIDER_CONFIG[provider];
  if (provider === 'openai') {
    return sanitizeString(process.env.OPENAI_MODEL) || config.defaultModel;
  }
  if (provider === 'upstage') {
    return sanitizeString(process.env.UPSTAGE_MODEL) || config.defaultModel;
  }
  return config ? config.defaultModel : 'gpt-5-nano';
}

function ensureClient(provider) {
  const config = PROVIDER_CONFIG[provider];
  if (!config) {
    throw new Error(`지원하지 않는 LLM 공급자입니다: ${provider}`);
  }
  if (clientCache[provider]) {
    return clientCache[provider];
  }
  const apiKey = getApiKey(provider);
  if (!apiKey) {
    throw new Error(
      provider === 'openai'
        ? 'OpenAI API key가 설정되지 않았습니다. .env 파일을 확인하세요.'
        : 'Upstage API key가 설정되지 않았습니다. .env 파일을 확인하세요.'
    );
  }
  const baseOptions = {
    apiKey
  };
  if (config.baseURL) {
    baseOptions.baseURL = config.baseURL;
  }
  clientCache[provider] = new OpenAI(baseOptions);
  return clientCache[provider];
}

function buildMessages(messages, { systemPrompt, skipSystemPrompt }) {
  const normalizedMessages = Array.isArray(messages) ? messages.slice() : [];
  if (skipSystemPrompt) {
    return normalizedMessages;
  }
  const prompt = (systemPrompt ?? SYSTEM_PROMPT).trim();
  if (!prompt) {
    return normalizedMessages;
  }
  return [{ role: 'system', content: prompt }, ...normalizedMessages];
}

function toResponsesInput(messages) {
  return messages
    .map(message => {
      if (!message || !message.role) {
        return null;
      }
      if (message.role === 'tool') {
        return {
          type: 'function_call_output',
          call_id: message.tool_call_id || message.id || createRandomId('toolcall'),
          output: message.content || ''
        };
      }
      if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
        return message.tool_calls.map(call => ({
          type: 'function_call',
          call_id: call.id,
          name: call.function && call.function.name ? call.function.name : '',
          arguments: call.function && call.function.arguments ? call.function.arguments : '{}'
        }));
      }
      if (message.role === 'assistant' && !message.content) {
        return null;
      }
      return {
        role: message.role,
        content: message.content || ''
      };
    })
    .flat()
    .filter(Boolean);
}

function extractResponsesResult(response) {
  if (!response) {
    return { text: '', toolCalls: [] };
  }
  const toolCalls = [];
  const textChunks = [];
  
  // 우선순위 1: output_text 필드 확인 (OpenAI Responses API의 주요 텍스트 출력)
  if (response.output_text && typeof response.output_text === 'string' && response.output_text.trim()) {
    textChunks.push(response.output_text);
  } else if (Array.isArray(response.output_text) && response.output_text.length) {
    textChunks.push(response.output_text.join('\n'));
  }
  
  const outputs = Array.isArray(response.output) ? response.output : [];
  outputs.forEach(item => {
    if (!item) return;
    // reasoning 타입은 스킵 (실제 텍스트는 다른 output에 있음)
    if (item.type === 'reasoning') {
      return;
    }
    if (item.type === 'message') {
      const contentParts = Array.isArray(item.content) ? item.content : [];
      contentParts.forEach(part => {
        if (part.type === 'text' && typeof part.text === 'string') {
          textChunks.push(part.text);
        } else if (part.type === 'output_text' && Array.isArray(part.text)) {
          part.text.forEach(textPart => {
            if (textPart && typeof textPart === 'string') {
              textChunks.push(textPart);
            }
          });
        }
      });
    } else if (item.type === 'function_call') {
      toolCalls.push({
        id: item.call_id || createRandomId('tool'),
        type: 'function',
        function: {
          name: item.name || '',
          arguments: typeof item.arguments === 'string' ? item.arguments : JSON.stringify(item.arguments || {})
        }
      });
    } else if (item.type === 'function_call_output' && typeof item.output === 'string') {
      textChunks.push(item.output);
    }
  });
  
  // 추가 fallback: output 배열에서 텍스트 추출
  if (!textChunks.length && outputs.length) {
    outputs.forEach(item => {
      if (item && typeof item === 'string') {
        textChunks.push(item);
      } else if (item && item.text && typeof item.text === 'string') {
        textChunks.push(item.text);
      }
    });
  }
  
  const finalText = textChunks.join('\n').trim();
  if (!finalText && !toolCalls.length && process.env.DEBUG_LLM === 'true') {
    console.error('[extractResponsesResult] Empty result!');
  }
  return {
    text: finalText,
    toolCalls
  };
}

async function callUpstage(messages, options) {
  const client = ensureClient('upstage');
  const {
    model,
    temperature = 0.2,
    maxTokens = 512,
    stream = false,
    systemPrompt = SYSTEM_PROMPT,
    skipSystemPrompt = false,
    ...extraParams
  } = options;
  const finalMessages = buildMessages(messages, { systemPrompt, skipSystemPrompt });
  const response = await client.chat.completions.create({
    model: model || getModel('upstage'),
    messages: finalMessages,
    temperature,
    max_tokens: maxTokens,
    stream,
    ...extraParams
  });
  const choice = response.choices && response.choices[0];
  const message = choice ? choice.message : null;
  const content =
    message && typeof message.content === 'string' ? message.content.trim() : '';
  return {
    content,
    message,
    response,
    messages: finalMessages
  };
}

function normalizeToolsForResponses(tools) {
  if (!Array.isArray(tools)) {
    return undefined;
  }
  return tools.map(tool => {
    if (!tool || typeof tool !== 'object') {
      return null;
    }
    if (tool.type !== 'function') {
      return tool;
    }
    if (tool.name && tool.parameters) {
      return tool;
    }
    const fn = tool.function || {};
    return {
      type: 'function',
      name: fn.name || tool.name || '',
      description: fn.description || tool.description || '',
      parameters: fn.parameters || tool.parameters || { type: 'object' }
    };
  }).filter(Boolean);
}

async function callOpenAIResponses(messages, options) {
  const client = ensureClient('openai');
  const {
    model,
    systemPrompt = SYSTEM_PROMPT,
    skipSystemPrompt = false,
    tools,
    tool_choice,
    ...extraParams
  } = options;

  const finalMessages = buildMessages(messages, { systemPrompt, skipSystemPrompt });
  const input = toResponsesInput(finalMessages);

  const normalizedTools = normalizeToolsForResponses(tools);

  const response = await client.responses.create({
    model: model || getModel('openai'),
    input,
    tools: normalizedTools,
    tool_choice: tool_choice || (normalizedTools ? 'auto' : undefined),
    reasoning: {
      effort: 'low'  // 속도 개선: reasoning 최소화
    },
    ...extraParams
  });

  // 디버깅 모드에서만 로그 출력
  const DEBUG = process.env.DEBUG_LLM === 'true';
  if (DEBUG) {
    console.log('[OpenAI] Input:', input.length, 'items, Status:', response.status);
    if (response.status === 'incomplete') {
      console.warn('[OpenAI] Incomplete:', response.incomplete_details?.reason);
    }
  }
  
  const { text, toolCalls } = extractResponsesResult(response);
  const message = {
    role: 'assistant',
    content: text,
    tool_calls: toolCalls.length ? toolCalls : undefined
  };
  return {
    content: text,
    message,
    response,
    messages: finalMessages
  };
}

async function createChatCompletion(messages, options = {}) {
  if (!Array.isArray(messages) || !messages.length) {
    throw new Error('LLM 요청 메시지가 비어 있습니다.');
  }
  const provider = resolveProvider();
  if (provider === 'openai') {
    return callOpenAIResponses(messages, options);
  }
  return callUpstage(messages, options);
}

function isConfigured() {
  try {
    const provider = resolveProvider();
    return Boolean(getApiKey(provider));
  } catch {
    return false;
  }
}

module.exports = {
  createChatCompletion,
  isConfigured,
  SYSTEM_PROMPT
};
