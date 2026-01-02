// CareerVerse AI - Main Popup Logic
// Universal Career Assistant

(function() {
  'use strict';

  // ============================================
  // CAREER KNOWLEDGE ENGINE
  // Static data for all career domains
  // ============================================
  const careerData = {
    software: {
      name: 'Software / IT',
      description: 'Build applications, solve technical problems, and create digital solutions.',
      advice: 'Start with one programming language (Python or JavaScript recommended). Focus on fundamentals before frameworks. Practice coding daily and build projects.',
      skills: ['Programming Languages', 'Data Structures & Algorithms', 'Version Control (Git)', 'Database Management', 'Problem Solving', 'Testing & Debugging'],
      roadmap: [
        { stage: 'Beginner', steps: ['Learn basic syntax', 'Solve simple problems', 'Build console apps'] },
        { stage: 'Intermediate', steps: ['Learn frameworks', 'Build web apps', 'Use APIs', 'Database integration'] },
        { stage: 'Advanced', steps: ['System design', 'Deployment', 'Performance optimization', 'Contribute to open source'] }
      ],
      learning: {
        youtube: 'Search: "JavaScript/Python Tutorial for Beginners", "Web Development Full Course", "Data Structures Explained"',
        courses: 'FreeCodeCamp, Coursera CS courses, edX, Codecademy, Khan Academy Computer Science',
        practice: 'LeetCode, HackerRank, CodeWars, Build personal projects, Contribute to GitHub'
      }
    },
    painting: {
      name: 'Painting & Arts',
      description: 'Express creativity through visual art, colors, and compositions.',
      advice: 'Start with sketching fundamentals. Practice daily, study color theory, and observe real-world objects. Don\'t fear mistakes - they\'re learning opportunities.',
      skills: ['Sketching & Drawing', 'Color Theory', 'Composition', 'Different Mediums (Oil, Watercolor, Acrylic)', 'Art History', 'Portfolio Development'],
      roadmap: [
        { stage: 'Beginner', steps: ['Basic sketching', 'Simple shapes and forms', 'Color mixing basics'] },
        { stage: 'Intermediate', steps: ['Landscape painting', 'Portrait basics', 'Experiment with mediums'] },
        { stage: 'Advanced', steps: ['Develop personal style', 'Create portfolio', 'Exhibit work', 'Teach or mentor'] }
      ],
      learning: {
        youtube: 'Search: "Drawing Fundamentals", "Watercolor Techniques", "Oil Painting Tutorial", "Color Theory Explained"',
        courses: 'Skillshare art classes, Domestika, YouTube art channels, Local art classes',
        practice: 'Daily sketching, Paint from life, Join art communities, Visit galleries and museums'
      }
    },
    accounts: {
      name: 'Accounts & Finance',
      description: 'Manage financial records, analyze data, and ensure financial compliance.',
      advice: 'Master basics of bookkeeping and accounting principles. Learn Excel and accounting software. Understand tax regulations in your region.',
      skills: ['Bookkeeping', 'Financial Reporting', 'Excel/Spreadsheets', 'Accounting Software (Tally, QuickBooks)', 'Tax Knowledge', 'Analytical Skills'],
      roadmap: [
        { stage: 'Beginner', steps: ['Learn accounting basics', 'Master Excel', 'Understand financial statements'] },
        { stage: 'Intermediate', steps: ['Learn accounting software', 'Tax preparation', 'Financial analysis'] },
        { stage: 'Advanced', steps: ['CPA certification', 'Financial planning', 'Audit expertise', 'Management accounting'] }
      ],
      learning: {
        youtube: 'Search: "Accounting Basics", "Excel for Accountants", "Tally Tutorial", "Financial Accounting Explained"',
        courses: 'Coursera Accounting courses, Khan Academy Finance, Udemy Accounting courses, Professional certifications',
        practice: 'Practice bookkeeping exercises, Use accounting software, Join accounting forums, Internships'
      }
    },
    cooking: {
      name: 'Cooking & Culinary',
      description: 'Create delicious meals, understand flavors, and master culinary techniques.',
      advice: 'Start with basic knife skills and safety. Master fundamental cooking methods (sauté, roast, boil). Practice recipes repeatedly to build muscle memory.',
      skills: ['Knife Skills', 'Food Safety & Hygiene', 'Cooking Techniques', 'Flavor Balancing', 'Recipe Development', 'Menu Planning'],
      roadmap: [
        { stage: 'Beginner', steps: ['Basic knife skills', 'Simple recipes', 'Learn cooking methods'] },
        { stage: 'Intermediate', steps: ['Complex recipes', 'Baking basics', 'Food presentation'] },
        { stage: 'Advanced', steps: ['Advanced techniques', 'Recipe creation', 'Culinary specialization', 'Professional kitchen'] }
      ],
      learning: {
        youtube: 'Search: "Cooking Basics", "Knife Skills Tutorial", "Recipe Videos", "Baking Fundamentals"',
        courses: 'MasterClass cooking, YouTube cooking channels, Local cooking classes, Culinary school',
        practice: 'Cook daily, Try new recipes, Experiment with flavors, Cook for others, Food blogging'
      }
    },
    business: {
      name: 'Business & Startups',
      description: 'Build companies, solve market problems, and create value.',
      advice: 'Identify real problems people face. Start small, validate ideas with customers. Learn about marketing, sales, and finance. Network actively.',
      skills: ['Market Research', 'Business Planning', 'Marketing & Sales', 'Financial Management', 'Leadership', 'Customer Development'],
      roadmap: [
        { stage: 'Beginner', steps: ['Business idea validation', 'Market research', 'Basic business plan'] },
        { stage: 'Intermediate', steps: ['MVP development', 'Customer acquisition', 'Sales processes'] },
        { stage: 'Advanced', steps: ['Scale business', 'Team building', 'Fundraising', 'Strategic planning'] }
      ],
      learning: {
        youtube: 'Search: "Startup Basics", "Business Strategy", "Marketing Fundamentals", "Entrepreneurship"',
        courses: 'Coursera Business courses, Y Combinator Startup School, Udemy Business courses, Local business workshops',
        practice: 'Start small projects, Network with entrepreneurs, Join startup communities, Read business books'
      }
    },
    medical: {
      name: 'Medical & Healthcare',
      description: 'Care for patients, diagnose conditions, and improve health outcomes.',
      advice: 'Strong foundation in sciences is essential. Develop empathy and communication skills. Stay updated with medical research. Consider your specialization interests early.',
      skills: ['Medical Knowledge', 'Patient Care', 'Diagnostic Skills', 'Communication', 'Critical Thinking', 'Ethics & Empathy'],
      roadmap: [
        { stage: 'Beginner', steps: ['Pre-medical studies', 'Basic sciences', 'Healthcare exposure'] },
        { stage: 'Intermediate', steps: ['Medical school', 'Clinical rotations', 'Specialization choice'] },
        { stage: 'Advanced', steps: ['Residency', 'Board certification', 'Practice or research', 'Continuing education'] }
      ],
      learning: {
        youtube: 'Search: "Medical School Prep", "Anatomy Explained", "Medical Case Studies", "Healthcare Careers"',
        courses: 'Khan Academy Medicine, Coursera Medical courses, Medical school prerequisites, Professional certifications',
        practice: 'Medical volunteering, Shadow professionals, Study groups, Research opportunities'
      }
    },
    design: {
      name: 'Design & Creative',
      description: 'Create visual experiences, solve design problems, and communicate ideas visually.',
      advice: 'Learn design principles (contrast, alignment, hierarchy). Master design tools. Build a strong portfolio. Understand user needs and iterate on feedback.',
      skills: ['Design Principles', 'Design Tools (Figma, Adobe)', 'Typography', 'Color Theory', 'User Experience', 'Portfolio Creation'],
      roadmap: [
        { stage: 'Beginner', steps: ['Design fundamentals', 'Learn design tools', 'Basic projects'] },
        { stage: 'Intermediate', steps: ['Advanced techniques', 'Client projects', 'Portfolio building'] },
        { stage: 'Advanced', steps: ['Specialization', 'Design systems', 'Leadership', 'Teaching'] }
      ],
      learning: {
        youtube: 'Search: "UI/UX Design Tutorial", "Figma Basics", "Design Principles", "Graphic Design Tips"',
        courses: 'Interaction Design Foundation, Skillshare Design, Coursera Design courses, Adobe tutorials',
        practice: 'Daily design challenges, Redesign existing apps, Build portfolio, Join design communities'
      }
    },
    general: {
      name: 'General Career',
      description: 'Explore various career paths and find your passion.',
      advice: 'Reflect on your interests and values. Research different careers. Gain experience through internships or volunteering. Network and seek mentorship.',
      skills: ['Self-Assessment', 'Research Skills', 'Networking', 'Communication', 'Adaptability', 'Goal Setting'],
      roadmap: [
        { stage: 'Beginner', steps: ['Self-reflection', 'Career exploration', 'Skill assessment'] },
        { stage: 'Intermediate', steps: ['Gain experience', 'Build network', 'Develop skills'] },
        { stage: 'Advanced', steps: ['Career transition', 'Professional growth', 'Mentorship'] }
      ],
      learning: {
        youtube: 'Search: "Career Advice", "Finding Your Passion", "Professional Development", "Networking Tips"',
        courses: 'LinkedIn Learning, General career courses, Professional development workshops',
        practice: 'Informational interviews, Volunteer work, Part-time jobs, Professional associations'
      }
    }
  };

  // ============================================
  // OPPORTUNITIES DATA (Static)
  // ============================================
  const opportunitiesData = {
    software: [
      { type: 'Job', title: 'Junior Software Developer', description: 'Entry-level position at tech company. Requirements: Basic programming, problem-solving skills.', details: 'Full-time, Remote options available' },
      { type: 'Internship', title: 'Software Engineering Intern', description: 'Summer internship program for students. Learn real-world development practices.', details: '3 months, Paid' },
      { type: 'Event', title: 'Tech Hackathon', description: '48-hour coding competition. Build projects, network with developers.', details: 'Next month, Online/Offline' },
      { type: 'Freelance', title: 'Web Development Projects', description: 'Freelance opportunities on platforms like Upwork, Fiverr for web projects.', details: 'Remote, Flexible' }
    ],
    painting: [
      { type: 'Event', title: 'Local Art Exhibition', description: 'Submit your artwork for community art show. Great for portfolio building.', details: 'Monthly, Local gallery' },
      { type: 'Freelance', title: 'Commission Artwork', description: 'Take custom art commissions. Build client base through social media.', details: 'Remote, Flexible' },
      { type: 'Course', title: 'Advanced Painting Workshop', description: 'Weekend workshop with professional artist. Learn advanced techniques.', details: '2 days, In-person' },
      { type: 'Job', title: 'Art Teacher Assistant', description: 'Part-time position helping with art classes. Good for experience.', details: 'Part-time, Local' }
    ],
    accounts: [
      { type: 'Internship', title: 'Accounting Intern', description: 'Learn bookkeeping, financial reporting in real business environment.', details: '3-6 months, Office-based' },
      { type: 'Course', title: 'Tally Certification Course', description: 'Professional certification in Tally accounting software.', details: '4 weeks, Online/Offline' },
      { type: 'Job', title: 'Junior Accountant', description: 'Entry-level accounting position. Handle basic bookkeeping and reports.', details: 'Full-time, Office' },
      { type: 'Event', title: 'Finance Professionals Meetup', description: 'Networking event for finance professionals. Learn industry trends.', details: 'Monthly, Local' }
    ],
    cooking: [
      { type: 'Internship', title: 'Kitchen Intern', description: 'Learn in professional kitchen. Assist chefs, learn techniques.', details: '3-6 months, Restaurant' },
      { type: 'Course', title: 'Professional Cooking Course', description: 'Comprehensive culinary training program. Certificate upon completion.', details: '6 months, Culinary school' },
      { type: 'Job', title: 'Line Cook', description: 'Entry-level kitchen position. Prepare ingredients, assist in cooking.', details: 'Full-time, Restaurant' },
      { type: 'Event', title: 'Food Festival Participation', description: 'Showcase your cooking at local food festival. Great exposure.', details: 'Seasonal, Local events' }
    ],
    business: [
      { type: 'Event', title: 'Startup Pitch Competition', description: 'Pitch your business idea. Win funding and mentorship.', details: 'Quarterly, City-wide' },
      { type: 'Internship', title: 'Business Development Intern', description: 'Help with market research, client outreach, business strategy.', details: '3-6 months, Startup/Corp' },
      { type: 'Course', title: 'Entrepreneurship Bootcamp', description: 'Intensive program covering all aspects of starting a business.', details: '2 weeks, Intensive' },
      { type: 'Networking', title: 'Entrepreneur Meetup', description: 'Monthly networking event. Connect with founders and investors.', details: 'Monthly, Local' }
    ],
    medical: [
      { type: 'Volunteer', title: 'Hospital Volunteer', description: 'Gain healthcare experience. Assist patients, observe medical professionals.', details: 'Flexible hours, Hospital' },
      { type: 'Course', title: 'EMT Certification', description: 'Emergency Medical Technician certification. Entry point to healthcare.', details: '3-6 months, Certified program' },
      { type: 'Event', title: 'Medical Conference', description: 'Learn about latest medical research and practices. Network with professionals.', details: 'Quarterly, Various locations' },
      { type: 'Job', title: 'Medical Assistant', description: 'Support healthcare providers. Administrative and clinical duties.', details: 'Full-time, Clinic/Hospital' }
    ],
    design: [
      { type: 'Freelance', title: 'Logo Design Projects', description: 'Freelance design work on platforms. Build portfolio while earning.', details: 'Remote, Flexible' },
      { type: 'Internship', title: 'Design Intern', description: 'Work with design team. Learn industry practices, build portfolio.', details: '3-6 months, Agency/Company' },
      { type: 'Event', title: 'Design Portfolio Review', description: 'Get feedback on your portfolio from industry professionals.', details: 'Monthly, Online/Offline' },
      { type: 'Course', title: 'UI/UX Design Bootcamp', description: 'Comprehensive design program. Master design tools and principles.', details: '3 months, Intensive' }
    ],
    general: [
      { type: 'Event', title: 'Career Fair', description: 'Meet employers from various industries. Explore opportunities.', details: 'Seasonal, Various locations' },
      { type: 'Course', title: 'Professional Development Workshop', description: 'Learn soft skills, resume writing, interview techniques.', details: '1-2 days, Local/Online' },
      { type: 'Networking', title: 'Professional Networking Event', description: 'Connect with professionals across industries. Expand network.', details: 'Monthly, Local' },
      { type: 'Resource', title: 'Career Counseling', description: 'One-on-one career guidance. Identify strengths and career paths.', details: 'By appointment, Various' }
    ]
  };

  // ============================================
  // RESUME MANAGER
  // ============================================
  const ResumeManager = {
    async getResume() {
      const result = await chrome.storage.local.get(['careerverseResume']);
      return result.careerverseResume || {
        career: null,
        skills: [],
        activities: [],
        achievements: [],
        lastUpdated: null
      };
    },

    async saveResume(resume) {
      resume.lastUpdated = new Date().toISOString();
      await chrome.storage.local.set({ careerverseResume: resume });
    },

    async addSkill(skill) {
      const resume = await this.getResume();
      if (!resume.skills.includes(skill)) {
        resume.skills.push(skill);
        await this.saveResume(resume);
      }
    },

    async addActivity(activity) {
      const resume = await this.getResume();
      resume.activities.push({
        text: activity,
        date: new Date().toLocaleDateString()
      });
      // Keep only last 10 activities
      if (resume.activities.length > 10) {
        resume.activities = resume.activities.slice(-10);
      }
      await this.saveResume(resume);
    },

    async updateCareer(career) {
      const resume = await this.getResume();
      resume.career = career;
      await this.saveResume(resume);
    },

    async reset() {
      await chrome.storage.local.remove('careerverseResume');
    }
  };

  // ============================================
  // UI FUNCTIONS
  // ============================================

  // Tab switching
  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Update active states
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');

        // Load content when switching tabs
        if (targetTab === 'resume') {
          loadResume();
        }
      });
    });
  }

  // Get page context
  async function getPageContext() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we can inject script (some pages like chrome:// don't allow it)
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        return {
          career: null,
          url: tab.url || 'N/A',
          domain: 'N/A',
          title: tab.title || 'N/A'
        };
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return window.careerverseContext || null;
        }
      });
      return results[0]?.result || {
        career: null,
        url: tab.url || 'N/A',
        domain: new URL(tab.url).hostname || 'N/A',
        title: tab.title || 'N/A'
      };
    } catch (error) {
      console.error('Error getting context:', error);
      // Return basic info even on error
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return {
          career: null,
          url: tab.url || 'N/A',
          domain: tab.url ? new URL(tab.url).hostname : 'N/A',
          title: tab.title || 'N/A'
        };
      } catch (e) {
        return null;
      }
    }
  }

  // Display context info
  async function displayContext() {
    const contextInfo = document.getElementById('context-info');
    const context = await getPageContext();
    
    if (context && context.career) {
      contextInfo.innerHTML = `
        <p><strong>Detected Career:</strong> ${careerData[context.career]?.name || context.career}</p>
        <p><strong>Website:</strong> ${context.domain}</p>
        <p><strong>Page:</strong> ${context.title.substring(0, 50)}...</p>
      `;
    } else {
      contextInfo.innerHTML = `
        <p>No career detected automatically.</p>
        <p><strong>Website:</strong> ${context?.domain || 'Unknown'}</p>
        <p>Please select a career manually or visit a career-related website.</p>
      `;
    }
  }

  // Show guidance
  function showGuidance(careerKey) {
    const career = careerData[careerKey];
    if (!career) return;

    const resultDiv = document.getElementById('guidance-result');
    resultDiv.innerHTML = `
      <div class="guidance-card">
        <h3>${career.name}</h3>
        <p><strong>About:</strong> ${career.description}</p>
        <div class="advice-item">
          <strong>💡 Advice:</strong> ${career.advice}
        </div>
        <h4 style="margin-top: 15px; margin-bottom: 10px;">Essential Skills:</h4>
        <ul class="skills-list">
          ${career.skills.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
        <h4 style="margin-top: 15px; margin-bottom: 10px;">Next Steps:</h4>
        <div class="advice-item">
          <strong>Beginner:</strong> ${career.roadmap[0].steps.join(', ')}
        </div>
      </div>
    `;

    // Update resume
    ResumeManager.updateCareer(careerKey);
    ResumeManager.addActivity(`Explored ${career.name} career guidance`);
    career.skills.slice(0, 3).forEach(skill => {
      ResumeManager.addSkill(skill);
    });
  }

  // Show learning content
  function showLearning(careerKey) {
    const career = careerData[careerKey];
    if (!career) {
      document.getElementById('learn-content').innerHTML = '<div class="empty-state"><span>📚</span><p>Select a career to see learning resources</p></div>';
      return;
    }

    const learnDiv = document.getElementById('learn-content');
    learnDiv.innerHTML = `
      <div class="learning-path">
        <h3>Learning Resources for ${career.name}</h3>
        
        <div class="learning-item">
          <h4>📺 YouTube Learning</h4>
          <p>${career.learning.youtube}</p>
        </div>

        <div class="learning-item">
          <h4>📖 Online Courses</h4>
          <p>${career.learning.courses}</p>
        </div>

        <div class="learning-item">
          <h4>🎯 Practice Ideas</h4>
          <p>${career.learning.practice}</p>
        </div>

        <div class="learning-item">
          <h4>🗺️ Career Roadmap</h4>
          ${career.roadmap.map(stage => `
            <div style="margin-bottom: 15px;">
              <strong>${stage.stage}:</strong>
              <ul>
                ${stage.steps.map(step => `<li>${step}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Update resume
    ResumeManager.addActivity(`Viewed learning resources for ${career.name}`);
  }

  // Load and display resume
  async function loadResume() {
    const resume = await ResumeManager.getResume();
    const resumeDiv = document.getElementById('resume-content');

    if (!resume.career && resume.skills.length === 0 && resume.activities.length === 0) {
      resumeDiv.innerHTML = `
        <div class="resume-preview empty">
          <span>📄</span>
          <p>Your resume is empty.</p>
          <p>Start exploring careers to build your resume automatically!</p>
        </div>
      `;
      return;
    }

    resumeDiv.innerHTML = `
      <div class="resume-preview">
        ${resume.career ? `
          <div class="resume-section">
            <h3>Career Focus</h3>
            <div class="resume-item">
              <strong>${careerData[resume.career]?.name || resume.career}</strong>
            </div>
          </div>
        ` : ''}
        
        ${resume.skills.length > 0 ? `
          <div class="resume-section">
            <h3>Skills</h3>
            ${resume.skills.map(skill => `
              <div class="resume-item">${skill}</div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resume.activities.length > 0 ? `
          <div class="resume-section">
            <h3>Activities & Exploration</h3>
            ${resume.activities.slice().reverse().map(activity => `
              <div class="resume-item">
                <strong>${activity.date}:</strong> ${activity.text}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resume.lastUpdated ? `
          <div style="margin-top: 15px; font-size: 12px; color: #999; text-align: center;">
            Last updated: ${new Date(resume.lastUpdated).toLocaleString()}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Show opportunities
  function showOpportunities(careerKey) {
    const opportunities = opportunitiesData[careerKey] || [];
    const oppDiv = document.getElementById('opportunities-content');

    if (opportunities.length === 0) {
      oppDiv.innerHTML = '<div class="empty-state"><span>🌟</span><p>Select a career to see opportunities</p></div>';
      return;
    }

    oppDiv.innerHTML = opportunities.map(opp => `
      <div class="opportunity-card">
        <span class="type-badge">${opp.type}</span>
        <h4>${opp.title}</h4>
        <p>${opp.description}</p>
        <div class="details">${opp.details}</div>
      </div>
    `).join('');

    // Update resume
    ResumeManager.addActivity(`Viewed opportunities for ${careerData[careerKey]?.name || careerKey}`);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function initEventListeners() {
    // Detect career button
    document.getElementById('detect-btn').addEventListener('click', async () => {
      const context = await getPageContext();
      if (context && context.career) {
        showGuidance(context.career);
      } else {
        document.getElementById('guidance-result').innerHTML = `
          <div class="guidance-card">
            <p>No career detected on this page. Please select a career manually from the dropdown above.</p>
          </div>
        `;
      }
    });

    // Refresh context button
    document.getElementById('refresh-context-btn').addEventListener('click', () => {
      displayContext();
    });

    // Manual career selection (Guidance)
    document.getElementById('manual-career-select').addEventListener('change', (e) => {
      if (e.target.value) {
        showGuidance(e.target.value);
      } else {
        document.getElementById('guidance-result').innerHTML = '';
      }
    });

    // Learning career selection
    document.getElementById('learn-career-select').addEventListener('change', (e) => {
      if (e.target.value) {
        showLearning(e.target.value);
      } else {
        document.getElementById('learn-content').innerHTML = '';
      }
    });

    // Opportunities career selection
    document.getElementById('opportunities-career-select').addEventListener('change', (e) => {
      if (e.target.value) {
        showOpportunities(e.target.value);
      } else {
        document.getElementById('opportunities-content').innerHTML = '';
      }
    });

    // Reset resume button
    document.getElementById('reset-resume-btn').addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset your resume? This cannot be undone.')) {
        await ResumeManager.reset();
        loadResume();
      }
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    initTabs();
    initEventListeners();
    displayContext();
    loadResume();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

