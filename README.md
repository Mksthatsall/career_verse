CareerVerse AI

CareerVerse AI is a Chrome Extension that acts as a universal, context-aware career and learning assistant.
It understands what you are doing on the web and helps you in real time with learning guidance, resume building, and job recommendations — all in one place.

Think of it as LeetCode AI + Career Coach + Resume Builder, but for all careers, not just Computer Science.

✨ Key Features
🤖 Context-Aware Assistant

Works on any website

Understands page context (learning, coding, reading, exploring)

Provides real-time guidance through an in-page assistant

🎯 Multi-Career Support

CareerVerse AI is not limited to CS. It supports:

Software / IT

Arts & Painting

Accounts & Finance

Cooking & Culinary

Business & Startups

Medical & Healthcare

General career exploration

🧾 Auto Resume Builder

Resume grows automatically based on what you learn

Skills and activities are added in real time

Resume data stored using Firebase Realtime Database

Resume can be downloaded using a predefined template

💼 Job Recommendations

Job openings adapt to your learning progress

Jobs update automatically when new skills are added

Personalized and real-time using Firebase listeners

⚡️ Real-Time Updates

Uses Firebase Realtime Database

Resume, jobs, and activities update instantly

No page refresh required

🎨 Smooth & Adaptive UI

Floating in-page assistant (Leeco AI–style)

Clean popup UI

Emoji-based icons (no image assets)

Smooth transitions and modern layout

🛠️ Tech Stack (Google-Friendly)
Layer Technology
Frontend HTML, CSS, JavaScript
Platform Chrome Extension (Manifest V3)
Database Firebase Realtime Database
Authentication Firebase Anonymous Auth
AI (current / future) Google Gemini
UI Style In-page floating assistant + Popup UI
🏗️ Project Structure
career_verse/
├── manifest.json
├── content.js        # In-page floating assistant
├── popup.html        # Extension popup UI
├── popup.js          # Popup logic
├── style.css         # UI styling
├── firebase.js       # Firebase auth & DB setup
├── image.png         # Resume template reference
└── README.md

🔄 How It Works

User opens any website

CareerVerse AI detects context (learning, coding, reading, etc.)

Activity is logged automatically

Resume updates in Firebase Realtime Database

Job recommendations update instantly

User can view or download resume based on saved template

🔐 API Key & Security (Current Status)

Currently uses one shared Gemini API key (prototype stage)

API key security via Google Cloud Functions is planned

In production, API keys will never be exposed to frontend

This approach is acceptable for demos, hackathons, and MVPs.

🚀 Installation & Usage
1️⃣ Clone the Repository
git clone https://github.com/Mksthatsall/career_verse.git

2️⃣ Load Extension in Chrome

Open chrome://extensions

Enable Developer Mode

Click Load unpacked

Select the career_verse folder

3️⃣ Start Using

Open any website

Floating assistant appears

Click extension icon for popup view

Resume and jobs update automatically

🧪 Prototype Notes

This project is a prototype / MVP

Some features use rule-based logic

AI integration will be secured in later versions

Focus is on UX, real-time behavior, and concept validation

🎯 Why CareerVerse AI?

Removes confusion during learning

Guides users while they work, not after

Builds resumes automatically

Supports all career paths

Designed for students, beginners, and career switchers

🛣️ Future Improvements

Secure Gemini API via Cloud Functions

Resume PDF export with ATS optimization

Google Sign-In for cross-device sync

Advanced AI career analytics

Mobile companion app

📌 One-Line Pitch

CareerVerse AI is a real-time, context-aware career assistant that helps users learn smarter, build resumes automatically, and discover relevant job opportunities directly on the web.

👤 Author

Mridul Krishna Sharma
Computer Science Engineering Student
Project: CareerVerse AI
