# Quick Setup Guide

## 🚀 3-Step Setup

### 1. Get Gemini API Key
Visit: https://makersuite.google.com/app/apikey
- Sign in with Google
- Click "Create API Key"
- Copy the key

### 2. Add API Key to Extension
Open `content.js` and replace line 8:
```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```
With:
```javascript
const GEMINI_API_KEY = 'your-actual-api-key-here';
```

### 3. Load Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder

## ✅ Done!

Visit any website and the floating assistant will appear automatically!

## 🧪 Test It

Try these sites:
- **LeetCode**: Get coding hints
- **Udemy/Coursera**: Get lesson summaries
- **Medium/Blogs**: Get article explanations
- **GitHub**: Understand code

## ⚠️ Troubleshooting

**Assistant not showing?**
- Make sure you're on a regular website (not chrome://)
- Check that API key is set correctly
- Reload the page

**API errors?**
- Verify API key is correct
- Check your Gemini API quota
- Open browser console (F12) for details

