// Content script for CareerVerse AI
// Context extraction + Floating Assistant UI

(function() {
  'use strict';

  // ============================================
  // GEMINI API CONFIGURATION
  // ============================================
  // HARD-CODED API KEY FOR PROTOTYPE
  // 
  // GET YOUR API KEY:
  // 1. Visit: https://makersuite.google.com/app/apikey
  //    OR: https://aistudio.google.com/app/apikey
  // 2. Sign in with Google account
  // 3. Click "Create API Key"
  // 4. Copy the key (starts with "AIza...")
  // 5. Paste it below replacing the current key
  //
  // NOTE: This uses Google AI Studio API key (free tier available)
  //       The key should work with Gemini Pro model
  //       If you get API errors, try:
  //       - Regenerating your API key
  //       - Checking API quota/limits
  //       - Verifying the key has proper permissions
  //
  const GEMINI_API_KEY = 'AIzaSyACrev6cQPk_SguooBm7eV7yLCQQOtTLAo';
  // Try different API versions and models if one doesn't work:
  // Option 1: v1beta with gemini-1.0-pro (stable)
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent';
  
  // Option 2: If above doesn't work, try v1 API:
  // const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent';
  
  // Option 3: Try with versioned model names:
  // const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent';

  // ============================================
  // CONTEXT EXTRACTION ENGINE
  // ============================================

  /**
   * Extract comprehensive page context
   * Returns: { domain, title, headings[], textSnippet, codeBlocks[], detectedDomain }
   */
  function extractPageContext() {
    const domain = window.location.hostname.toLowerCase();
    const url = window.location.href;
    const title = document.title;

    // Extract headings (h1, h2, h3)
    const headings = [];
    const headingElements = document.querySelectorAll('h1, h2, h3');
    headingElements.forEach((el, idx) => {
      if (idx < 10) { // Limit to first 10 headings
        const text = el.textContent.trim();
        if (text && text.length < 200) {
          headings.push(text);
        }
      }
    });

    // Extract visible paragraphs (first few, limited length)
    const paragraphs = [];
    const paraElements = document.querySelectorAll('p');
    let totalLength = 0;
    const maxLength = 1000; // Limit total text length

    for (let i = 0; i < paraElements.length && totalLength < maxLength; i++) {
      const text = paraElements[i].textContent.trim();
      if (text && text.length > 20 && text.length < 500) {
        paragraphs.push(text);
        totalLength += text.length;
      }
    }

    const textSnippet = paragraphs.slice(0, 5).join(' ').substring(0, 800);

    // Extract code blocks
    const codeBlocks = [];
    const codeElements = document.querySelectorAll('pre code, code');
    codeElements.forEach((el, idx) => {
      if (idx < 5) { // Limit to first 5 code blocks
        const code = el.textContent.trim();
        if (code && code.length > 10 && code.length < 500) {
          codeBlocks.push(code.substring(0, 300)); // Truncate long code
        }
      }
    });

    // Detect domain type (coding, learning, article, etc.)
    let detectedDomain = 'general';
    if (domain.includes('leetcode') || domain.includes('hackerrank') || domain.includes('codewars') || 
        domain.includes('github') || domain.includes('stackoverflow')) {
      detectedDomain = 'coding';
    } else if (domain.includes('udemy') || domain.includes('coursera') || domain.includes('edx') || 
               domain.includes('khanacademy') || domain.includes('youtube.com')) {
      detectedDomain = 'learning';
    } else if (domain.includes('medium') || domain.includes('blog') || domain.includes('article')) {
      detectedDomain = 'article';
    }

    return {
      domain,
      url,
      title,
      headings: headings.slice(0, 8),
      textSnippet,
      codeBlocks: codeBlocks.slice(0, 3),
      detectedDomain
    };
  }

  // ============================================
  // FLOATING ASSISTANT UI
  // ============================================

  let chatHistory = [];
  let isMinimized = false;
  let isInitialized = false;

  /**
   * Inject CSS styles for floating assistant
   */
  function injectStyles() {
    // Avoid duplicate injection
    if (document.getElementById('careerverse-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'careerverse-styles';
    style.textContent = `
      #careerverse-assistant {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        max-height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      #careerverse-assistant.cv-minimized {
        max-height: 60px;
      }
      #careerverse-assistant.cv-minimized .cv-assistant-body,
      #careerverse-assistant.cv-minimized .cv-assistant-footer {
        display: none;
      }
      .cv-assistant-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .cv-assistant-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 16px;
      }
      .cv-icon {
        font-size: 24px;
        line-height: 1;
        display: inline-block;
        vertical-align: middle;
      }
      .cv-assistant-controls {
        display: flex;
        gap: 8px;
      }
      .cv-btn-minimize, .cv-btn-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      .cv-btn-minimize:hover, .cv-btn-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .cv-assistant-body {
        flex: 1;
        overflow-y: auto;
        max-height: 450px;
        padding: 16px;
        background: #f8f9fa;
      }
      .cv-welcome-message {
        background: white;
        padding: 12px 16px;
        border-radius: 12px;
        margin-bottom: 12px;
        font-size: 14px;
        color: #555;
        border-left: 3px solid #667eea;
      }
      .cv-welcome-message p {
        margin: 0;
      }
      .cv-suggestions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }
      .cv-suggestion-btn {
        background: white;
        border: 1px solid #e0e0e0;
        padding: 10px 14px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        text-align: left;
        color: #333;
        transition: all 0.2s;
      }
      .cv-suggestion-btn:hover {
        border-color: #667eea;
        background: #f0f4ff;
        transform: translateX(4px);
      }
      .cv-messages {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 100px;
      }
      .cv-message {
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 85%;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.5;
        animation: cvFadeIn 0.3s ease;
      }
      .cv-message-user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .cv-message-user::before {
        content: '🧑‍💻';
        font-size: 18px;
        line-height: 1;
        flex-shrink: 0;
      }
      .cv-message-assistant {
        background: white;
        color: #333;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .cv-message-assistant::before {
        content: '🤖';
        font-size: 18px;
        line-height: 1;
        flex-shrink: 0;
      }
      .cv-message-system {
        background: #e8f4f8;
        color: #555;
        align-self: center;
        font-size: 12px;
        max-width: 100%;
        text-align: center;
      }
      .cv-message p {
        margin: 0;
      }
      .cv-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        color: #667eea;
        font-size: 18px;
      }
      .cv-loading::before {
        content: '⏳';
        font-size: 20px;
        line-height: 1;
      }
      .cv-loading-dots {
        display: flex;
        gap: 6px;
        justify-content: center;
      }
      .cv-loading-dots span {
        width: 8px;
        height: 8px;
        background: #667eea;
        border-radius: 50%;
        animation: cvBounce 1.4s infinite ease-in-out both;
      }
      .cv-loading-dots span:nth-child(1) {
        animation-delay: -0.32s;
      }
      .cv-loading-dots span:nth-child(2) {
        animation-delay: -0.16s;
      }
      @keyframes cvBounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      @keyframes cvFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .cv-assistant-footer {
        padding: 16px;
        background: white;
        border-top: 1px solid #e0e0e0;
      }
      .cv-input-container {
        display: flex;
        gap: 8px;
      }
      #cv-chat-input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 24px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }
      #cv-chat-input:focus {
        border-color: #667eea;
      }
      .cv-send-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 24px;
        cursor: pointer;
        font-size: 18px;
        font-weight: 600;
        transition: transform 0.2s, box-shadow 0.2s;
        min-width: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cv-send-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      .cv-send-btn:active {
        transform: translateY(0);
      }
      .cv-assistant-body::-webkit-scrollbar {
        width: 6px;
      }
      .cv-assistant-body::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .cv-assistant-body::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
      }
      .cv-assistant-body::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      @media (max-width: 480px) {
        #careerverse-assistant {
          width: calc(100vw - 40px);
          right: 20px;
          left: 20px;
          max-width: 380px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create and inject floating assistant UI
   */
  function createFloatingAssistant() {
    // Avoid duplicate injection
    if (document.getElementById('careerverse-assistant')) {
      return;
    }

    // Inject styles first
    injectStyles();

    const assistant = document.createElement('div');
    assistant.id = 'careerverse-assistant';
    assistant.innerHTML = `
      <div class="cv-assistant-header">
        <div class="cv-assistant-title">
          <span class="cv-icon">🤖</span>
          <span>CareerVerse AI</span>
        </div>
        <div class="cv-assistant-controls">
          <button class="cv-btn-minimize" id="cv-minimize-btn" title="Minimize">−</button>
          <button class="cv-btn-close" id="cv-close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="cv-assistant-body" id="cv-chat-body">
        <div class="cv-welcome-message">
          <p>👋 I'm analyzing this page...</p>
        </div>
        <div class="cv-suggestions" id="cv-suggestions"></div>
        <div class="cv-messages" id="cv-messages"></div>
        <div class="cv-loading" id="cv-loading" style="display: none;">
          <div class="cv-loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
      <div class="cv-assistant-footer">
        <div class="cv-input-container">
          <input type="text" id="cv-chat-input" placeholder="💬 Ask me anything about this page..." />
          <button id="cv-send-btn" class="cv-send-btn" title="Send message">📤</button>
        </div>
      </div>
    `;

    document.body.appendChild(assistant);
    attachEventListeners();
    isInitialized = true;

    // Auto-analyze on load
    setTimeout(() => {
      autoAnalyzeAndSuggest();
    }, 500);
  }

  /**
   * Attach event listeners to assistant UI
   */
  function attachEventListeners() {
    const minimizeBtn = document.getElementById('cv-minimize-btn');
    const closeBtn = document.getElementById('cv-close-btn');
    const sendBtn = document.getElementById('cv-send-btn');
    const chatInput = document.getElementById('cv-chat-input');

    minimizeBtn?.addEventListener('click', toggleMinimize);
    closeBtn?.addEventListener('click', closeAssistant);
    sendBtn?.addEventListener('click', handleSendMessage);
    
    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    });
  }

  /**
   * Toggle minimize/maximize
   */
  function toggleMinimize() {
    const assistant = document.getElementById('careerverse-assistant');
    if (!assistant) return;

    isMinimized = !isMinimized;
    if (isMinimized) {
      assistant.classList.add('cv-minimized');
      document.getElementById('cv-minimize-btn').textContent = '+';
    } else {
      assistant.classList.remove('cv-minimized');
      document.getElementById('cv-minimize-btn').textContent = '−';
    }
  }

  /**
   * Close assistant
   */
  function closeAssistant() {
    const assistant = document.getElementById('careerverse-assistant');
    if (assistant) {
      assistant.style.display = 'none';
    }
  }

  /**
   * Auto-analyze page and show suggestions
   */
  async function autoAnalyzeAndSuggest() {
    const context = extractPageContext();
    const suggestionsContainer = document.getElementById('cv-suggestions');
    const welcomeMsg = document.querySelector('.cv-welcome-message');

    // Show welcome message
    if (welcomeMsg) {
      welcomeMsg.innerHTML = `<p>📄 Analyzing: <strong>${context.title.substring(0, 50)}</strong></p>`;
    }

    // Generate context-aware suggestions
    const suggestions = generateSuggestions(context);
    
    if (suggestionsContainer) {
      suggestionsContainer.innerHTML = suggestions.map((s, idx) => `
        <button class="cv-suggestion-btn" data-suggestion="${idx}">${s}</button>
      `).join('');

      // Attach click handlers
      suggestionsContainer.querySelectorAll('.cv-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-suggestion'));
          sendMessage(suggestions[idx], true);
        });
      });
    }

    // Auto-send initial analysis
    setTimeout(() => {
      sendMessage('Analyze this page and provide helpful guidance.', true);
    }, 1000);
  }

  /**
   * Generate context-aware suggestions
   */
  function generateSuggestions(context) {
    if (context.detectedDomain === 'coding') {
      return [
        'Explain this problem simply',
        'How should I approach this?',
        'What concepts should I review?'
      ];
    } else if (context.detectedDomain === 'learning') {
      return [
        'Summarize this lesson',
        'How should I study this?',
        'What are the key takeaways?'
      ];
    } else if (context.detectedDomain === 'article') {
      return [
        'Explain this simply',
        'What are the main points?',
        'What should I learn next?'
      ];
    } else {
      return [
        'Explain this content',
        'What should I focus on?',
        'How can I learn more?'
      ];
    }
  }

  /**
   * Handle send message
   */
  function handleSendMessage() {
    const input = document.getElementById('cv-chat-input');
    const message = input?.value.trim();
    if (message) {
      sendMessage(message, false);
      input.value = '';
    }
  }

  /**
   * Send message to Gemini and display response
   */
  async function sendMessage(userMessage, isAuto = false) {
    const messagesContainer = document.getElementById('cv-messages');
    const suggestionsContainer = document.getElementById('cv-suggestions');
    const loadingEl = document.getElementById('cv-loading');

    // Hide suggestions after first user message
    if (suggestionsContainer && !isAuto) {
      suggestionsContainer.style.display = 'none';
    }

    // Add user message to chat
    if (!isAuto) {
      addMessage('user', userMessage);
    } else {
      // For auto messages, show a system message
      if (messagesContainer) {
        const systemMsg = document.createElement('div');
        systemMsg.className = 'cv-message cv-message-system';
        systemMsg.innerHTML = `<p><span class="emoji-inline">💭</span> ${escapeHtml(userMessage)}</p>`;
        messagesContainer.appendChild(systemMsg);
      }
    }

    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

    // Show loading
    if (loadingEl) loadingEl.style.display = 'block';
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const context = extractPageContext();
      const response = await callGeminiAPI(userMessage, context);
      
      // Hide loading
      if (loadingEl) loadingEl.style.display = 'none';

      // Add AI response
      addMessage('assistant', response);
      chatHistory.push({ role: 'model', parts: [{ text: response }] });

    } catch (error) {
      console.error('Gemini API error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        error: error
      });
      if (loadingEl) loadingEl.style.display = 'none';
      
      // Show detailed error message
      let errorMsg = 'Sorry, I encountered an error. ';
      
      // Try to extract meaningful error information
      if (error.message) {
        errorMsg += error.message;
      } else if (error.toString && error.toString() !== '[object Object]') {
        errorMsg += error.toString();
      } else {
        // Try to stringify the error object
        try {
          const errorStr = JSON.stringify(error);
          if (errorStr && errorStr !== '{}') {
            errorMsg += errorStr;
          } else {
            errorMsg += 'Please check your API key and try again. Open browser console (F12) for details.';
          }
        } catch (e) {
          errorMsg += 'Please check your API key and try again. Open browser console (F12) for details.';
        }
      }
      
      addMessage('assistant', errorMsg);
    }
  }

  /**
   * Add message to chat UI
   */
  function addMessage(role, text) {
    const messagesContainer = document.getElementById('cv-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `cv-message cv-message-${role}`;
    messageDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Call Gemini API
   */
  async function callGeminiAPI(userMessage, context) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in content.js');
    }

    // Build system prompt
    const systemPrompt = `You are an intelligent learning and career assistant called CareerVerse AI.
You analyze what the user is currently doing on a webpage and provide helpful guidance without giving full answers or copyrighted content.

Guidelines:
- Be concise and helpful
- Provide hints, not full solutions for coding problems
- Summarize learning content, don't copy it
- Be ethical (no cheating, no medical diagnosis)
- Adapt your response to the context (coding, learning, articles, etc.)
- Use a friendly, supportive tone`;

    // Build context description
    let contextText = `Current Page Context:
- Domain: ${context.domain}
- Title: ${context.title}
- Type: ${context.detectedDomain}`;

    if (context.headings.length > 0) {
      contextText += `\n- Headings: ${context.headings.join(', ')}`;
    }
    if (context.textSnippet) {
      contextText += `\n- Content snippet: ${context.textSnippet}`;
    }
    if (context.codeBlocks.length > 0) {
      contextText += `\n- Code blocks present: Yes`;
    }

    // Build full prompt
    const fullPrompt = `${systemPrompt}\n\n${contextText}\n\nUser question: ${userMessage}`;

    try {
      // Call Gemini API
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }]
        })
      });

      if (!response.ok) {
        let errorData = {};
        try {
          const responseText = await response.text();
          console.error('API Error Response:', responseText);
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error('Could not parse error response:', e);
          errorData = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
        }
        
        const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
        const errorCode = errorData.error?.code || response.status;
        
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorCode: errorCode,
          errorMessage: errorMessage,
          fullError: errorData
        });
        
        // Provide user-friendly error messages
        if (errorCode === 400) {
          throw new Error(`Invalid API request: ${errorMessage}. Please check your API key format.`);
        } else if (errorCode === 401 || errorCode === 403) {
          throw new Error(`API key error (${errorCode}): ${errorMessage}. Please verify your API key is correct. Get a new key at https://aistudio.google.com/app/apikey`);
        } else if (errorCode === 429) {
          throw new Error(`Rate limit exceeded: ${errorMessage}. Please try again later.`);
        } else {
          throw new Error(`API error (${errorCode}): ${errorMessage}`);
        }
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        // Check if there's a safety rating issue
        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
          throw new Error('Response blocked by safety filters. Please try a different question.');
        }
        throw new Error('No response from Gemini API. The model may have been blocked or returned an empty response.');
      }

      return generatedText;
    } catch (error) {
      // Re-throw with more context if it's a network error
      if (error.name === 'TypeError' && error.message && error.message.includes('fetch')) {
        throw new Error('Network error: Could not connect to Gemini API. Please check your internet connection and CORS settings.');
      }
      // If it's already an Error object with a message, re-throw it
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise, wrap it in an Error
      throw new Error(`API call failed: ${error.toString() || JSON.stringify(error)}`);
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(createFloatingAssistant, 500);
    });
  } else {
    setTimeout(createFloatingAssistant, 500);
  }

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getContext') {
      sendResponse(extractPageContext());
    } else if (request.action === 'toggleAssistant') {
      const assistant = document.getElementById('careerverse-assistant');
      if (assistant) {
        if (assistant.style.display === 'none') {
          assistant.style.display = 'block';
        } else {
          toggleMinimize();
        }
      } else {
        createFloatingAssistant();
      }
      sendResponse({ success: true });
    }
    return true;
  });

})();

