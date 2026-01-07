// Firebase Configuration and Initialization
// CareerVerse AI - Firebase Integration

// Firebase configuration object
// Project: career-verse-14981
// Project Number: 535430455656
const firebaseConfig = {
  apiKey: "AIzaSyD0nMKwaLCEz6oxJklfYkIywjpDlgPL7gM",
  authDomain: "career-verse-14981.firebaseapp.com",
  databaseURL: "https://career-verse-14981-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "career-verse-14981",
  storageBucket: "career-verse-14981.firebasestorage.app",
  messagingSenderId: "535430455656",
  appId: "1:535430455656:web:560240c18125a2bb6476dd"
};

// Initialize Firebase
// Note: Firebase SDK compat version is loaded via CDN in popup.html
let app;
let auth;
let db;

/**
 * Initialize Firebase App, Auth, and Database
 * Must be called after Firebase SDK is loaded
 * Uses Firebase compat library for easier integration
 */
function initializeFirebase() {
  try {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase SDK not loaded. Make sure Firebase scripts are included in popup.html');
    }

    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.database();
    console.log('Firebase initialized successfully');
    return { app, auth, db };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

/**
 * Initialize Anonymous Authentication
 * Automatically signs in user anonymously and returns UID
 * @returns {Promise<string>} User UID
 */
async function initAuth() {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized. Call initializeFirebase() first.');
    }

    // Check if user is already signed in
    if (auth.currentUser) {
      console.log('User already authenticated:', auth.currentUser.uid);
      return auth.currentUser.uid;
    }

    // Sign in anonymously
    const userCredential = await auth.signInAnonymously();
    const uid = userCredential.user.uid;
    console.log('Anonymous authentication successful. UID:', uid);

    // Create user record in database if it doesn't exist
    await createUserRecord(uid);

    return uid;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

/**
 * Create user record in Realtime Database
 * Structure: users/{uid}
 */
async function createUserRecord(uid) {
  try {
    const userRef = db.ref(`users/${uid}`);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
      // User doesn't exist, create new record
      const userData = {
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        lastActive: firebase.database.ServerValue.TIMESTAMP,
        careerFocus: "Undecided"
      };
      await userRef.set(userData);
      console.log('User record created:', uid);
    } else {
      // Update lastActive timestamp
      await userRef.update({
        lastActive: firebase.database.ServerValue.TIMESTAMP
      });
    }
  } catch (error) {
    console.error('Error creating user record:', error);
    throw error;
  }
}

/**
 * Create default resume if it doesn't exist
 * Structure: resumes/{uid}
 */
async function createDefaultResume(uid) {
  try {
    const resumeRef = db.ref(`resumes/${uid}`);
    const snapshot = await resumeRef.once('value');

    if (!snapshot.exists()) {
      const defaultResume = {
        careerDomain: null,
        skills: [],
        learningActivities: [],
        strengths: [],
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      };
      await resumeRef.set(defaultResume);
      console.log('Default resume created for user:', uid);
    }
  } catch (error) {
    console.error('Error creating default resume:', error);
    throw error;
  }
}

/**
 * Load resume from Realtime Database
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Resume data
 */
async function loadResume(uid) {
  try {
    const resumeRef = db.ref(`resumes/${uid}`);
    const snapshot = await resumeRef.once('value');
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Create default resume if it doesn't exist
      await createDefaultResume(uid);
      const newSnapshot = await resumeRef.once('value');
      return newSnapshot.val();
    }
  } catch (error) {
    console.error('Error loading resume:', error);
    throw error;
  }
}

/**
 * Save resume to Realtime Database
 * @param {string} uid - User ID
 * @param {Object} resumeData - Resume data to save
 */
async function saveResume(uid, resumeData) {
  try {
    const resumeRef = db.ref(`resumes/${uid}`);
    
    // Add updatedAt timestamp using Firebase ServerValue
    const dataToSave = {
      ...resumeData,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Remove updatedAt from spread if it was already set
    if (resumeData.updatedAt === firebase.database.ServerValue.TIMESTAMP) {
      dataToSave.updatedAt = firebase.database.ServerValue.TIMESTAMP;
    }
    
    await resumeRef.set(dataToSave);
    console.log('Resume saved successfully');
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
}

/**
 * Update resume from activity
 * Adds skills (without duplicates) and appends learning activities
 * @param {string} uid - User ID
 * @param {Object} activity - Activity data { domain, activityType, timestamp }
 */
async function updateResumeFromActivity(uid, activity) {
  try {
    const resumeRef = db.ref(`resumes/${uid}`);
    const snapshot = await resumeRef.once('value');
    
    let resume = snapshot.exists() ? snapshot.val() : {
      careerDomain: null,
      skills: [],
      learningActivities: [],
      strengths: [],
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };

    // Update career domain if provided
    if (activity.domain && activity.domain !== resume.careerDomain) {
      resume.careerDomain = activity.domain;
    }

    // Add skills without duplicates
    if (activity.skills && Array.isArray(activity.skills)) {
      activity.skills.forEach(skill => {
        if (!resume.skills.includes(skill)) {
          resume.skills.push(skill);
        }
      });
    }

    // Append learning activity
    if (activity.activityType) {
      resume.learningActivities.push({
        domain: activity.domain || resume.careerDomain,
        activityType: activity.activityType,
        timestamp: activity.timestamp || Date.now()
      });
      
      // Keep only last 50 activities
      if (resume.learningActivities.length > 50) {
        resume.learningActivities = resume.learningActivities.slice(-50);
      }
    }

    // Save updated resume
    await saveResume(uid, resume);

    // Also create activity record
    await createActivityRecord(uid, activity);
  } catch (error) {
    console.error('Error updating resume from activity:', error);
    throw error;
  }
}

/**
 * Create activity record in Realtime Database
 * Structure: activities/{uid}/{activityId}
 * @param {string} uid - User ID
 * @param {Object} activity - Activity data
 */
async function createActivityRecord(uid, activity) {
  try {
    const activityId = `activity_${Date.now()}`;
    const activityRef = db.ref(`activities/${uid}/${activityId}`);
    
    const activityData = {
      domain: activity.domain || null,
      activityType: activity.activityType || 'general',
      timestamp: activity.timestamp || Date.now()
    };
    
    await activityRef.set(activityData);
    console.log('Activity record created:', activityId);
  } catch (error) {
    console.error('Error creating activity record:', error);
    // Don't throw - activity logging is not critical
  }
}

/**
 * Set up realtime listener for resume changes
 * Automatically updates UI when resume data changes in database
 * @param {string} uid - User ID
 * @param {Function} callback - Callback function to handle resume updates
 * @returns {Function} Unsubscribe function
 */
function listenToResume(uid, callback) {
  try {
    const resumeRef = db.ref(`resumes/${uid}`);
    
    // Set up listener
    const unsubscribe = resumeRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const resumeData = snapshot.val();
        callback(resumeData);
      } else {
        // Resume doesn't exist, create default
        createDefaultResume(uid).then(() => {
          resumeRef.once('value').then(snap => {
            if (snap.exists()) {
              callback(snap.val());
            }
          });
        });
      }
    }, (error) => {
      console.error('Resume listener error:', error);
    });

    // Return unsubscribe function
    return () => {
      resumeRef.off('value', unsubscribe);
    };
  } catch (error) {
    console.error('Error setting up resume listener:', error);
    throw error;
  }
}

// Export functions for use in popup.js
// Note: In ES modules, these would be exported, but since we're using script tags,
// we'll attach them to window object for global access
if (typeof window !== 'undefined') {
  window.FirebaseManager = {
    initializeFirebase,
    initAuth,
    createUserRecord,
    createDefaultResume,
    loadResume,
    saveResume,
    updateResumeFromActivity,
    createActivityRecord,
    listenToResume,
    getAuth: () => auth,
    getDb: () => db
  };
}

