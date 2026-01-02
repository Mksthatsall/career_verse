// Content script for CareerVerse AI
// Detects career context from webpage content

(function() {
  'use strict';

  // Career keyword mappings for context detection
  const careerKeywords = {
    software: ['leetcode', 'github', 'stackoverflow', 'code', 'programming', 'developer', 'coding', 'javascript', 'python', 'java', 'react', 'node', 'api', 'software', 'tech', 'algorithm', 'hacker', 'git'],
    painting: ['painting', 'canvas', 'brush', 'artwork', 'gallery', 'exhibition', 'artist', 'sketch', 'drawing', 'watercolor', 'oil paint', 'acrylic', 'palette', 'studio'],
    accounts: ['accounting', 'finance', 'tally', 'bookkeeping', 'ledger', 'balance sheet', 'tax', 'audit', 'cpa', 'accountant', 'financial', 'revenue', 'expense', 'invoice'],
    cooking: ['recipe', 'cooking', 'chef', 'culinary', 'kitchen', 'ingredients', 'baking', 'cuisine', 'food', 'restaurant', 'cookbook', 'knife skills', 'spices'],
    business: ['startup', 'business', 'entrepreneur', 'venture', 'marketing', 'sales', 'strategy', 'consulting', 'management', 'investor', 'pitch', 'revenue model'],
    medical: ['medical', 'healthcare', 'doctor', 'nurse', 'hospital', 'patient', 'diagnosis', 'treatment', 'medicine', 'health', 'clinical', 'pharmacy'],
    design: ['design', 'ui', 'ux', 'figma', 'adobe', 'photoshop', 'illustrator', 'graphic design', 'creative', 'portfolio', 'branding', 'typography'],
    general: []
  };

  /**
   * Detect career from current page
   * Returns the detected career domain or null
   */
  function detectCareer() {
    const url = window.location.href.toLowerCase();
    const domain = window.location.hostname.toLowerCase();
    const title = document.title.toLowerCase();
    
    // Get page text content (limited for performance)
    const bodyText = document.body ? document.body.innerText.toLowerCase().substring(0, 5000) : '';
    const allText = (url + ' ' + domain + ' ' + title + ' ' + bodyText).toLowerCase();

    // Score each career domain
    const scores = {};
    for (const [career, keywords] of Object.entries(careerKeywords)) {
      if (career === 'general') continue;
      
      scores[career] = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = allText.match(regex);
        if (matches) {
          scores[career] += matches.length;
        }
      });
    }

    // Domain-specific overrides
    if (domain.includes('leetcode') || domain.includes('github') || domain.includes('stackoverflow')) {
      scores.software = (scores.software || 0) + 10;
    }
    if (domain.includes('art') || domain.includes('gallery') || domain.includes('deviantart')) {
      scores.painting = (scores.painting || 0) + 10;
    }
    if (domain.includes('recipe') || domain.includes('allrecipes') || domain.includes('food')) {
      scores.cooking = (scores.cooking || 0) + 10;
    }

    // Find career with highest score
    let maxScore = 0;
    let detectedCareer = null;
    for (const [career, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedCareer = career;
      }
    }

    // Return detected career if score is significant, otherwise null
    return maxScore >= 2 ? detectedCareer : null;
  }

  /**
   * Get page context summary
   */
  function getPageContext() {
    const detected = detectCareer();
    return {
      career: detected,
      url: window.location.href,
      domain: window.location.hostname,
      title: document.title
    };
  }

  // Store context in page (will be accessed by popup)
  window.careerverseContext = getPageContext();

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getContext') {
      sendResponse(getPageContext());
    }
    return true; // Keep message channel open for async response
  });

})();

