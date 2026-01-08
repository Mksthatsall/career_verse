// CareerVerse AI - Main Popup Logic (ES Module)
// Activity Tracking, Resume Auto-Update, Job Matching

// ============================================
// GLOBAL STATE
// ============================================
let currentUid = null;
let resumeListener = null;
let activitiesListener = null;
let jobsListener = null;

// ============================================
// JOB DATASET (Curated by Skills)
// ============================================
const jobDataset = {
  'JavaScript': [
    { title: 'Frontend Developer', company: 'TechCorp', requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS'], shortDescription: 'Build modern web applications', careerDomain: 'software' },
    { title: 'Full Stack Developer', company: 'StartupXYZ', requiredSkills: ['JavaScript', 'Node.js', 'MongoDB'], shortDescription: 'End-to-end web development', careerDomain: 'software' },
    { title: 'React Developer', company: 'DigitalAgency', requiredSkills: ['JavaScript', 'React', 'TypeScript'], shortDescription: 'Create interactive UIs', careerDomain: 'software' }
  ],
  'Python': [
    { title: 'Python Developer', company: 'DataTech', requiredSkills: ['Python', 'Django', 'PostgreSQL'], shortDescription: 'Backend development with Python', careerDomain: 'software' },
    { title: 'Data Analyst', company: 'AnalyticsCo', requiredSkills: ['Python', 'Pandas', 'SQL'], shortDescription: 'Analyze and visualize data', careerDomain: 'software' },
    { title: 'Machine Learning Engineer', company: 'AITech', requiredSkills: ['Python', 'TensorFlow', 'ML'], shortDescription: 'Build ML models', careerDomain: 'software' }
  ],
  'Problem Solving': [
    { title: 'Software Engineer', company: 'BigTech', requiredSkills: ['Problem Solving', 'Algorithms', 'System Design'], shortDescription: 'Solve complex technical challenges', careerDomain: 'software' },
    { title: 'Technical Consultant', company: 'ConsultingFirm', requiredSkills: ['Problem Solving', 'Communication', 'Analysis'], shortDescription: 'Help clients solve problems', careerDomain: 'business' }
  ],
  'Design Principles': [
    { title: 'UI/UX Designer', company: 'DesignStudio', requiredSkills: ['Design Principles', 'Figma', 'User Research'], shortDescription: 'Create beautiful user experiences', careerDomain: 'design' },
    { title: 'Product Designer', company: 'ProductCo', requiredSkills: ['Design Principles', 'Prototyping', 'User Testing'], shortDescription: 'Design digital products', careerDomain: 'design' }
  ],
  'Financial Reporting': [
    { title: 'Financial Analyst', company: 'FinanceCorp', requiredSkills: ['Financial Reporting', 'Excel', 'Analysis'], shortDescription: 'Analyze financial data', careerDomain: 'accounts' },
    { title: 'Accountant', company: 'AccountingFirm', requiredSkills: ['Financial Reporting', 'Bookkeeping', 'Tax'], shortDescription: 'Manage financial records', careerDomain: 'accounts' }
  ],
  'Marketing & Sales': [
    { title: 'Marketing Specialist', company: 'MarketingAgency', requiredSkills: ['Marketing & Sales', 'Content Creation', 'Analytics'], shortDescription: 'Drive marketing campaigns', careerDomain: 'business' },
    { title: 'Sales Representative', company: 'SalesCorp', requiredSkills: ['Marketing & Sales', 'Communication', 'CRM'], shortDescription: 'Build client relationships', careerDomain: 'business' }
  ],
  'Cooking Techniques': [
    { title: 'Line Cook', company: 'RestaurantGroup', requiredSkills: ['Cooking Techniques', 'Food Safety', 'Knife Skills'], shortDescription: 'Prepare quality meals', careerDomain: 'cooking' },
    { title: 'Sous Chef', company: 'FineDining', requiredSkills: ['Cooking Techniques', 'Menu Planning', 'Leadership'], shortDescription: 'Assist head chef', careerDomain: 'cooking' }
  ],
  'Sketching & Drawing': [
    { title: 'Illustrator', company: 'CreativeAgency', requiredSkills: ['Sketching & Drawing', 'Digital Art', 'Portfolio'], shortDescription: 'Create visual illustrations', careerDomain: 'painting' },
    { title: 'Concept Artist', company: 'GameStudio', requiredSkills: ['Sketching & Drawing', 'Character Design', 'Digital Tools'], shortDescription: 'Design game characters', careerDomain: 'painting' }
  ]
};

// ============================================
// FIREBASE RESUME MANAGER
// ============================================
const ResumeManager = {
  async init() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'initFirebase' });
      if (response && response.success) {
        currentUid = response.uid;
        console.log('Authenticated with UID:', currentUid);
        this.setupRealtimeListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return false;
    }
  },

  setupRealtimeListeners() {
    // Listen to resume changes
    if (resumeListener) {
      chrome.runtime.sendMessage({ action: 'stopResumeListener' });
    }
    
    chrome.runtime.sendMessage({ 
      action: 'listenToResume', 
      uid: currentUid 
    }, (response) => {
      if (response && response.success) {
        console.log('Resume listener set up');
      }
    });

    // Listen to activities
    this.setupActivitiesListener();
    
    // Listen to jobs
    this.setupJobsListener();
  },

  setupActivitiesListener() {
    chrome.runtime.sendMessage({ 
      action: 'listenToActivities', 
      uid: currentUid 
    });
  },

  setupJobsListener() {
    chrome.runtime.sendMessage({ 
      action: 'listenToJobs', 
      uid: currentUid 
    });
  },

  async getResume() {
    if (!currentUid) await this.init();
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'getResume', 
        uid: currentUid 
      });
      return response?.success ? response.resume : null;
    } catch (error) {
      console.error('Error loading resume:', error);
      return null;
    }
  },

  async getActivities() {
    if (!currentUid) await this.init();
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'getActivities', 
        uid: currentUid 
      });
      return response?.success ? (response.activities || {}) : {};
    } catch (error) {
      console.error('Error loading activities:', error);
      return {};
    }
  },

  async getMatchedJobs() {
    if (!currentUid) await this.init();
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'getMatchedJobs', 
        uid: currentUid 
      });
      return response?.success ? (response.jobs || {}) : {};
    } catch (error) {
      console.error('Error loading jobs:', error);
      return {};
    }
  }
};

// ============================================
// ACTIVITY DISPLAY
// ============================================
async function displayActivities() {
  const activities = await ResumeManager.getActivities();
  const statsDiv = document.getElementById('activity-stats');
  const listDiv = document.getElementById('activity-list');

  const activityList = Object.values(activities).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const totalActivities = activityList.length;
  const todayActivities = activityList.filter(a => {
    const date = new Date(a.timestamp || 0);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;

  // Group by domain
  const domainCounts = {};
  activityList.forEach(activity => {
    const domain = activity.domain || 'general';
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });

  statsDiv.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${totalActivities}</div>
        <div class="stat-label">Total Activities</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${todayActivities}</div>
        <div class="stat-label">Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Object.keys(domainCounts).length}</div>
        <div class="stat-label">Domains</div>
      </div>
    </div>
  `;

  if (activityList.length === 0) {
    listDiv.innerHTML = `
      <div class="empty-state">
        <span>📊</span>
        <p>No activities tracked yet</p>
        <p style="font-size: 12px; margin-top: 10px;">Visit learning platforms to start tracking!</p>
      </div>
    `;
    return;
  }

  listDiv.innerHTML = activityList.slice(0, 20).map(activity => {
    const date = new Date(activity.timestamp || Date.now());
    const domain = activity.domain || 'general';
    const activityType = activity.activityType || 'general';
    
    return `
      <div class="activity-card">
        <div class="activity-header">
          <span class="activity-domain">${getDomainEmoji(domain)} ${domain}</span>
          <span class="activity-date">${date.toLocaleDateString()}</span>
        </div>
        <div class="activity-type">${activityType}</div>
        ${activity.inferredSkills && activity.inferredSkills.length > 0 ? `
          <div class="activity-skills">
            ${activity.inferredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function getDomainEmoji(domain) {
  const emojis = {
    'software': '💻',
    'design': '🎨',
    'accounts': '💰',
    'business': '📈',
    'cooking': '👨‍🍳',
    'painting': '🖌️',
    'medical': '⚕️',
    'general': '📚'
  };
  return emojis[domain] || '📚';
}

// ============================================
// RESUME DISPLAY
// ============================================
async function displayResume() {
  const resume = await ResumeManager.getResume();
  const resumeDiv = document.getElementById('resume-content');

  if (!resume || (!resume.careerDomain && (!resume.skills || resume.skills.length === 0))) {
    resumeDiv.innerHTML = `
      <div class="resume-preview empty">
        <span>📄</span>
        <p>Your resume is empty.</p>
        <p>Start learning to build your resume automatically!</p>
      </div>
    `;
    return;
  }

  const totalSkills = resume.skills?.length || 0;
  const totalActivities = resume.learningActivities?.length || 0;
  const lastUpdate = resume.updatedAt ? new Date(resume.updatedAt) : null;

  resumeDiv.innerHTML = `
    <div class="resume-preview">
      <div class="resume-stats">
        <div class="stat-card">
          <div class="stat-value">${totalSkills}</div>
          <div class="stat-label">Skills</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalActivities}</div>
          <div class="stat-label">Activities</div>
        </div>
        ${lastUpdate ? `
        <div class="stat-card">
          <div class="stat-value">${formatTimeAgo(lastUpdate)}</div>
          <div class="stat-label">Updated</div>
        </div>
        ` : ''}
      </div>

      ${resume.careerDomain ? `
        <div class="resume-section">
          <h3>Career Focus</h3>
          <div class="resume-item">${getCareerName(resume.careerDomain)}</div>
        </div>
      ` : ''}
      
      ${resume.skills && resume.skills.length > 0 ? `
        <div class="resume-section">
          <h3>Skills (${totalSkills})</h3>
          <div class="skills-grid">
            ${resume.skills.map(skill => `<div class="skill-badge">${skill}</div>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${resume.learningActivities && resume.learningActivities.length > 0 ? `
        <div class="resume-section">
          <h3>Recent Learning Activities</h3>
          ${resume.learningActivities.slice().reverse().slice(0, 5).map(activity => {
            const date = new Date(activity.timestamp || Date.now());
            return `
              <div class="resume-item">
                <strong>${date.toLocaleDateString()}:</strong> ${activity.activityType || activity}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function getCareerName(domain) {
  const names = {
    'software': '💻 Software / IT',
    'design': '🎨 Design & Creative',
    'accounts': '💰 Accounts & Finance',
    'business': '📈 Business & Startups',
    'cooking': '👨‍🍳 Cooking & Culinary',
    'painting': '🖌️ Painting & Arts',
    'medical': '⚕️ Medical & Healthcare',
    'general': '📚 General Career'
  };
  return names[domain] || domain;
}

function formatTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ============================================
// JOB MATCHING & DISPLAY
// ============================================
async function displayJobs() {
  const jobs = await ResumeManager.getMatchedJobs();
  const jobsDiv = document.getElementById('jobs-content');

  const jobList = Object.values(jobs).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  if (jobList.length === 0) {
    jobsDiv.innerHTML = `
      <div class="empty-state">
        <span>💼</span>
        <p>No job recommendations yet</p>
        <p style="font-size: 12px; margin-top: 10px;">Build your skills to see matched jobs!</p>
      </div>
    `;
    return;
  }

  jobsDiv.innerHTML = jobList.map(job => `
    <div class="job-card">
      <div class="job-header">
        <div>
          <h4 class="job-title">${job.title}</h4>
          <p class="job-company">${job.company}</p>
        </div>
        <div class="match-badge">${Math.round(job.matchScore || 0)}% match</div>
      </div>
      <p class="job-description">${job.shortDescription}</p>
      <div class="job-skills">
        <strong>Required Skills:</strong>
        ${job.requiredSkills?.map(skill => `<span class="skill-tag">${skill}</span>`).join('') || 'N/A'}
      </div>
      <div class="job-domain">${getCareerName(job.careerDomain || 'general')}</div>
    </div>
  `).join('');
}

// ============================================
// MESSAGE LISTENER FOR REALTIME UPDATES
// ============================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'resumeUpdated') {
    displayResume();
    // Recalculate jobs when resume updates
    chrome.runtime.sendMessage({ 
      action: 'recalculateJobs', 
      uid: currentUid 
    });
  }
  
  if (message.action === 'activityAdded') {
    displayActivities();
  }
  
  if (message.action === 'jobsUpdated') {
    displayJobs();
  }
  
  return true;
});

// ============================================
// TAB MANAGEMENT
// ============================================
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');

      // Load content when switching tabs
      if (targetTab === 'activity') {
        displayActivities();
      } else if (targetTab === 'resume') {
        displayResume();
      } else if (targetTab === 'jobs') {
        displayJobs();
      }
    });
  });
}

// ============================================
// INITIALIZATION
// ============================================
async function init() {
  initTabs();
  
  const firebaseReady = await ResumeManager.init();
  if (firebaseReady) {
    console.log('Firebase initialized and user authenticated');
  }
  
  // Load initial data
  displayActivities();
  displayResume();
  displayJobs();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
