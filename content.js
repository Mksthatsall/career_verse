
// Content script for CareerVerse AI
// Context extraction + Floating Assistant UI

(function() {
  'use strict';

  // ============================================
  // PREVENT RUNNING IN EXTENSION PAGES
  // ============================================
  // Content scripts should NOT run in extension pages (popup, options, etc.)
  // Check if we're in an extension page and exit early
  if (window.location.protocol === 'chrome-extension:' || 
      window.location.protocol === 'moz-extension:' ||
      window.location.href.startsWith('chrome-extension://') ||
      window.location.href.startsWith('moz-extension://') ||
      document.querySelector('body[data-popup="true"]')) {
    console.log('CareerVerse: Content script skipped in extension page');
    return; // Exit early, don't run content script
  }

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
  // HARD-CODED API KEY (paste your key here)
  // Example key formats from Google typically start with "AIza". Replace the value below with your key.
  const GEMINI_API_KEY = 'AIzaSyDXRgEwzIP1zHhNGmHUASc_bAJZGwR_71E';

  // Model selection: choose either 'gemini-2.5-flash' or 'gemini-1.0-pro'
  // Set to 'gemini-2.5-flash' by default (flash model). Change to 'gemini-1.0-pro' for the pro model.
  const GEMINI_MODEL = 'gemini-2.5-flash';

  // API version to use. Some models require 'v1' while others may be available under 'v1beta'.
  // If you get 404/400 errors, try switching this to 'v1beta'.
  const GEMINI_API_VERSION = 'v1';

  // Construct the API URL from the selected version and model
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent`;

  // Examples (if you need to try alternatives):
  // const GEMINI_MODEL = 'gemini-1.0-pro';
  // const GEMINI_API_VERSION = 'v1beta';
  // const GEMINI_API_URL = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent`;

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
  // ACTIVITY TRACKING
  // ============================================

  /**
   * Detect career domain from page context
   */
  function detectCareerDomain(context) {
    const domain = context.domain.toLowerCase();
    const url = context.url.toLowerCase();
    const title = context.title.toLowerCase();

    // Software/IT detection
    if (domain.includes('leetcode') || domain.includes('hackerrank') || 
        domain.includes('codewars') || domain.includes('github') || 
        domain.includes('stackoverflow') || domain.includes('freecodecamp') ||
        url.includes('javascript') || url.includes('python') || 
        url.includes('react') || url.includes('node')) {
      return 'software';
    }

    // Design detection
    if (domain.includes('figma') || domain.includes('dribbble') || 
        domain.includes('behance') || url.includes('design') || 
        title.includes('ui') || title.includes('ux')) {
      return 'design';
    }

    // Accounts/Finance detection
    if (domain.includes('accounting') || domain.includes('finance') || 
        url.includes('excel') || url.includes('tally') || 
        title.includes('accounting') || title.includes('finance')) {
      return 'accounts';
    }

    // Business detection
    if (domain.includes('business') || domain.includes('startup') || 
        url.includes('marketing') || url.includes('sales') || 
        title.includes('business') || title.includes('startup')) {
      return 'business';
    }

    // Cooking detection
    if (domain.includes('cooking') || domain.includes('recipe') || 
        url.includes('cooking') || url.includes('culinary') || 
        title.includes('cooking') || title.includes('recipe')) {
      return 'cooking';
    }

    // Painting/Arts detection
    if (domain.includes('art') || domain.includes('painting') || 
        url.includes('art') || url.includes('painting') || 
        title.includes('art') || title.includes('painting')) {
      return 'painting';
    }

    // Medical detection
    if (domain.includes('medical') || domain.includes('health') || 
        url.includes('medical') || url.includes('healthcare') || 
        title.includes('medical') || title.includes('health')) {
      return 'medical';
    }

    return 'general';
  }

  /**
   * Infer activity type from page context
   */
  function inferActivityType(context) {
    const domain = context.domain.toLowerCase();
    const url = context.url.toLowerCase();
    const title = context.title.toLowerCase();

    if (domain.includes('leetcode') || domain.includes('hackerrank') || domain.includes('codewars')) {
      return 'Solved coding problem';
    }
    if (domain.includes('github')) {
      return 'Viewed code repository';
    }
    if (domain.includes('udemy') || domain.includes('coursera') || domain.includes('edx')) {
      return 'Completed course lesson';
    }
    if (domain.includes('youtube.com')) {
      return 'Watched tutorial video';
    }
    if (domain.includes('medium') || domain.includes('blog')) {
      return 'Read article';
    }
    if (context.codeBlocks.length > 0) {
      return 'Reviewed code';
    }
    if (context.detectedDomain === 'learning') {
      return 'Learning activity';
    }
    
    return 'Page visit';
  }

  /**
   * Log activity to Firebase via background script
   */
  async function logActivity(context) {
    try {
      const careerDomain = detectCareerDomain(context);
      const activityType = inferActivityType(context);

      // Only log if it's a learning-related domain
      if (careerDomain !== 'general' || context.detectedDomain !== 'general') {
        await chrome.runtime.sendMessage({
          action: 'logActivity',
          activity: {
            domain: careerDomain,
            activityType: activityType,
            url: context.url,
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Track page visits with debouncing (log once per page)
  let lastLoggedUrl = null;
  let activityLogged = false;

  /**
   * Track page activity when page loads or changes
   */
  function trackPageActivity() {
    const currentUrl = window.location.href;
    
    // Only log if URL changed or it's a learning platform
    if (currentUrl !== lastLoggedUrl || !activityLogged) {
      const context = extractPageContext();
      
      // Log activity if it's a learning platform
      if (context.detectedDomain !== 'general' || 
          context.domain.includes('leetcode') || 
          context.domain.includes('coursera') ||
          context.domain.includes('udemy') ||
          context.domain.includes('github')) {
        logActivity(context);
        lastLoggedUrl = currentUrl;
        activityLogged = true;
      }
    }
  }

  // Track activity on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(trackPageActivity, 2000); // Wait 2 seconds for page to fully load
    });
  } else {
    setTimeout(trackPageActivity, 2000);
  }

  // Track activity when URL changes (SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      activityLogged = false;
      setTimeout(trackPageActivity, 2000);
    }
  }).observe(document, { subtree: true, childList: true });

  // ============================================
  // FLOATING ASSISTANT UI
  // ============================================

  let chatHistory = [];
  let isMinimized = false;
  let isInitialized = false;
  let currentView = 'chat'; // 'chat', 'resume', 'progress', 'jobs'

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
        width: min(700px, calc(100vw - 40px));
        max-width: 90vw;
        max-height: min(700px, calc(100vh - 40px));
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: row-reverse;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      #careerverse-assistant.cv-minimized {
        max-height: 60px;
        width: 380px;
      }
      #careerverse-assistant.cv-minimized .cv-sidebar,
      #careerverse-assistant.cv-minimized .cv-assistant-body,
      #careerverse-assistant.cv-minimized .cv-assistant-footer {
        display: none;
      }
      .cv-sidebar {
        width: 180px;
        min-width: 140px;
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        padding: 16px 0;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
        position: relative;
        z-index: 1;
        overflow: hidden;
      }
      .cv-sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 8px;
      }
      .cv-nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
        font-size: 14px;
        font-weight: 500;
      }
      .cv-nav-item:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }
      .cv-nav-item.active {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        font-weight: 600;
      }
      .cv-nav-item-icon {
        font-size: 18px;
        width: 24px;
        text-align: center;
      }
      .cv-main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .cv-view {
        display: none;
        flex-direction: column;
        height: 100%;
      }
      .cv-view.active {
        display: flex;
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
        overflow-x: hidden;
        padding: 16px;
        padding-right: 12px; /* Space for scrollbar */
        background: #f8f9fa;
        min-width: 0;
        position: relative;
        scrollbar-gutter: stable;
      }
      .cv-resume-section, .cv-progress-section, .cv-jobs-section {
        background: white;
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 12px;
      }
      .cv-resume-section h3, .cv-progress-section h3, .cv-jobs-section h3 {
        margin: 0 0 12px 0;
        color: #667eea;
        font-size: 16px;
        font-weight: 600;
      }
      .cv-form-group {
        margin-bottom: 16px;
      }
      .cv-form-group label {
        display: block;
        margin-bottom: 6px;
        color: #555;
        font-size: 13px;
        font-weight: 500;
      }
      .cv-form-group input, .cv-form-group textarea {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      .cv-form-group input:focus, .cv-form-group textarea:focus {
        outline: none;
        border-color: #667eea;
      }
      .cv-form-group textarea {
        resize: vertical;
        min-height: 80px;
      }
      .cv-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .cv-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      .cv-btn-secondary {
        background: #f0f0f0;
        color: #333;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        margin-left: 8px;
      }
      .cv-btn-secondary:hover {
        background: #e0e0e0;
      }
      .cv-item-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .cv-item-card {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 8px;
        border-left: 3px solid #667eea;
      }
      .cv-item-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .cv-item-card-title {
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }
      .cv-item-card-date {
        font-size: 12px;
        color: #999;
      }
      .cv-progress-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }
      .cv-stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px;
        border-radius: 12px;
        text-align: center;
      }
      .cv-stat-value {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .cv-stat-label {
        font-size: 12px;
        opacity: 0.9;
      }
      .cv-job-card {
        background: #f8f9fa;
        padding: 14px;
        border-radius: 10px;
        margin-bottom: 12px;
        border-left: 4px solid #667eea;
      }
      .cv-job-card-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 8px;
      }
      .cv-job-title {
        font-weight: 600;
        color: #333;
        font-size: 15px;
        margin-bottom: 4px;
      }
      .cv-job-company {
        font-size: 13px;
        color: #667eea;
      }
      .cv-job-status {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
      }
      .cv-job-status.applied {
        background: #e3f2fd;
        color: #1976d2;
      }
      .cv-job-status.interview {
        background: #fff3e0;
        color: #f57c00;
      }
      .cv-job-status.offer {
        background: #e8f5e9;
        color: #388e3c;
      }
      .cv-job-status.rejected {
        background: #ffebee;
        color: #d32f2f;
      }
      .cv-job-details {
        font-size: 12px;
        color: #666;
        margin-top: 8px;
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
        width: 10px;
        position: absolute;
        right: 0;
      }
      .cv-assistant-body::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 0;
        margin: 0;
        border-left: 1px solid #e9ecef;
      }
      .cv-assistant-body::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 5px;
        border: 2px solid #f1f1f1;
        min-height: 30px;
      }
      .cv-assistant-body::-webkit-scrollbar-thumb:hover {
        background: #999;
      }
      /* Firefox scrollbar */
      .cv-assistant-body {
        scrollbar-width: thin;
        scrollbar-color: #ccc #f1f1f1;
      }
      @media (max-width: 1024px) {
        #careerverse-assistant {
          width: min(600px, calc(100vw - 40px));
          max-height: min(650px, calc(100vh - 40px));
        }
        .cv-sidebar {
          width: 160px;
          min-width: 120px;
        }
      }
      @media (max-width: 768px) {
        #careerverse-assistant {
          width: calc(100vw - 40px);
          right: 20px;
          left: 20px;
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 40px);
        }
        .cv-sidebar {
          width: 140px;
          min-width: 100px;
        }
        .cv-nav-item {
          padding: 10px 12px;
          font-size: 13px;
        }
        .cv-nav-item span:not(.cv-nav-item-icon) {
          display: none;
        }
      }
      @media (max-width: 640px) {
        #careerverse-assistant {
          width: calc(100vw - 20px);
          right: 10px;
          left: 10px;
          max-width: calc(100vw - 20px);
          max-height: calc(100vh - 20px);
        }
        .cv-sidebar {
          width: 120px;
          min-width: 80px;
        }
        .cv-main-content {
          font-size: 14px;
        }
      }
      @media (max-width: 480px) {
        #careerverse-assistant {
          flex-direction: column;
          width: calc(100vw - 20px);
          max-width: calc(100vw - 20px);
          max-height: calc(100vh - 20px);
          bottom: 10px;
          right: 10px;
          left: 10px;
        }
        .cv-sidebar {
          width: 100%;
          min-width: 100%;
          flex-direction: row;
          padding: 8px;
        }
        .cv-sidebar-nav {
          flex-direction: row;
          width: 100%;
          gap: 4px;
        }
        .cv-nav-item {
          flex: 1;
          justify-content: center;
          padding: 8px;
          font-size: 12px;
        }
        .cv-nav-item span:not(.cv-nav-item-icon) {
          display: none;
        }
        .cv-assistant-header {
          padding: 12px 16px;
        }
        .cv-assistant-title {
          font-size: 14px;
        }
        .cv-assistant-body {
          padding: 12px;
        }
        .cv-form-group {
          margin-bottom: 12px;
        }
        .cv-form-group input, .cv-form-group textarea {
          padding: 8px 10px;
          font-size: 13px;
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
      <div class="cv-main-content">
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
        
        <!-- Chat View -->
        <div class="cv-view active" id="cv-chat-view">
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
        </div>
        
        <!-- Resume View -->
        <div class="cv-view" id="cv-resume-view">
          <div class="cv-assistant-body">
            <div class="cv-resume-section">
              <h3>📄 Resume Builder</h3>
              <div class="cv-form-group">
                <label>Full Name</label>
                <input type="text" id="cv-resume-name" placeholder="Enter your full name">
              </div>
              <div class="cv-form-group">
                <label>Email</label>
                <input type="email" id="cv-resume-email" placeholder="your.email@example.com">
              </div>
              <div class="cv-form-group">
                <label>Phone</label>
                <input type="tel" id="cv-resume-phone" placeholder="+1 (555) 123-4567">
              </div>
              <div class="cv-form-group">
                <label>Professional Summary</label>
                <textarea id="cv-resume-summary" placeholder="Brief summary of your professional background..."></textarea>
              </div>
              <div class="cv-form-group">
                <label>Skills (comma-separated)</label>
                <input type="text" id="cv-resume-skills" placeholder="JavaScript, Python, React, etc.">
              </div>
              <div class="cv-form-group">
                <label>Experience</label>
                <textarea id="cv-resume-experience" placeholder="Job Title, Company, Duration&#10;Description of responsibilities..."></textarea>
              </div>
              <div class="cv-form-group">
                <label>Education</label>
                <textarea id="cv-resume-education" placeholder="Degree, University, Year&#10;Relevant coursework or achievements..."></textarea>
              </div>
              <button class="cv-btn-primary" id="cv-save-resume-btn">💾 Save Resume</button>
              <button class="cv-btn-secondary" id="cv-download-resume-btn">📥 Download PDF</button>
            </div>
          </div>
        </div>
        
        <!-- Progress View -->
        <div class="cv-view" id="cv-progress-view">
          <div class="cv-assistant-body">
            <div class="cv-progress-section">
              <h3>📊 My Progress</h3>
              <div class="cv-progress-stats">
                <div class="cv-stat-card">
                  <div class="cv-stat-value" id="cv-stat-jobs-applied">0</div>
                  <div class="cv-stat-label">Jobs Applied</div>
                </div>
                <div class="cv-stat-card">
                  <div class="cv-stat-value" id="cv-stat-interviews">0</div>
                  <div class="cv-stat-label">Interviews</div>
                </div>
                <div class="cv-stat-card">
                  <div class="cv-stat-value" id="cv-stat-skills-learned">0</div>
                  <div class="cv-stat-label">Skills Learned</div>
                </div>
                <div class="cv-stat-card">
                  <div class="cv-stat-value" id="cv-stat-days-active">0</div>
                  <div class="cv-stat-label">Days Active</div>
                </div>
              </div>
              <h4 style="margin: 16px 0 8px 0; font-size: 14px; color: #555;">Recent Activity</h4>
              <div class="cv-item-list" id="cv-progress-activity"></div>
            </div>
          </div>
        </div>
        
        <!-- Jobs View -->
        <div class="cv-view" id="cv-jobs-view">
          <div class="cv-assistant-body">
            <div class="cv-jobs-section">
              <h3>💼 Job Applications</h3>
              <div class="cv-form-group">
                <label>Job Title</label>
                <input type="text" id="cv-job-title" placeholder="e.g., Software Engineer">
              </div>
              <div class="cv-form-group">
                <label>Company</label>
                <input type="text" id="cv-job-company" placeholder="Company name">
              </div>
              <div class="cv-form-group">
                <label>Status</label>
                <select id="cv-job-status" style="width: 100%; padding: 10px 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px;">
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div class="cv-form-group">
                <label>Notes</label>
                <textarea id="cv-job-notes" placeholder="Additional notes about this application..."></textarea>
              </div>
              <button class="cv-btn-primary" id="cv-add-job-btn">➕ Add Job Application</button>
              <h4 style="margin: 20px 0 12px 0; font-size: 14px; color: #555;">Your Applications</h4>
              <div class="cv-item-list" id="cv-jobs-list"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="cv-sidebar">
        <div class="cv-sidebar-nav">
          <div class="cv-nav-item active" data-view="chat">
            <span class="cv-nav-item-icon">💬</span>
            <span>Chat</span>
          </div>
          <div class="cv-nav-item" data-view="resume">
            <span class="cv-nav-item-icon">📄</span>
            <span>Resume</span>
          </div>
          <div class="cv-nav-item" data-view="progress">
            <span class="cv-nav-item-icon">📊</span>
            <span>Progress</span>
          </div>
          <div class="cv-nav-item" data-view="jobs">
            <span class="cv-nav-item-icon">💼</span>
            <span>Job Updates</span>
          </div>
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

    // Navigation
    document.querySelectorAll('.cv-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        switchView(view);
      });
    });

    // Resume handlers
    document.getElementById('cv-save-resume-btn')?.addEventListener('click', saveResume);
    document.getElementById('cv-download-resume-btn')?.addEventListener('click', downloadResume);

    // Jobs handlers
    document.getElementById('cv-add-job-btn')?.addEventListener('click', addJobApplication);

    // Load data when views are shown
    loadResumeData();
    loadProgressData();
    loadJobsData();
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
   * Switch between views
   */
  function switchView(viewName) {
    currentView = viewName;
    
    // Update nav items
    document.querySelectorAll('.cv-nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update views
    document.querySelectorAll('.cv-view').forEach(view => {
      if (view.id === `cv-${viewName}-view`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Load data for the view
    if (viewName === 'resume') {
      loadResumeData();
    } else if (viewName === 'progress') {
      loadProgressData();
    } else if (viewName === 'jobs') {
      loadJobsData();
    }
  }

  /**
   * Resume Management
   */
  async function saveResume() {
    const resumeData = {
      name: document.getElementById('cv-resume-name').value,
      email: document.getElementById('cv-resume-email').value,
      phone: document.getElementById('cv-resume-phone').value,
      summary: document.getElementById('cv-resume-summary').value,
      skills: document.getElementById('cv-resume-skills').value.split(',').map(s => s.trim()).filter(s => s),
      experience: document.getElementById('cv-resume-experience').value,
      education: document.getElementById('cv-resume-education').value,
      lastUpdated: new Date().toISOString()
    };

    try {
      await chrome.storage.local.set({ careerverseResume: resumeData });
      
      // Show success feedback
      const saveBtn = document.getElementById('cv-save-resume-btn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '✅ Saved!';
      saveBtn.style.background = '#4caf50';
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
      }, 2000);
      
      updateProgressActivity('Resume updated');
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Error saving resume. Please try again.');
    }
  }

  async function loadResumeData() {
    try {
      const result = await chrome.storage.local.get(['careerverseResume']);
      const resume = result.careerverseResume;
      
      if (resume) {
        document.getElementById('cv-resume-name').value = resume.name || '';
        document.getElementById('cv-resume-email').value = resume.email || '';
        document.getElementById('cv-resume-phone').value = resume.phone || '';
        document.getElementById('cv-resume-summary').value = resume.summary || '';
        document.getElementById('cv-resume-skills').value = resume.skills ? resume.skills.join(', ') : '';
        document.getElementById('cv-resume-experience').value = resume.experience || '';
        document.getElementById('cv-resume-education').value = resume.education || '';
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    }
  }

  function downloadResume() {
    const resumeData = {
      name: document.getElementById('cv-resume-name').value,
      email: document.getElementById('cv-resume-email').value,
      phone: document.getElementById('cv-resume-phone').value,
      summary: document.getElementById('cv-resume-summary').value,
      skills: document.getElementById('cv-resume-skills').value,
      experience: document.getElementById('cv-resume-experience').value,
      education: document.getElementById('cv-resume-education').value
    };

    // Create a simple text version
    let resumeText = `RESUME\n`;
    resumeText += `==================\n\n`;
    resumeText += `Name: ${resumeData.name}\n`;
    resumeText += `Email: ${resumeData.email}\n`;
    resumeText += `Phone: ${resumeData.phone}\n\n`;
    resumeText += `PROFESSIONAL SUMMARY\n`;
    resumeText += `${resumeData.summary}\n\n`;
    resumeText += `SKILLS\n`;
    resumeText += `${resumeData.skills}\n\n`;
    resumeText += `EXPERIENCE\n`;
    resumeText += `${resumeData.experience}\n\n`;
    resumeText += `EDUCATION\n`;
    resumeText += `${resumeData.education}\n`;

    // Create blob and download
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${resumeData.name || 'careerverse'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Progress Management
   */
  async function loadProgressData() {
    try {
      const [resumeResult, jobsResult, progressResult] = await Promise.all([
        chrome.storage.local.get(['careerverseResume']),
        chrome.storage.local.get(['careerverseJobs']),
        chrome.storage.local.get(['careerverseProgress'])
      ]);

      const jobs = jobsResult.careerverseJobs || [];
      const progress = progressResult.careerverseProgress || { activities: [], startDate: new Date().toISOString() };

      // Calculate stats
      const jobsApplied = jobs.length;
      const interviews = jobs.filter(j => j.status === 'interview' || j.status === 'offer').length;
      const resume = resumeResult.careerverseResume;
      const skillsLearned = resume?.skills?.length || 0;
      
      // Calculate days active
      const startDate = new Date(progress.startDate);
      const today = new Date();
      const daysActive = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Update stats
      document.getElementById('cv-stat-jobs-applied').textContent = jobsApplied;
      document.getElementById('cv-stat-interviews').textContent = interviews;
      document.getElementById('cv-stat-skills-learned').textContent = skillsLearned;
      document.getElementById('cv-stat-days-active').textContent = daysActive;

      // Display activities
      const activityList = document.getElementById('cv-progress-activity');
      const activities = progress.activities || [];
      
      if (activities.length === 0) {
        activityList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No activity yet. Start building your career!</div>';
      } else {
        activityList.innerHTML = activities.slice().reverse().slice(0, 10).map(activity => `
          <div class="cv-item-card">
            <div class="cv-item-card-header">
              <div class="cv-item-card-title">${escapeHtml(activity.text)}</div>
              <div class="cv-item-card-date">${activity.date}</div>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  async function updateProgressActivity(text) {
    try {
      const result = await chrome.storage.local.get(['careerverseProgress']);
      const progress = result.careerverseProgress || { activities: [], startDate: new Date().toISOString() };
      
      progress.activities.push({
        text: text,
        date: new Date().toLocaleDateString()
      });

      // Keep only last 50 activities
      if (progress.activities.length > 50) {
        progress.activities = progress.activities.slice(-50);
      }

      await chrome.storage.local.set({ careerverseProgress: progress });
      
      if (currentView === 'progress') {
        loadProgressData();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  /**
   * Jobs Management
   */
  async function addJobApplication() {
    const jobTitle = document.getElementById('cv-job-title').value.trim();
    const company = document.getElementById('cv-job-company').value.trim();
    const status = document.getElementById('cv-job-status').value;
    const notes = document.getElementById('cv-job-notes').value.trim();

    if (!jobTitle || !company) {
      alert('Please fill in job title and company name.');
      return;
    }

    try {
      const result = await chrome.storage.local.get(['careerverseJobs']);
      const jobs = result.careerverseJobs || [];

      jobs.push({
        id: Date.now(),
        title: jobTitle,
        company: company,
        status: status,
        notes: notes,
        date: new Date().toLocaleDateString()
      });

      await chrome.storage.local.set({ careerverseJobs: jobs });

      // Clear form
      document.getElementById('cv-job-title').value = '';
      document.getElementById('cv-job-company').value = '';
      document.getElementById('cv-job-status').value = 'applied';
      document.getElementById('cv-job-notes').value = '';

      // Reload jobs list
      loadJobsData();
      updateProgressActivity(`Applied to ${jobTitle} at ${company}`);
    } catch (error) {
      console.error('Error adding job:', error);
      alert('Error adding job application. Please try again.');
    }
  }

  async function loadJobsData() {
    try {
      const result = await chrome.storage.local.get(['careerverseJobs']);
      const jobs = result.careerverseJobs || [];
      const jobsList = document.getElementById('cv-jobs-list');

      if (jobs.length === 0) {
        jobsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No job applications yet. Add your first application above!</div>';
      } else {
        jobsList.innerHTML = jobs.slice().reverse().map(job => `
          <div class="cv-job-card">
            <div class="cv-job-card-header">
              <div>
                <div class="cv-job-title">${escapeHtml(job.title)}</div>
                <div class="cv-job-company">${escapeHtml(job.company)}</div>
              </div>
              <span class="cv-job-status ${job.status}">${job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
            </div>
            ${job.notes ? `<div class="cv-job-details">${escapeHtml(job.notes)}</div>` : ''}
            <div class="cv-job-details">Applied on: ${job.date}</div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
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
   * Format text - simple conversion of line breaks to HTML
   */
  function formatMessageText(text) {
    if (!text) return '';
    
    // Escape HTML first to prevent XSS
    let formatted = escapeHtml(text);
    
    // Convert line breaks to <br> tags
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  /**
   * Add message to chat UI with proper formatting
   */
  function addMessage(role, text) {
    const messagesContainer = document.getElementById('cv-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `cv-message cv-message-${role}`;
    
    // Format the text - simple line break conversion
    const formattedText = formatMessageText(text);
    
    // Set the formatted HTML in a paragraph
    messageDiv.innerHTML = `<p>${formattedText}</p>`;
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    const chatBody = document.getElementById('cv-chat-body');
    if (chatBody) {
      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 100);
    } else {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
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

STRICT GUIDELINES:
- ONLY discuss career growth, skill improvement, job searches, and professional networking.
- NO PERSONAL TALKS: If the user asks personal questions or unrelated "useless stuff," respond: "I am optimized only for career-related guidance. Let's get back to your professional growth."
- CRISP & EASY: Provide answers in a crisp, easy-to-read manner. Use bullet points for steps or lists.
- EXTREME POSITIVITY: Be exceptionally positive and encouraging. Never discourage the user. Even if they struggle, frame it as a stepping stone to success.
- ACTIVE IMPROVEMENT: Proactively suggest improvements to their current approach or code logic where necessary.
- CLEAR ROADMAPS: When relevant, provide a clear, short roadmap of "What to do next" to guide their progression.
- Provide hints, not full solutions for coding problems.
- Summarize learning content, don't copy it.
- Be ethical (no cheating, no medical diagnosis).
- Adapt your response to the context (coding, learning, articles, etc.).`;

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



