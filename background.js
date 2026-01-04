// Background service worker for CareerVerse AI
// Handles screen capture requests

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreen') {
    // Capture the visible tab
    chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 80 }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }
      
      // Convert data URL to base64
      const base64 = dataUrl.split(',')[1];
      sendResponse({ success: true, image: base64 });
    });
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

