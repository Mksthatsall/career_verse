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
  // Check if we're in popup context
  const statsDiv = document.getElementById('activity-stats');
  const listDiv = document.getElementById('activity-list');
  
  if (!statsDiv || !listDiv) {
    console.warn('Activity display elements not found. This function should only run in popup context.');
    return;
  }
  
  let activities = {};
  try {
    activities = await ResumeManager.getActivities();
  } catch (error) {
    console.error('Error loading activities:', error);
    activities = {};
  }

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
  // Check if we're in popup context
  const resumeDiv = document.getElementById('resume-content');
  
  if (!resumeDiv) {
    console.warn('Resume display element not found. This function should only run in popup context.');
    return;
  }
  
  let resume = null;
  try {
    resume = await ResumeManager.getResume();
  } catch (error) {
    console.error('Error loading resume:', error);
    resume = null;
  }

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
      
      <div class="resume-actions" style="margin-top: 20px; text-align: center;">
        <button id="download-resume-btn" class="cv-btn-primary" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s;">
          📥 Download Resume PDF
        </button>
      </div>
    </div>
  `;

  // Attach download button event listener
  const downloadBtn = document.getElementById('download-resume-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => downloadResume(resume));
  }
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
// RESUME TEMPLATE GENERATION (Matching image.png)
// ============================================

/**
 * Generate resume HTML matching the image.png template design
 * 
 * TEMPLATE MAPPING FROM image.png:
 * ==================================
 * 1. HEADER SECTION (Centered):
 *    - Large, bold, uppercase name (42px, #333)
 *    - Smaller uppercase title below name (16px, #666)
 *    - Thin horizontal divider line (#ddd) separating header from content
 * 
 * 2. TWO-COLUMN LAYOUT:
 *    - Left Column (32% width): Contact, Education, Skills, Languages
 *    - Right Column (68% width): Profile Summary, Work Experience
 *    - Vertical separator line (#ddd) between columns
 * 
 * 3. SECTION TITLES:
 *    - Uppercase, bold (14px, #333)
 *    - Light gray background highlight (#eee) with rounded corners
 *    - Left-aligned within their column
 * 
 * 4. LEFT COLUMN SECTIONS:
 *    - CONTACT: Icons + text, each on own line
 *    - EDUCATION: Date, University (bold), Degree (bullet points)
 *    - SKILLS: Bulleted list
 *    - LANGUAGES: Bulleted list with proficiency
 * 
 * 5. RIGHT COLUMN SECTIONS:
 *    - PROFILE SUMMARY: Paragraph text, justified
 *    - WORK EXPERIENCE: Company (bold), Role, Dates (right-aligned), Bulleted descriptions
 * 
 * 6. TYPOGRAPHY & COLORS:
 *    - Font: Sans-serif (system fonts)
 *    - Primary text: #333333 (dark gray)
 *    - Secondary text: #666666 (medium gray)
 *    - Background: #ffffff (white)
 *    - Accents: #eeeeee (light gray for section titles)
 *    - Lines: #dddddd (light gray for separators)
 * 
 * This implementation closely matches the visual structure shown in image.png
 */
function generateResumeHTML(resume) {
  // Extract data with defaults
  const name = resume.name || 'YOUR NAME';
  const title = getCareerTitle(resume.careerDomain) || 'PROFESSIONAL';
  const skills = resume.skills || [];
  const activities = resume.learningActivities || [];
  const strengths = resume.strengths || [];
  
  // Generate profile summary from activities and strengths
  const profileSummary = generateProfileSummary(resume);
  
  // Generate work experience from activities
  const workExperience = generateWorkExperience(activities);
  
  // Generate education from activities
  const education = generateEducation(activities);
  
  // Generate contact info (placeholder - can be enhanced)
  const contact = {
    phone: resume.phone || '+123-456-7890',
    email: resume.email || 'your.email@example.com',
    location: resume.location || 'Your City, Country',
    website: resume.website || 'www.yourwebsite.com'
  };
  
  // Generate languages (placeholder - can be enhanced)
  const languages = ['English: Fluent', 'Spanish: Intermediate'];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume - ${name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #ffffff;
      color: #333333;
      line-height: 1.6;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    /* Header Section */
    .resume-header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
    }
    
    .resume-name {
      font-size: 42px;
      font-weight: 700;
      text-transform: uppercase;
      color: #333333;
      letter-spacing: 2px;
      margin-bottom: 8px;
      position: relative;
      z-index: 2;
    }
    
    .resume-title {
      font-size: 16px;
      font-weight: 400;
      text-transform: uppercase;
      color: #666666;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    
    .header-divider {
      width: 100%;
      height: 1px;
      background: #dddddd;
      margin-top: 20px;
    }
    
    /* Two Column Layout */
    .resume-container {
      display: flex;
      gap: 40px;
      margin-top: 30px;
    }
    
    .resume-left {
      width: 32%;
      flex-shrink: 0;
    }
    
    .resume-right {
      width: 68%;
      flex: 1;
      border-left: 1px solid #dddddd;
      padding-left: 40px;
    }
    
    /* Section Titles */
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      color: #333333;
      background: #eeeeee;
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      display: inline-block;
      letter-spacing: 0.5px;
    }
    
    /* Contact Section */
    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 12px;
      font-size: 13px;
      color: #333333;
    }
    
    .contact-icon {
      font-size: 14px;
      color: #888888;
      margin-top: 2px;
      width: 16px;
      text-align: center;
    }
    
    /* Education Section */
    .education-item {
      margin-bottom: 20px;
    }
    
    .education-date {
      font-size: 12px;
      color: #333333;
      margin-bottom: 4px;
    }
    
    .education-university {
      font-size: 13px;
      font-weight: 700;
      color: #333333;
      margin-bottom: 6px;
    }
    
    .education-degree {
      font-size: 12px;
      color: #333333;
      margin-left: 12px;
      position: relative;
    }
    
    .education-degree::before {
      content: '•';
      position: absolute;
      left: -12px;
      color: #333333;
    }
    
    /* Skills Section */
    .skills-list {
      list-style: none;
    }
    
    .skills-list li {
      font-size: 13px;
      color: #333333;
      margin-bottom: 8px;
      padding-left: 12px;
      position: relative;
    }
    
    .skills-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #333333;
    }
    
    /* Languages Section */
    .languages-list {
      list-style: none;
    }
    
    .languages-list li {
      font-size: 13px;
      color: #333333;
      margin-bottom: 8px;
      padding-left: 12px;
      position: relative;
    }
    
    .languages-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #333333;
    }
    
    /* Profile Summary */
    .profile-summary {
      font-size: 13px;
      color: #333333;
      line-height: 1.8;
      text-align: justify;
      margin-bottom: 30px;
    }
    
    /* Work Experience */
    .experience-item {
      margin-bottom: 24px;
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    
    .experience-company {
      font-size: 14px;
      font-weight: 700;
      color: #333333;
    }
    
    .experience-date {
      font-size: 12px;
      color: #333333;
      text-align: right;
    }
    
    .experience-role {
      font-size: 13px;
      color: #333333;
      margin-bottom: 10px;
    }
    
    .experience-description {
      list-style: none;
      padding-left: 0;
    }
    
    .experience-description li {
      font-size: 12px;
      color: #333333;
      margin-bottom: 6px;
      padding-left: 12px;
      position: relative;
    }
    
    .experience-description li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #333333;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      .resume-container {
        gap: 30px;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="resume-header">
    <h1 class="resume-name">${escapeHtml(name.toUpperCase())}</h1>
    <p class="resume-title">${escapeHtml(title.toUpperCase())}</p>
    <div class="header-divider"></div>
  </div>
  
  <!-- Two Column Container -->
  <div class="resume-container">
    <!-- Left Column -->
    <div class="resume-left">
      <!-- Contact -->
      <div class="section-title">CONTACT</div>
      <div class="contact-item">
        <span class="contact-icon">📞</span>
        <span>${escapeHtml(contact.phone)}</span>
      </div>
      <div class="contact-item">
        <span class="contact-icon">✉️</span>
        <span>${escapeHtml(contact.email)}</span>
      </div>
      <div class="contact-item">
        <span class="contact-icon">📍</span>
        <span>${escapeHtml(contact.location)}</span>
      </div>
      <div class="contact-item">
        <span class="contact-icon">🌐</span>
        <span>${escapeHtml(contact.website)}</span>
      </div>
      
      <!-- Education -->
      ${education.length > 0 ? `
      <div style="margin-top: 30px;">
        <div class="section-title">EDUCATION</div>
        ${education.map(edu => `
          <div class="education-item">
            <div class="education-date">${edu.date}</div>
            <div class="education-university">${escapeHtml(edu.university)}</div>
            <div class="education-degree">${escapeHtml(edu.degree)}</div>
            ${edu.gpa ? `<div class="education-degree">GPA: ${edu.gpa}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <!-- Skills -->
      ${skills.length > 0 ? `
      <div style="margin-top: 30px;">
        <div class="section-title">SKILLS</div>
        <ul class="skills-list">
          ${skills.map(skill => `<li>${escapeHtml(skill)}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      <!-- Languages -->
      ${languages.length > 0 ? `
      <div style="margin-top: 30px;">
        <div class="section-title">LANGUAGES</div>
        <ul class="languages-list">
          ${languages.map(lang => `<li>${escapeHtml(lang)}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
    
    <!-- Right Column -->
    <div class="resume-right">
      <!-- Profile Summary -->
      ${profileSummary ? `
      <div>
        <div class="section-title">PROFILE SUMMARY</div>
        <div class="profile-summary">${escapeHtml(profileSummary)}</div>
      </div>
      ` : ''}
      
      <!-- Work Experience -->
      ${workExperience.length > 0 ? `
      <div style="margin-top: 30px;">
        <div class="section-title">WORK EXPERIENCE</div>
        ${workExperience.map(exp => `
          <div class="experience-item">
            <div class="experience-header">
              <div>
                <div class="experience-company">${escapeHtml(exp.company)}</div>
                <div class="experience-role">${escapeHtml(exp.role)}</div>
              </div>
              <div class="experience-date">${exp.date}</div>
            </div>
            <ul class="experience-description">
              ${exp.description.map(desc => `<li>${escapeHtml(desc)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate career title from domain
 */
function getCareerTitle(domain) {
  const titles = {
    'software': 'Software Engineer',
    'design': 'UI/UX Designer',
    'accounts': 'Financial Analyst',
    'business': 'Business Manager',
    'cooking': 'Chef',
    'painting': 'Artist',
    'medical': 'Healthcare Professional',
    'general': 'Professional'
  };
  return titles[domain] || 'Professional';
}

/**
 * Generate profile summary from resume data
 */
function generateProfileSummary(resume) {
  const domain = resume.careerDomain || 'general';
  const skills = resume.skills || [];
  const activities = resume.learningActivities || [];
  
  const domainDescriptions = {
    'software': 'Experienced software professional with expertise in modern development practices',
    'design': 'Creative designer focused on user-centered design and visual communication',
    'accounts': 'Detail-oriented financial professional with strong analytical skills',
    'business': 'Strategic business professional with expertise in management and growth',
    'cooking': 'Passionate culinary professional dedicated to creating exceptional dining experiences',
    'painting': 'Creative artist with a passion for visual expression and artistic innovation',
    'medical': 'Dedicated healthcare professional committed to patient care and medical excellence',
    'general': 'Motivated professional with diverse skills and a commitment to continuous learning'
  };
  
  let summary = domainDescriptions[domain] || 'Motivated professional';
  
  if (skills.length > 0) {
    summary += ` specializing in ${skills.slice(0, 3).join(', ')}`;
  }
  
  if (activities.length > 0) {
    summary += `. Demonstrated commitment to professional development through ${activities.length} learning activities`;
  }
  
  summary += '.';
  
  return summary;
}

/**
 * Generate work experience from learning activities
 */
function generateWorkExperience(activities) {
  // Group activities by domain and create work experience entries
  const grouped = {};
  
  activities.forEach(activity => {
    const domain = activity.domain || 'general';
    if (!grouped[domain]) {
      grouped[domain] = [];
    }
    grouped[domain].push(activity);
  });
  
  const experiences = [];
  let year = new Date().getFullYear();
  
  Object.keys(grouped).forEach((domain, idx) => {
    const domainActivities = grouped[domain];
    const companyNames = {
      'software': 'Tech Solutions Inc.',
      'design': 'Creative Studio',
      'accounts': 'Finance Corp',
      'business': 'Business Ventures',
      'cooking': 'Culinary Arts',
      'painting': 'Art Gallery',
      'medical': 'Healthcare Center',
      'general': 'Professional Services'
    };
    
    const company = companyNames[domain] || 'Professional Organization';
    const role = getCareerTitle(domain);
    const startYear = year - (domainActivities.length + idx);
    const endYear = idx === 0 ? 'PRESENT' : `${startYear + 1}`;
    
    const descriptions = domainActivities.slice(0, 3).map(activity => {
      return activity.activityType || `Completed ${activity.domain || 'professional'} activity`;
    });
    
    experiences.push({
      company,
      role,
      date: `${startYear} - ${endYear}`,
      description: descriptions.length > 0 ? descriptions : ['Contributed to professional development and skill enhancement']
    });
  });
  
  return experiences.slice(0, 3); // Limit to 3 experiences
}

/**
 * Generate education from activities
 */
function generateEducation(activities) {
  const education = [];
  
  // Extract education-related activities
  const educationActivities = activities.filter(a => 
    a.activityType && (
      a.activityType.toLowerCase().includes('course') ||
      a.activityType.toLowerCase().includes('degree') ||
      a.activityType.toLowerCase().includes('university') ||
      a.activityType.toLowerCase().includes('education')
    )
  );
  
  if (educationActivities.length > 0) {
    educationActivities.slice(0, 2).forEach((activity, idx) => {
      const year = new Date().getFullYear() - (idx + 1);
      education.push({
        date: `${year - 1} - ${year}`,
        university: 'University of Professional Development',
        degree: activity.activityType || 'Professional Certificate',
        gpa: idx === 0 ? '3.8/4.0' : null
      });
    });
  } else {
    // Default education entry
    education.push({
      date: '2025 - 2029',
      university: 'University Name',
      degree: 'Bachelor\'s Degree',
      gpa: '3.8/4.0'
    });
  }
  
  return education;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Download resume as HTML file
 * 
 * WHY HTML INSTEAD OF PDF:
 * =========================
 * - PDF generation requires backend or heavy libraries (jsPDF, html2pdf.js)
 * - HTML download is simpler and works offline
 * - User can open HTML in browser and print to PDF if needed
 * - HTML preserves all styling and layout perfectly
 * - No external dependencies required
 * 
 * The downloaded HTML file can be:
 * 1. Opened in any browser
 * 2. Printed to PDF using browser's print function (Ctrl+P → Save as PDF)
 * 3. Shared as-is (HTML files are universally readable)
 */
function downloadResume(resume) {
  if (!resume) {
    console.error('Cannot download: Resume data is missing');
    alert('Unable to download resume. Please ensure your resume data is loaded.');
    return;
  }
  
  try {
    const html = generateResumeHTML(resume);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename from name or use default
    const name = (resume.name || 'careerverse').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `resume_${name}_${Date.now()}.html`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    const downloadBtn = document.getElementById('download-resume-btn');
    if (downloadBtn) {
      const originalText = downloadBtn.textContent;
      downloadBtn.textContent = '✅ Downloaded!';
      downloadBtn.style.background = '#4caf50';
      setTimeout(() => {
        downloadBtn.textContent = originalText;
        downloadBtn.style.background = '';
      }, 2000);
    }
  } catch (error) {
    console.error('Error downloading resume:', error);
    alert('Error downloading resume. Please try again.');
  }
}

// ============================================
// JOB MATCHING & DISPLAY
// ============================================
async function displayJobs() {
  // Check if we're in popup context
  const jobsDiv = document.getElementById('jobs-content');
  
  if (!jobsDiv) {
    console.warn('Jobs display element not found. This function should only run in popup context.');
    return;
  }
  
  let jobs = {};
  try {
    jobs = await ResumeManager.getMatchedJobs();
  } catch (error) {
    console.error('Error loading jobs:', error);
    jobs = {};
  }

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
  // Check if we're in popup context
  const container = document.querySelector('.container');
  if (!container) {
    console.warn('Tab initialization: Popup container not found. This function should only run in popup context.');
    return;
  }
  
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  if (tabButtons.length === 0 || tabPanes.length === 0) {
    console.warn('Tab elements not found. Make sure popup.html is properly structured.');
    return;
  }

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
  // Ensure we're in popup context, not webpage context
  // Check if popup.html elements exist
  const container = document.querySelector('.container');
  if (!container) {
    console.error('Popup UI not found. This script should only run in popup.html context.');
    return;
  }
  
  try {
    initTabs();
    
    // Try to initialize Firebase, but don't fail if it doesn't work
    try {
      const firebaseReady = await ResumeManager.init();
      if (firebaseReady) {
        console.log('Firebase initialized and user authenticated');
      } else {
        console.warn('Firebase initialization failed, but popup UI will still work');
      }
    } catch (error) {
      console.warn('Firebase initialization error:', error);
      // Show a message in the UI that data might not be available
      const resumeDiv = document.getElementById('resume-content');
      if (resumeDiv && resumeDiv.innerHTML.trim() === '') {
        resumeDiv.innerHTML = `
          <div class="resume-preview empty">
            <span>⚠️</span>
            <p>Unable to connect to Firebase.</p>
            <p style="font-size: 12px; margin-top: 10px;">Please check your internet connection and reload the extension.</p>
          </div>
        `;
      }
    }
    
    // Load initial data (these functions handle errors internally)
    displayActivities();
  } catch (error) {
    console.error('Initialization error:', error);
  }
  
  // Load resume and jobs after a short delay to ensure DOM is ready
  setTimeout(() => {
    displayResume();
    displayJobs();
  }, 100);
}

// Run when DOM is ready
// Ensure this only runs in popup context
if (typeof window !== 'undefined' && document.querySelector('.container')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
} else {
  console.warn('popup.js: Not running in popup context. This script is for popup.html only.');
}
