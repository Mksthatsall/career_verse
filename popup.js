// CareerVerse AI - Popup Logic
// Simple toggle interface for floating assistant

(function() {
  'use strict';

  // Toggle assistant visibility
  async function toggleAssistant() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        alert('CareerVerse AI cannot run on this page. Please navigate to a regular website.');
        return;
      }

      // Send message to content script to toggle assistant
      chrome.tabs.sendMessage(tab.id, { action: 'toggleAssistant' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          // Try injecting content script if it's not loaded
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }, () => {
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'toggleAssistant' });
            }, 500);
          });
        }
      });
    } catch (error) {
      console.error('Error toggling assistant:', error);
    }
  }

  // Initialize popup
  function init() {
    const toggleBtn = document.getElementById('toggle-assistant-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleAssistant);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
