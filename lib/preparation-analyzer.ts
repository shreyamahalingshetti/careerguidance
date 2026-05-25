export type PreparationGuidance = {
  rounds: {
    name: string;
    topics: { name: string; url?: string; action?: string }[];
    icon: string;
  }[];
  skillWarnings: string[];
  companyInsights?: {
    focusAreas: string[];
  };
};

const WITCH_COMPANIES = ['infosys', 'tcs', 'wipro', 'accenture', 'cognizant', 'capgemini', 'hcl'];

export function generatePreparationGuidance(
  jobTitle: string,
  company: string,
  missingSkills: string[]
): PreparationGuidance {
  const guidance: PreparationGuidance = {
    rounds: [],
    skillWarnings: []
  };

  const titleLower = jobTitle.toLowerCase();
  const companyLower = company.toLowerCase();

  // 1. Aptitude Round (almost all entry/mid level tech jobs have this)
  guidance.rounds.push({
    name: 'Aptitude Round',
    icon: '🧠',
    topics: [
      { name: 'Logical Reasoning', url: 'https://www.geeksforgeeks.org/logical-reasoning/', action: 'Practice' },
      { name: 'Quantitative Aptitude', url: 'https://www.indiabix.com/aptitude/questions-and-answers/', action: 'Practice' },
      { name: 'Analytical Thinking', url: 'https://www.coursera.org/articles/analytical-skills', action: 'Learn' }
    ]
  });

  // 2. Technical Round
  let techTopics: { name: string; url: string; action: string }[] = [];
  if (titleLower.includes('frontend') || titleLower.includes('ui') || titleLower.includes('react')) {
    techTopics = [
      { name: 'DOM Manipulation', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents', action: 'Learn' },
      { name: 'JavaScript ES6+', url: 'https://javascript.info/', action: 'Learn' },
      { name: 'React Hooks & State', url: 'https://react.dev/', action: 'Learn' },
      { name: 'CSS Responsiveness', url: 'https://web.dev/learn/design/', action: 'Learn' }
    ];
  } else if (titleLower.includes('backend') || titleLower.includes('node') || titleLower.includes('java')) {
    techTopics = [
      { name: 'API Design (REST/GraphQL)', url: 'https://restfulapi.net/', action: 'Learn' },
      { name: 'Database Indexing & Queries', url: 'https://use-the-index-luke.com/', action: 'Learn' },
      { name: 'System Design Basics', url: 'https://github.com/donnemartin/system-design-primer', action: 'Guide' },
      { name: 'Authentication (JWT)', url: 'https://jwt.io/introduction', action: 'Learn' }
    ];
  } else if (titleLower.includes('data') || titleLower.includes('ml') || titleLower.includes('ai')) {
    techTopics = [
      { name: 'Data Preprocessing', url: 'https://scikit-learn.org/stable/modules/preprocessing.html', action: 'Learn' },
      { name: 'SQL Queries', url: 'https://leetcode.com/studyplan/top-sql-50/', action: 'Practice' },
      { name: 'Machine Learning Algorithms', url: 'https://developers.google.com/machine-learning/crash-course', action: 'Learn' },
      { name: 'Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', action: 'Learn' }
    ];
  } else {
    techTopics = [
      { name: 'Core Fundamentals of your primary language', url: 'https://roadmap.sh/', action: 'Guide' },
      { name: 'Object Oriented Programming', url: 'https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/', action: 'Learn' },
      { name: 'DBMS Concepts', url: 'https://www.geeksforgeeks.org/dbms/', action: 'Learn' }
    ];
  }

  guidance.rounds.push({
    name: 'Technical Round',
    icon: '💻',
    topics: techTopics
  });

  // 3. Coding/DSA Round (very common for SWE)
  if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('software')) {
    guidance.rounds.push({
      name: 'Coding Round',
      icon: '⌨️',
      topics: [
        { name: 'Arrays & Strings', url: 'https://leetcode.com/problemset/all/?topicSlugs=array,string', action: 'Practice' },
        { name: 'HashMaps & Sets', url: 'https://leetcode.com/problemset/all/?topicSlugs=hash-table', action: 'Practice' },
        { name: 'Two Pointers / Sliding Window', url: 'https://leetcode.com/problemset/all/?topicSlugs=two-pointers,sliding-window', action: 'Practice' },
        { name: 'Basic Dynamic Programming', url: 'https://leetcode.com/problemset/all/?topicSlugs=dynamic-programming', action: 'Practice' }
      ]
    });
  }

  // 4. HR Round
  guidance.rounds.push({
    name: 'HR / Behavioral',
    icon: '🤝',
    topics: [
      { name: 'Explain your past projects clearly', url: 'https://www.pramp.com/', action: 'Practice' },
      { name: 'Situation-Task-Action-Result (STAR) method', url: 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique', action: 'Guide' },
      { name: 'Communication confidence', url: 'https://www.coursera.org/articles/communication-skills', action: 'Learn' }
    ]
  });

  // 5. Skill Warnings based on missing skills
  if (missingSkills.length > 0) {
    missingSkills.slice(0, 3).forEach(skill => {
      guidance.skillWarnings.push(`Improve ${skill} understanding before applying.`);
    });
  }

  // 6. Company Insights for WITCH companies
  const isWitch = WITCH_COMPANIES.some(c => companyLower.includes(c));
  if (isWitch) {
    guidance.companyInsights = {
      focusAreas: ['Aptitude & Logical Reasoning', 'Strong Communication Skills', 'Core Programming Fundamentals', 'Adaptability to technologies']
    };
  }

  return guidance;
}
