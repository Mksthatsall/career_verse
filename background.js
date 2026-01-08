// Background Service Worker for CareerVerse AI
// Handles Firebase initialization and operations

// Firebase will be loaded via importScripts in service worker context
// Note: Service workers can load external scripts via importScripts

// Import Firebase SDK (using CDN via importScripts)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0nMKwaLCEz6oxJklfYkIywjpDlgPL7gM",
  authDomain: "career-verse-14981.firebaseapp.com",
  databaseURL: "https://career-verse-14981-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "career-verse-14981",
  storageBucket: "career-verse-14981.firebasestorage.app",
  messagingSenderId: "535430455656",
  appId: "1:535430455656:web:560240c18125a2bb6476dd"
};

// Initialize Firebase in service worker
let app, auth, db;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.database();
  console.log('[Background] Firebase initialized');
} catch (error) {
  console.error('[Background] Firebase init error:', error);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'initFirebase') {
    // Initialize auth if needed
    initAuth().then(uid => {
      sendResponse({ success: true, uid });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Async response
  }
  
  if (request.action === 'getResume') {
    loadResume(request.uid).then(resume => {
      sendResponse({ success: true, resume });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (request.action === 'saveResume') {
    saveResume(request.uid, request.resume).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (request.action === 'updateResumeFromActivity') {
    updateResumeFromActivity(request.uid, request.activity).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

async function initAuth() {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  const userCredential = await auth.signInAnonymously();
  const uid = userCredential.user.uid;
  
  // Create user record
  const userRef = db.ref(`users/${uid}`);
  const snapshot = await userRef.once('value');
  if (!snapshot.exists()) {
    await userRef.set({
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      lastActive: firebase.database.ServerValue.TIMESTAMP,
      careerFocus: "Undecided"
    });
  }
  
  return uid;
}

async function loadResume(uid) {
  const resumeRef = db.ref(`resumes/${uid}`);
  const snapshot = await resumeRef.once('value');
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    // Create default
    const defaultResume = {
      careerDomain: null,
      skills: [],
      learningActivities: [],
      strengths: [],
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    await resumeRef.set(defaultResume);
    return defaultResume;
  }
}

async function saveResume(uid, resumeData) {
  const resumeRef = db.ref(`resumes/${uid}`);
  const dataToSave = {
    ...resumeData,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };
  await resumeRef.set(dataToSave);
}

async function updateResumeFromActivity(uid, activity) {
  const resumeRef = db.ref(`resumes/${uid}`);
  const snapshot = await resumeRef.once('value');
  let resume = snapshot.exists() ? snapshot.val() : {
    careerDomain: null,
    skills: [],
    learningActivities: [],
    strengths: [],
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };

  if (activity.domain && activity.domain !== resume.careerDomain) {
    resume.careerDomain = activity.domain;
  }

  if (activity.skills && Array.isArray(activity.skills)) {
    activity.skills.forEach(skill => {
      if (!resume.skills.includes(skill)) {
        resume.skills.push(skill);
      }
    });
  }

  if (activity.activityType) {
    resume.learningActivities.push({
      domain: activity.domain || resume.careerDomain,
      activityType: activity.activityType,
      timestamp: activity.timestamp || Date.now()
    });
    if (resume.learningActivities.length > 50) {
      resume.learningActivities = resume.learningActivities.slice(-50);
    }
  }

  await saveResume(uid, resume);
}

