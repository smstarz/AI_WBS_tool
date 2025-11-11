export function initChatbot({ fetcher = window.fetch } = {}) {
  const widget = document.querySelector('.chatbot-widget');
  const statusLabel = document.getElementById('chatbotStatus');
  const listView = document.getElementById('chatbotListView');
  const conversationView = document.getElementById('chatbotConversationView');
  const topicsContainer = document.getElementById('chatbotTopics');
  const listMessage = document.getElementById('chatbotListMessage');
  const topicForm = document.getElementById('chatbotTopicForm');
  const topicInput = document.getElementById('chatbotTopicInput');
  const topicSubmit = topicForm ? topicForm.querySelector('button[type="submit"]') : null;
  const headerTitle = document.getElementById('chatbotHeaderTitle');
  const headerBackButton = document.getElementById('chatbotHeaderBack');
  const conversationMessage = document.getElementById('chatbotConversationMessage');
  const messagesContainer = document.getElementById('chatbotMessages');
  const chatForm = document.getElementById('chatbotForm');
  const chatInput = document.getElementById('chatbotInput');
  const chatSubmit = document.getElementById('chatbotSubmit');
  const defaultHeaderTitle = headerTitle ? headerTitle.textContent : 'AI WBS 챗봇';

  if (!widget) {
    return {
      async setProject() {}
    };
  }

  let currentProject = null;
  let chatSessions = [];
  let activeChatSession = null;
  let isChatListLoading = false;
  let isTopicFormLocked = false;
  let isMessageFormLocked = false;

  function truncate(text, maxLength = 80) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, Math.max(0, maxLength - 3)) + '...' : text;
  }

  function formatTimestamp(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    try {
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return date.toISOString().replace('T', ' ').slice(0, 16);
    }
  }

  function setStatusText(text) {
    if (statusLabel) {
      statusLabel.textContent = text || 'LLM 연결 준비중';
    }
  }

  function setListHelper(text) {
    if (listMessage) {
      listMessage.textContent = text || '';
    }
  }

  function setConversationHelper(text) {
    if (conversationMessage) {
      conversationMessage.textContent = text || '';
    }
  }

  function setHeaderTitle(text) {
    if (headerTitle) {
      headerTitle.textContent = text || defaultHeaderTitle;
    }
  }

  function switchView(mode) {
    if (!listView || !conversationView) {
      return;
    }
    if (mode === 'chat') {
      listView.classList.remove('is-active');
      conversationView.classList.add('is-active');
    } else {
      conversationView.classList.remove('is-active');
      listView.classList.add('is-active');
    }
    widget.setAttribute('data-mode', mode);
    if (headerBackButton) {
      if (mode === 'chat') {
        headerBackButton.disabled = false;
        headerBackButton.classList.add('is-visible');
      } else {
        headerBackButton.disabled = true;
        headerBackButton.classList.remove('is-visible');
      }
    }
  }

  function syncTopicFormState() {
    if (!topicInput) {
      return;
    }
    const disabled = !currentProject || isChatListLoading || isTopicFormLocked;
    topicInput.disabled = disabled;
    if (topicSubmit) {
      topicSubmit.disabled = disabled || topicInput.value.trim().length === 0;
    }
  }

  function setTopicFormLocked(locked) {
    isTopicFormLocked = locked;
    syncTopicFormState();
  }

  function syncMessageFormState() {
    if (!chatInput || !chatSubmit) {
      return;
    }
    const disabled =
      !currentProject ||
      !activeChatSession ||
      isMessageFormLocked ||
      chatInput.value.trim().length === 0;
    chatInput.disabled = !activeChatSession || !currentProject || isMessageFormLocked;
    chatSubmit.disabled = disabled;
  }

  function setMessageFormLocked(locked) {
    isMessageFormLocked = locked;
    syncMessageFormState();
  }

  function buildTopicMeta(session) {
    const pieces = [];
    if (session.updatedAt) {
      const formatted = formatTimestamp(session.updatedAt);
      if (formatted) {
        pieces.push(formatted);
      }
    }
    if (typeof session.messageCount === 'number') {
      pieces.push(session.messageCount + ' 메시지');
    }
    return pieces.join(' · ');
  }

  function renderTopics() {
    if (!topicsContainer) {
      return;
    }
    topicsContainer.innerHTML = '';
    if (!currentProject) {
      setListHelper('프로젝트를 선택하면 대화를 시작할 수 있습니다.');
      return;
    }
    if (isChatListLoading) {
      const loading = document.createElement('p');
      loading.className = 'chatbot-widget__helper';
      loading.textContent = '대화 목록을 불러오는 중입니다…';
      topicsContainer.appendChild(loading);
      return;
    }
    if (!chatSessions.length) {
      const empty = document.createElement('p');
      empty.className = 'chatbot-widget__helper';
      empty.textContent = '대화 기록이 없습니다. 새 토픽을 만들어 보세요.';
      topicsContainer.appendChild(empty);
      return;
    }
    chatSessions.forEach(session => {
      const card = document.createElement('div');
      card.className =
        'chatbot-topic' + (activeChatSession && activeChatSession.id === session.id ? ' is-active' : '');
      card.dataset.chatId = session.id || '';
      const main = document.createElement('button');
      main.type = 'button';
      main.className = 'chatbot-topic__main';
      main.dataset.chatId = session.id || '';
      const title = document.createElement('p');
      title.className = 'chatbot-topic__title';
      title.textContent = session.title || '제목 없는 대화';
      const meta = document.createElement('span');
      meta.className = 'chatbot-topic__meta';
      meta.textContent = buildTopicMeta(session);
      const preview = document.createElement('p');
      preview.className = 'chatbot-topic__preview';
      preview.textContent = session.preview || '메시지를 입력해 대화를 시작해 보세요.';
      main.appendChild(title);
      main.appendChild(meta);
      main.appendChild(preview);
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'chatbot-topic__action';
      action.dataset.chatId = session.id || '';
      action.setAttribute('aria-label', '대화 삭제');
      action.textContent = '⋮';
      card.appendChild(main);
      card.appendChild(action);
      topicsContainer.appendChild(card);
    });
  }

  function renderMessages(session) {
    if (!messagesContainer) {
      return;
    }
    messagesContainer.innerHTML = '';
    if (!session || !Array.isArray(session.messages) || !session.messages.length) {
      const empty = document.createElement('p');
      empty.className = 'chatbot-widget__helper';
      empty.textContent = '아직 메시지가 없습니다. 질문을 입력해 보세요.';
      messagesContainer.appendChild(empty);
      return;
    }
    session.messages.forEach(message => {
      const bubble = document.createElement('div');
      const roleClass = message.role === 'user' ? 'user' : 'bot';
      bubble.className = 'chatbot-widget__message chatbot-widget__message--' + roleClass;
      bubble.textContent = message.content || '';
      messagesContainer.appendChild(bubble);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function setConversation(session) {
    activeChatSession = session;
    renderTopics();
    setHeaderTitle(session ? session.title || defaultHeaderTitle : null);
    if (session) {
      setConversationHelper('답변은 "준비중입니다."로 표시됩니다.');
      switchView('chat');
      renderMessages(session);
      syncMessageFormState();
      if (chatInput && !chatInput.disabled) {
        chatInput.focus();
      }
    } else {
      switchView('list');
      setConversationHelper('토픽을 선택하거나 새 대화를 시작하세요.');
      renderMessages(null);
      syncMessageFormState();
    }
  }

  function summarizeSession(session) {
    if (!session) return null;
    const messageCount = Array.isArray(session.messages) ? session.messages.length : 0;
    const lastMessage = messageCount ? session.messages[messageCount - 1] : null;
    return {
      id: session.id,
      title: session.title || '제목 없는 대화',
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount,
      preview: lastMessage ? truncate(lastMessage.content || '', 80) : ''
    };
  }

  function upsertSummary(summary) {
    if (!summary) return;
    const index = chatSessions.findIndex(item => item.id === summary.id);
    if (index === -1) {
      chatSessions.unshift(summary);
    } else {
      chatSessions[index] = summary;
    }
    chatSessions.sort((a, b) => {
      const aTime = Date.parse(a.updatedAt || '') || 0;
      const bTime = Date.parse(b.updatedAt || '') || 0;
      return bTime - aTime;
    });
  }

  function getChatApiBase() {
    if (!currentProject) {
      return null;
    }
    return '/api/projects/' + encodeURIComponent(currentProject) + '/chats';
  }

  async function refreshSessions() {
    if (!currentProject) {
      chatSessions = [];
      renderTopics();
      setStatusText('프로젝트 선택 필요');
      setListHelper('프로젝트를 선택하면 대화를 시작할 수 있습니다.');
      setConversation(null);
      return;
    }
    isChatListLoading = true;
    setStatusText('대화 목록을 불러오는 중…');
    setListHelper('');
    renderTopics();
    syncTopicFormState();
    let nextSessions = [];
    let nextStatus = 'LLM 연결 준비중';
    let nextHelper = '';
    try {
      const apiBase = getChatApiBase();
      if (!apiBase) {
        throw new Error('프로젝트 경로를 찾을 수 없습니다.');
      }
      const response = await fetcher(apiBase);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || '대화 목록을 불러오지 못했습니다.');
      }
      const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
      nextSessions = sessions;
      nextHelper = sessions.length ? '' : '대화 기록이 없습니다. 새 토픽을 만들어 보세요.';
      nextStatus = 'LLM 연결 준비중';
    } catch (error) {
      console.error(error);
      nextSessions = [];
      nextHelper = error.message || '대화 목록을 불러오지 못했습니다.';
      nextStatus = '대화 로딩 실패';
    } finally {
      isChatListLoading = false;
      chatSessions = nextSessions;
      renderTopics();
      setListHelper(nextHelper);
      setStatusText(nextStatus);
      syncTopicFormState();
    }
  }

  async function openSession(chatId) {
    if (!chatId || !currentProject) {
      return;
    }
    const apiBase = getChatApiBase();
    if (!apiBase) {
      return;
    }
    switchView('chat');
    setConversationHelper('대화를 불러오는 중입니다…');
    if (messagesContainer) {
      messagesContainer.innerHTML = '<p class="chatbot-widget__helper">대화를 불러오는 중입니다…</p>';
    }
    try {
      const response = await fetcher(apiBase + '/' + encodeURIComponent(chatId));
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || '대화를 불러오지 못했습니다.');
      }
      const session = payload.session;
      if (!session) {
        throw new Error('대화 데이터를 찾을 수 없습니다.');
      }
      const summary = summarizeSession(session);
      if (summary) {
        upsertSummary(summary);
        renderTopics();
      }
      setConversation(session);
      setStatusText('LLM 연결 준비중');
    } catch (error) {
      console.error(error);
      setConversationHelper(error.message || '대화를 불러오지 못했습니다.');
      setStatusText('대화 로딩 실패');
      switchView('list');
    }
  }

  async function deleteChatSession(chatId) {
    if (!chatId || !currentProject) {
      return;
    }
    const apiBase = getChatApiBase();
    if (!apiBase) {
      throw new Error('프로젝트 경로를 찾을 수 없습니다.');
    }
    const response = await fetcher(apiBase + '/' + encodeURIComponent(chatId), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || '대화를 삭제하지 못했습니다.');
    }
    chatSessions = chatSessions.filter(session => session.id !== chatId);
    if (activeChatSession && activeChatSession.id === chatId) {
      setConversation(null);
    } else {
      renderTopics();
    }
    setListHelper(chatSessions.length ? '' : '대화 기록이 없습니다. 새 토픽을 만들어 보세요.');
  }

  async function handleTopicSubmit(event) {
    event.preventDefault();
    if (!topicInput) {
      return;
    }
    if (!currentProject) {
      setListHelper('먼저 프로젝트를 선택하세요.');
      return;
    }
    const title = topicInput.value.trim();
    if (!title) {
      setListHelper('새 대화 주제를 입력하세요.');
      return;
    }
    const apiBase = getChatApiBase();
    if (!apiBase) {
      setListHelper('프로젝트 경로를 찾을 수 없습니다.');
      return;
    }
    setTopicFormLocked(true);
    setListHelper('새 대화를 준비하는 중입니다…');
    try {
      const response = await fetcher(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || '새 대화를 만들지 못했습니다.');
      }
      const session = payload.session;
      if (!session) {
        throw new Error('대화 생성 응답이 올바르지 않습니다.');
      }
      topicInput.value = '';
      const summary = summarizeSession(session);
      if (summary) {
        upsertSummary(summary);
        renderTopics();
      } else {
        await refreshSessions();
      }
      setListHelper('');
      setConversation(session);
    } catch (error) {
      console.error(error);
      setListHelper(error.message || '새 대화를 만들지 못했습니다.');
    } finally {
      setTopicFormLocked(false);
      syncTopicFormState();
    }
  }

  async function handleTopicDelete(chatId) {
    if (!chatId) {
      return;
    }
    const confirmed = window.confirm('이 대화를 삭제하시겠습니까?');
    if (!confirmed) {
      return;
    }
    try {
      await deleteChatSession(chatId);
    } catch (error) {
      console.error(error);
      setListHelper(error.message || '대화를 삭제하지 못했습니다.');
    }
  }

  function handleTopicClick(event) {
    const deleteButton = event.target.closest('.chatbot-topic__action');
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      const chatId = deleteButton.dataset.chatId;
      handleTopicDelete(chatId);
      return;
    }
    const openTarget = event.target.closest('.chatbot-topic__main');
    if (!openTarget) {
      return;
    }
    const chatId = openTarget.dataset.chatId;
    if (chatId) {
      openSession(chatId);
    }
  }

  async function handleMessageSubmit(event) {
    event.preventDefault();
    if (!chatInput || !activeChatSession || !currentProject) {
      setConversationHelper('대화를 먼저 선택하세요.');
      return;
    }
    const content = chatInput.value.trim();
    if (!content) {
      syncMessageFormState();
      return;
    }
    const apiBase = getChatApiBase();
    if (!apiBase) {
      setConversationHelper('프로젝트 경로를 찾을 수 없습니다.');
      return;
    }
    setMessageFormLocked(true);
    const tempId = 'local-' + Date.now();
    const tempMessage = {
      id: tempId,
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    };
    chatInput.value = '';
    syncMessageFormState();
    if (!Array.isArray(activeChatSession.messages)) {
      activeChatSession.messages = [];
    }
    activeChatSession.messages.push(tempMessage);
    renderMessages(activeChatSession);
    setConversationHelper('응답을 준비하는 중입니다…');
    try {
      const response = await fetcher(
        apiBase + '/' + encodeURIComponent(activeChatSession.id) + '/messages',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || '메시지를 전송하지 못했습니다.');
      }
      const session = payload.session;
      if (session) {
        activeChatSession = session;
        renderMessages(activeChatSession);
        const summary = summarizeSession(session);
        if (summary) {
          upsertSummary(summary);
          renderTopics();
        }
        setConversationHelper('답변은 "준비중입니다."로 표시됩니다.');
        setStatusText('LLM 연결 준비중');
      }
    } catch (error) {
      console.error(error);
      activeChatSession.messages = activeChatSession.messages.filter(message => message.id !== tempId);
      renderMessages(activeChatSession);
      setConversationHelper(error.message || '메시지를 전송하지 못했습니다.');
    } finally {
      setMessageFormLocked(false);
      syncMessageFormState();
    }
  }

  function resetInterface() {
    chatSessions = [];
    activeChatSession = null;
    isChatListLoading = false;
    isTopicFormLocked = false;
    isMessageFormLocked = false;
    setConversation(null);
    setStatusText('LLM 연결 준비중');
    setListHelper(
      currentProject
        ? '대화 기록이 없습니다. 새 토픽을 만들어 보세요.'
        : '프로젝트를 선택하면 대화를 시작할 수 있습니다.'
    );
    renderTopics();
    syncTopicFormState();
    syncMessageFormState();
  }

  if (topicForm) {
    topicForm.addEventListener('submit', handleTopicSubmit);
  }
  if (topicInput) {
    topicInput.addEventListener('input', () => syncTopicFormState());
  }
  if (topicsContainer) {
    topicsContainer.addEventListener('click', handleTopicClick);
  }
  if (headerBackButton) {
    headerBackButton.addEventListener('click', () => setConversation(null));
  }
  if (chatForm) {
    chatForm.addEventListener('submit', handleMessageSubmit);
  }
  if (chatInput) {
    chatInput.addEventListener('input', () => syncMessageFormState());
  }

  resetInterface();

  return {
    async setProject(projectName) {
      currentProject = projectName || null;
      resetInterface();
      if (currentProject) {
        await refreshSessions();
      }
    }
  };
}
