/**
 * Skill Matching & Readiness Engine
 * ==================================
 * Core utility for the job recommendation system.
 * Uses rule-based matching (no ML) to score job-user fit.
 *
 * Architecture:
 * 1. Pathway → search query mapping (what jobs to fetch)
 * 2. Match scoring (how well user skills fit a job)
 * 3. Readiness level (beginner/intermediate/advanced based on progress)
 * 4. Feedback generation (human-readable guidance)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReadinessLevel = 'beginner' | 'intermediate' | 'advanced'

export type MatchResult = {
  score: number           // 0-100 percentage
  matchedSkills: string[] // skills the user already has
  missingSkills: string[] // skills the user still needs
  feedback: string        // human-readable guidance
  readiness: ReadinessLevel
}

// ---------------------------------------------------------------------------
// Pathway → skills mapping
// Each pathway defines what skills are taught at each roadmap node.
// This lets us convert "completed 5 of 12 nodes" into actual skill names.
// ---------------------------------------------------------------------------

const PATHWAY_SKILLS: Record<string, string[]> = {
  // Software Engineering pathways
  'full-stack': ['HTML', 'CSS', 'JavaScript', 'React', 'NPM', 'Tailwind CSS', 'Git', 'GitHub', 'Node.js', 'CLI', 'PostgreSQL', 'CRUD', 'Redis', 'REST API', 'Docker'],
  'frontend':   ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Responsive Design', 'Figma', 'Accessibility'],
  'backend':    ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'REST API', 'GraphQL', 'Authentication', 'Docker', 'Redis', 'Testing'],
  'devops':     ['Linux', 'Shell Scripting', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Monitoring', 'Nginx', 'Security'],

  // Data & AI pathways
  'data-engineer':     ['Python', 'SQL', 'ETL', 'Apache Spark', 'Airflow', 'Data Warehousing', 'Kafka', 'Cloud Storage', 'Data Modeling', 'dbt'],
  'machine-learning':  ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Deep Learning', 'NLP', 'Computer Vision', 'MLOps', 'Statistics'],
  'ai-engineer':       ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'LLMs', 'Prompt Engineering', 'LangChain', 'Vector Databases', 'RAG', 'MLOps'],

  // Other
  'cybersecurity':     ['Networking', 'Linux', 'Firewalls', 'SIEM', 'Penetration Testing', 'Cryptography', 'Incident Response', 'SOC', 'Compliance', 'Threat Intelligence'],
}

// ---------------------------------------------------------------------------
// Pathway → JSearch query mapping
// Maps the pathway + readiness level to a search string for the job API.
// Beginner → internship/trainee roles
// Intermediate → junior roles
// Advanced → full career roles
// ---------------------------------------------------------------------------

const SEARCH_QUERIES: Record<string, Record<ReadinessLevel, string>> = {
  'full-stack': {
    beginner:     'web development intern',
    intermediate: 'junior full stack developer',
    advanced:     'full stack developer',
  },
  'frontend': {
    beginner:     'frontend intern HTML CSS',
    intermediate: 'junior frontend developer React',
    advanced:     'senior frontend developer',
  },
  'backend': {
    beginner:     'backend intern Node.js',
    intermediate: 'junior backend developer',
    advanced:     'backend engineer',
  },
  'devops': {
    beginner:     'DevOps intern',
    intermediate: 'junior DevOps engineer',
    advanced:     'DevOps engineer cloud',
  },
  'data-engineer': {
    beginner:     'data engineering intern Python SQL',
    intermediate: 'junior data engineer',
    advanced:     'senior data engineer',
  },
  'machine-learning': {
    beginner:     'machine learning intern Python',
    intermediate: 'junior ML engineer',
    advanced:     'machine learning engineer',
  },
  'ai-engineer': {
    beginner:     'AI intern Python',
    intermediate: 'junior AI engineer',
    advanced:     'AI engineer LLM',
  },
  'cybersecurity': {
    beginner:     'cybersecurity intern',
    intermediate: 'junior SOC analyst',
    advanced:     'cybersecurity engineer',
  },
}

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Determine readiness level from roadmap progress.
 * - 0-33%  → beginner  (fetch internships)
 * - 34-66% → intermediate (fetch junior roles)
 * - 67%+   → advanced  (fetch full roles)
 */
export function computeReadinessLevel(completedNodes: number, totalNodes: number): ReadinessLevel {
  if (totalNodes <= 0) return 'beginner'
  const progress = completedNodes / totalNodes
  if (progress >= 0.67) return 'advanced'
  if (progress >= 0.34) return 'intermediate'
  return 'beginner'
}

/**
 * Get the user's acquired skills based on how many roadmap nodes they completed.
 * We take the first N skills from the pathway's skill list.
 */
export function getUserSkills(pathway: string, completedNodes: number): string[] {
  const skills = PATHWAY_SKILLS[pathway] || PATHWAY_SKILLS['full-stack']
  return skills.slice(0, completedNodes)
}

/**
 * Calculate match score between user skills and job requirements.
 *
 * Algorithm:
 * 1. Normalize both lists to lowercase for comparison
 * 2. Count how many job-required skills the user has
 * 3. Score = (matched / total required) * 100
 *
 * If the job lists no required skills, we give a baseline 50% score.
 */
export function calculateMatchScore(userSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0) return 50 // baseline when job doesn't list skills

  const userNormalized = new Set(userSkills.map(s => s.toLowerCase().trim()))
  let matched = 0

  for (const skill of jobSkills) {
    if (userNormalized.has(skill.toLowerCase().trim())) {
      matched++
    }
  }

  return Math.round((matched / jobSkills.length) * 100)
}

/**
 * Detect which skills the user is missing for a specific job.
 * Returns the gap list — skills the job requires but the user doesn't have.
 */
export function detectMissingSkills(userSkills: string[], jobSkills: string[]): string[] {
  const userNormalized = new Set(userSkills.map(s => s.toLowerCase().trim()))
  return jobSkills.filter(skill => !userNormalized.has(skill.toLowerCase().trim()))
}

/**
 * Detect which skills the user has that match the job.
 */
export function detectMatchedSkills(userSkills: string[], jobSkills: string[]): string[] {
  const userNormalized = new Set(userSkills.map(s => s.toLowerCase().trim()))
  return jobSkills.filter(skill => userNormalized.has(skill.toLowerCase().trim()))
}

/**
 * Generate intelligent, human-readable feedback based on match score and gaps.
 *
 * Feedback tiers:
 * - 90%+  → "Excellent match! You're ready to apply."
 * - 70-89 → "Strong fit — learn X to maximize your chances."
 * - 50-69 → "Promising — complete a few more skills."
 * - <50   → "Keep learning — you're building a strong foundation."
 */
export function generateFeedback(matchScore: number, missingSkills: string[]): string {
  if (matchScore >= 90) {
    return '🎯 Excellent match! You\'re ready to apply for this role.'
  }
  if (matchScore >= 70) {
    const top = missingSkills.slice(0, 2).join(' and ')
    return `💪 Strong fit! Complete ${top} to maximize your chances.`
  }
  if (matchScore >= 50) {
    return `📚 Promising match — you currently cover ${matchScore}% of this role. Keep learning!`
  }
  return `🌱 You're building a strong foundation. Complete more roadmap nodes to unlock this role.`
}

/**
 * Build the search query string for the JSearch API.
 * Falls back to a generic query if the pathway isn't mapped.
 */
export function mapPathwayToSearchQuery(pathway: string, level: ReadinessLevel): string {
  const queries = SEARCH_QUERIES[pathway]
  if (queries) return queries[level]
  return level === 'beginner' ? 'software developer intern' : level === 'intermediate' ? 'junior software developer' : 'software developer'
}

/**
 * Full matching pipeline: takes a job and user context, returns complete analysis.
 */
export function analyzeJobMatch(
  jobSkills: string[],
  userSkills: string[],
  readiness: ReadinessLevel
): MatchResult {
  const score = calculateMatchScore(userSkills, jobSkills)
  const matchedSkills = detectMatchedSkills(userSkills, jobSkills)
  const missingSkills = detectMissingSkills(userSkills, jobSkills)
  const feedback = generateFeedback(score, missingSkills)

  return { score, matchedSkills, missingSkills, feedback, readiness }
}
