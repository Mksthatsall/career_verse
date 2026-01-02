# CareerVerse AI - Chrome Extension

**Universal Career Assistant** - Get personalized career guidance, learning paths, and build your resume automatically across multiple career domains.

## 🎯 Features

- **Context Detection**: Automatically detects your career interests based on the websites you visit
- **Multi-Career Support**: Works with Software/IT, Painting & Arts, Accounts & Finance, Cooking & Culinary, Business & Startups, Medical & Healthcare, Design & Creative, and General Career exploration
- **Career Guidance**: Get personalized advice, essential skills, and next steps for any career
- **Learning Resources**: Discover YouTube channels, online courses, and practice ideas for your chosen career
- **Auto Resume Builder**: Automatically builds your resume as you explore different careers
- **Opportunities**: Browse jobs, internships, events, and freelance opportunities by career domain

## 📁 Project Structure

```
careerverse-ai-extension/
├── manifest.json       # Chrome Extension Manifest V3
├── popup.html          # Main UI structure
├── popup.js            # Core logic, career engine, resume manager
├── content.js          # Context detection from webpages
├── style.css           # Modern, clean styling
└── README.md           # This file
```

## 🚀 Installation

### Step 1: Download the Extension

1. Download or clone this repository to your computer
2. Make sure all files are in the same folder

### Step 2: Load in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/` (or go to Chrome menu → Extensions → Manage Extensions)
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **"Load unpacked"** button
5. Select the folder containing the extension files
6. The extension should now appear in your extensions list

### Step 3: Pin the Extension (Optional)

1. Click the puzzle piece icon (Extensions) in Chrome toolbar
2. Find "CareerVerse AI" and click the pin icon to keep it visible

## 💡 How to Use

### 1. Career Detection

- **Automatic Detection**: Visit career-related websites (e.g., LeetCode, art galleries, recipe sites) and click the extension icon. Click "🔍 Detect Career" to see what career was detected.
- **Manual Selection**: Use the dropdown menu to manually select a career domain

### 2. Get Guidance

- Click the **Guidance** tab (default)
- Either use "Detect Career" or select a career manually
- View personalized advice, essential skills, and beginner steps

### 3. Explore Learning Resources

- Click the **Learn** tab
- Select a career from the dropdown
- Browse YouTube learning suggestions, online courses, practice ideas, and career roadmap

### 4. View Your Resume

- Click the **Resume** tab
- Your resume is automatically updated as you explore careers
- Skills and activities are tracked automatically
- Click "Reset Resume" to start fresh

### 5. Find Opportunities

- Click the **Opportunities** tab
- Select a career domain
- Browse jobs, internships, events, and freelance opportunities

## 🛠️ Technical Details

### Technologies Used

- **Plain HTML, CSS, JavaScript** (no frameworks)
- **Chrome Extension Manifest V3**
- **Chrome Storage API** (for resume data)
- **Content Scripts** (for context detection)

### Browser Compatibility

- Google Chrome (recommended)
- Microsoft Edge (Chromium-based)
- Other Chromium-based browsers

### Data Storage

- Resume data is stored locally using `chrome.storage.local`
- No data is sent to external servers
- All processing happens offline (except reading current webpage)

## 📝 Career Domains Supported

1. **Software / IT** - Programming, development, algorithms
2. **Painting & Arts** - Visual arts, drawing, painting
3. **Accounts & Finance** - Accounting, bookkeeping, finance
4. **Cooking & Culinary** - Cooking, baking, culinary arts
5. **Business & Startups** - Entrepreneurship, business development
6. **Medical & Healthcare** - Healthcare careers, medicine
7. **Design & Creative** - UI/UX design, graphic design
8. **General Career** - General career exploration and guidance

## 🎨 UI Features

- Modern, clean design with gradient header
- Tabbed interface for easy navigation
- Responsive layout
- Smooth animations and transitions
- Friendly, approachable tone (not corporate)

## 🔧 Customization

All career data, advice, and opportunities are stored in static JavaScript objects in `popup.js`. You can easily:

- Modify career information in the `careerData` object
- Update opportunities in the `opportunitiesData` object
- Adjust keyword detection in `content.js`
- Customize styling in `style.css`

## ⚠️ Notes

- This is a **prototype/MVP** version
- All data is static (no external APIs)
- Opportunities are example/dummy data
- Context detection is keyword-based (may not be 100% accurate)
- Works best on content-rich websites

## 🐛 Troubleshooting

**Extension not loading?**
- Make sure Developer mode is enabled
- Check that all files are in the same folder
- Verify manifest.json is valid JSON

**Context detection not working?**
- Some pages (chrome://, extensions://) cannot be analyzed
- Try visiting regular websites with career-related content
- Use manual career selection as an alternative

**Resume not saving?**
- Make sure you've interacted with at least one career
- Check Chrome's storage permissions
- Try resetting the resume if needed

## 📄 License

This is a prototype project. Feel free to use and modify as needed.

## 🙏 Credits

Built as a universal career assistant prototype. Designed to help users across all career domains, not just technology.

---

**Happy Career Exploring! 🎯✨**

