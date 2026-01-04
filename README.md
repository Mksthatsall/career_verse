# CareerVerse AI - Chrome Extension

**Intelligent Learning Assistant** - Floating AI assistant that auto-analyzes web pages and provides context-aware guidance, just like Leeco AI.

## 🎯 Features

- **🤖 Floating Assistant**: Appears automatically on every webpage (bottom-right corner)
- **🧠 Auto-Analysis**: Automatically analyzes page content (headings, text, code blocks)
- **💬 Chat Interface**: Chat with AI about the current page content
- **🎯 Context-Aware Suggestions**: Smart suggestions based on page type (coding, learning, articles)
- **⚡ Real-time Responses**: Powered by Google Gemini API
- **🎨 Leeco AI Style**: Clean, minimal floating UI design

## 🚀 Installation & Setup

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Configure API Key

1. Open `content.js` in a text editor
2. Find line 8: `const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';`
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```javascript
   const GEMINI_API_KEY = 'your-actual-api-key-here';
   ```
4. Save the file

### Step 3: Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select the folder containing the extension files
6. The extension should now appear in your extensions list

### Step 4: Start Using

1. Visit any website (LeetCode, Udemy, Coursera, blogs, etc.)
2. The floating assistant will appear automatically in the bottom-right corner
3. Wait for auto-analysis (takes 1-2 seconds)
4. Click on suggestions or type your own questions!

## 💡 How It Works

### Automatic Context Analysis

When you visit a page, CareerVerse AI automatically extracts:
- Page title and domain
- Headings (H1, H2, H3)
- Visible text snippets
- Code blocks (if present)
- Detects page type (coding, learning, article, etc.)

### Context-Aware Suggestions

Based on the page type, you'll see different suggestions:

**On Coding Sites (LeetCode, GitHub, etc.):**
- "Explain this problem simply"
- "How should I approach this?"
- "What concepts should I review?"

**On Learning Sites (Udemy, Coursera, etc.):**
- "Summarize this lesson"
- "How should I study this?"
- "What are the key takeaways?"

**On Articles/Blogs:**
- "Explain this simply"
- "What are the main points?"
- "What should I learn next?"

### Chat Interface

- Type any question about the current page
- Get AI-powered responses
- Chat history maintained during session
- Loading animation while AI responds

## 🎨 UI Features

- **Floating Panel**: Bottom-right corner, doesn't interfere with browsing
- **Minimize/Maximize**: Click `−` to minimize, `+` to expand
- **Close**: Click `×` to hide (reopen via extension popup)
- **Chat Bubbles**: User messages (right, purple) and AI responses (left, white)
- **Auto-Suggestions**: Clickable suggestion buttons
- **Smooth Animations**: Fade-in effects and loading dots

## 📁 Project Structure

```
career_verse/
├── manifest.json       # Chrome Extension Manifest V3
├── content.js          # Context extraction + Floating UI + Gemini API
├── popup.html          # Simple toggle interface
├── popup.js            # Popup logic (toggle assistant)
├── style.css           # Floating assistant styles
└── README.md           # This file
```

## 🔧 Technical Details

### Technologies

- **Plain HTML, CSS, JavaScript** (no frameworks)
- **Chrome Extension Manifest V3**
- **Google Gemini Pro API** (via REST)
- **Content Scripts** (injected into web pages)

### API Integration

- Uses Gemini Pro model via REST API
- System prompt for context-aware responses
- Includes page context in every request
- Handles errors gracefully

### Context Extraction

- Extracts up to 10 headings
- First 5 visible paragraphs (max 1000 chars)
- Up to 5 code blocks (truncated to 300 chars each)
- Detects domain type automatically

## ⚠️ Important Notes

### API Key Security

- **This is a PROTOTYPE** - API key is hard-coded in `content.js`
- For production, use secure storage or backend proxy
- Never commit API keys to public repositories
- All users share the same API key in this prototype

### Limitations

- Works on regular web pages (not chrome:// or extension pages)
- Some sites may block content script injection
- API rate limits apply (depends on your Gemini API quota)
- Context extraction limited to visible content

### Ethical Guidelines

The AI assistant follows these rules:
- ✅ Provides hints, not full solutions for coding problems
- ✅ Summarizes learning content, doesn't copy it
- ✅ No medical diagnosis
- ✅ No copyrighted content reproduction
- ✅ Educational guidance only

## 🐛 Troubleshooting

**Assistant not appearing?**
- Make sure you're on a regular website (not chrome://)
- Check browser console for errors (F12)
- Verify API key is set correctly in `content.js`
- Try reloading the page

**API errors?**
- Verify your Gemini API key is correct
- Check your API quota/limits
- Ensure internet connection is active
- Check browser console for detailed error messages

**Suggestions not showing?**
- Wait 1-2 seconds after page load
- Some pages may not have extractable content
- Try refreshing the page

**Chat not working?**
- Verify API key is configured
- Check browser console for errors
- Ensure you have internet connection
- Try reloading the extension

## 🔄 Updating the Extension

After making changes to the code:

1. Go to `chrome://extensions/`
2. Find "CareerVerse AI"
3. Click the refresh icon (🔄)
4. Reload the webpage you're testing on

## 📝 Customization

### Change API Key Location

To use a different API key storage method, modify `content.js`:
- Line 8: Update `GEMINI_API_KEY` constant
- Or implement `chrome.storage` for user-provided keys

### Modify Suggestions

Edit `generateSuggestions()` function in `content.js` (around line 200) to customize suggestion text.

### Change UI Style

Modify `style.css` - all floating assistant styles are prefixed with `cv-` or `#careerverse-assistant`.

### Adjust Context Extraction

Modify `extractPageContext()` function in `content.js` to change what content is extracted.

## 🎯 Use Cases

### Learning Platforms
- **Udemy/Coursera**: Get lesson summaries, study tips, key concepts
- **YouTube**: Understand video content, get learning paths
- **Khan Academy**: Clarify concepts, get practice suggestions

### Coding Platforms
- **LeetCode**: Get problem-solving hints (not solutions!)
- **GitHub**: Understand code, get explanations
- **Stack Overflow**: Clarify answers, learn concepts

### Articles & Blogs
- **Medium**: Summarize articles, extract key points
- **Technical Blogs**: Explain complex topics simply
- **Documentation**: Get quick explanations

## 📄 License

This is a prototype project. Feel free to use and modify as needed.

## 🙏 Credits

Built as an intelligent learning assistant inspired by Leeco AI. Designed to help users learn and understand web content better.

---

**Happy Learning! 🎓✨**
