import { calculatePearsonScore } from '@/lib/pearson-engine'
import { TECHNICAL_QUESTIONS } from '@/lib/technical-questions'

export interface TechnicalDomainDefinition {
  key: 'fullstack' | 'datascience' | 'cybersecurity' | 'devops' | 'uiux' | 'hardware'
  name: string
  description: string
  vector: number[] // [R, I, A, S, E, C]
  careers: string[]
  skills: string[]
}

export const TECHNICAL_DOMAINS: TechnicalDomainDefinition[] = [
  {
    key: 'fullstack',
    name: 'Software Engineering & Full Stack',
    description: 'Application development, front-end & back-end web systems, software architecture, and APIs.',
    vector: [3.30, 5.53, 2.75, 2.02, 2.42, 5.33], // O*NET Software & Web Developers (15-1252.00, 15-1254.00)
    careers: [
      'Full-Stack Developer',
      'Backend Engineer',
      'Frontend Developer',
      'Software Architect',
      'Mobile App Developer',
      'DevOps Automation Engineer',
    ],
    skills: [
      'JavaScript, TypeScript',
      'React, Next.js, Node.js',
      'REST APIs & GraphQL',
      'SQL & NoSQL Databases',
      'Git & CI/CD Pipelines',
      'Software Design Patterns',
    ],
  },
  {
    key: 'datascience',
    name: 'Data Science & AI/ML',
    description: 'Machine learning, artificial intelligence, statistical modeling, data analytics, and big data.',
    vector: [2.95, 6.65, 2.16, 2.30, 2.89, 4.95], // O*NET Data Scientists & Statisticians (15-2051.00, 15-2041.00)
    careers: [
      'Data Scientist',
      'Machine Learning Engineer',
      'AI Research Engineer',
      'Data Analyst',
      'Quantitative Analyst',
      'Business Intelligence Engineer',
    ],
    skills: [
      'Python, R Programming',
      'Scikit-Learn, TensorFlow, PyTorch',
      'Data Visualization (Matplotlib, Seaborn)',
      'Statistical Analysis & Linear Algebra',
      'SQL & Big Data Tools (Spark)',
      'Model Evaluation & Tuning',
    ],
  },
  {
    key: 'cybersecurity',
    name: 'Cybersecurity & InfoSec',
    description: 'Network defense, ethical hacking, information security, risk auditing, and cryptography.',
    vector: [3.90, 5.20, 1.50, 2.10, 2.80, 5.80], // O*NET Information Security Analysts (15-1212.00)
    careers: [
      'Cybersecurity Analyst',
      'Ethical Hacker / Pen Tester',
      'Security Engineer',
      'Information Security Manager',
      'Incident Response Specialist',
      'Security Compliance Auditor',
    ],
    skills: [
      'Network Security & Protocols',
      'Ethical Hacking Tools (Wireshark, Metasploit)',
      'Cryptography & IAM',
      'Vulnerability Assessment',
      'Security Auditing & Compliance',
      'OS Hardening (Linux/Windows)',
    ],
  },
  {
    key: 'devops',
    name: 'Cloud Systems & DevOps',
    description: 'Cloud infrastructure architecture, automated deployment pipelines, virtualization, and reliability engineering.',
    vector: [4.04, 5.28, 2.25, 2.17, 3.20, 5.06], // O*NET Computer Network Architects (15-1241.00)
    careers: [
      'DevOps Engineer',
      'Cloud Solutions Architect',
      'Site Reliability Engineer (SRE)',
      'Infrastructure Engineer',
      'Cloud Operations Specialist',
      'Systems Administrator',
    ],
    skills: [
      'Docker & Kubernetes',
      'AWS / GCP / Azure Cloud Services',
      'Infrastructure as Code (Terraform)',
      'Linux Administration & Bash',
      'CI/CD Tools (GitHub Actions)',
      'Monitoring & Alerting (Prometheus, Grafana)',
    ],
  },
  {
    key: 'uiux',
    name: 'UI/UX & Web Interface Engineering',
    description: 'User interface design, digital interaction, front-end styling, usability testing, and web aesthetics.',
    vector: [2.59, 4.88, 4.48, 2.20, 3.13, 4.73], // O*NET Web & Digital Interface Designers (15-1255.00)
    careers: [
      'UI/UX Designer',
      'Front-End Web Engineer',
      'Product Designer',
      'Design System Engineer',
      'UX Researcher',
      'Interactive Media Developer',
    ],
    skills: [
      'Figma & Adobe XD',
      'HTML5, CSS3, Tailwind CSS',
      'Component Libraries & Storybook',
      'User Research & Wireframing',
      'Responsive Web Design',
      'Usability Testing & Accessibility (a11y)',
    ],
  },
  {
    key: 'hardware',
    name: 'Hardware & Embedded Systems',
    description: 'Embedded system programming, circuit design, Internet of Things (IoT), robotics, and microcontroller hardware.',
    vector: [5.35, 5.62, 2.10, 1.90, 2.50, 4.40], // O*NET Electrical & Robotics Engineers (17-2071.00, 17-2199.08)
    careers: [
      'Embedded Systems Engineer',
      'IoT Developer',
      'Hardware Engineer',
      'Robotics Engineer',
      'Firmware Developer',
      'Microcontroller Systems Architect',
    ],
    skills: [
      'C / C++ Embedded Programming',
      'Microcontrollers (Arduino, STM32, ESP32)',
      'Circuit Design & PCB Layout',
      'Real-Time Operating Systems (RTOS)',
      'Hardware Troubleshooting & Oscilloscopes',
      'Sensors & Communication Protocols (I2C, SPI, UART)',
    ],
  },
]

export interface TechnicalDomainMatch {
  key: string
  name: string
  description: string
  pearsonR: number
  fitPercentage: number
  alignmentBand: 'Strong Alignment' | 'Moderate Alignment' | 'Low Alignment'
  careers: string[]
  skills: string[]
}

export interface TechnicalRecommendationOutput {
  recommendedDomain: string
  recommendedDomainKey: string
  alternativeDomain: string
  alternativeDomainKey: string
  fitPercentages: Record<string, number>
  pearsonScores: Record<string, number>
  rankedDomains: TechnicalDomainMatch[]
  studentRiasecVector: {
    R: number
    I: number
    A: number
    S: number
    E: number
    C: number
  }
  isFlatProfile: boolean
  guidanceNotes: string[]
}

/**
 * Calculates alignment band from fit percentage.
 */
export function getTechnicalAlignmentBand(fitPercentage: number): 'Strong Alignment' | 'Moderate Alignment' | 'Low Alignment' {
  if (fitPercentage >= 75.0) return 'Strong Alignment'
  if (fitPercentage >= 50.0) return 'Moderate Alignment'
  return 'Low Alignment'
}

/**
 * Converts Pearson correlation coefficient r in [-1, 1] to normalized fit percentage in [0, 100].
 */
export function pearsonToFitPercentage(r: number): number {
  const clampedR = Math.max(-1.0, Math.min(1.0, r))
  const rawFit = ((clampedR + 1) / 2) * 100
  const clampedFit = Math.max(0, Math.min(100, rawFit))
  return parseFloat(clampedFit.toFixed(1))
}

/**
 * Computes 6D student RIASEC vector from 18 answers (R1..R3, I1..I3, A1..A3, S1..S3, E1..E3, C1..C3).
 */
export function computeStudentRiasecVector(
  profileAnswers: Record<string, number | null | undefined>
): { R: number; I: number; A: number; S: number; E: number; C: number } {
  const sums: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const counts: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  for (const [qId, val] of Object.entries(profileAnswers)) {
    if (val === null || val === undefined) continue
    const traitPrefix = qId[0]?.toUpperCase()
    if (['R', 'I', 'A', 'S', 'E', 'C'].includes(traitPrefix)) {
      sums[traitPrefix] += val
      counts[traitPrefix] += 1
    }
  }

  const getTraitAvg = (t: string): number => {
    const c = counts[t]
    if (!c || c === 0) return 3.0
    return parseFloat((sums[t] / c).toFixed(2))
  }

  return {
    R: getTraitAvg('R'),
    I: getTraitAvg('I'),
    A: getTraitAvg('A'),
    S: getTraitAvg('S'),
    E: getTraitAvg('E'),
    C: getTraitAvg('C'),
  }
}

/**
 * Core Technical Domain Pearson Matching Recommendation Engine.
 */
export function calculateTechnicalDomainRecommendations(
  input: { R: number; I: number; A: number; S: number; E: number; C: number } | Record<string, number | null | undefined>
): TechnicalRecommendationOutput {
  const riasec = 'R' in input && typeof input.R === 'number'
    ? (input as { R: number; I: number; A: number; S: number; E: number; C: number })
    : computeStudentRiasecVector(input as Record<string, number | null | undefined>)

  const studentVector = [riasec.R, riasec.I, riasec.A, riasec.S, riasec.E, riasec.C]

  // Check flat profile (zero variance in student vector)
  const meanVal = studentVector.reduce((sum, v) => sum + v, 0) / 6
  const variance = studentVector.reduce((sum, v) => sum + Math.pow(v - meanVal, 2), 0) / 6
  const isFlatProfile = variance === 0

  const fitPercentages: Record<string, number> = {}
  const pearsonScores: Record<string, number> = {}

  const rankedDomains: TechnicalDomainMatch[] = TECHNICAL_DOMAINS.map((domain) => {
    const pResult = calculatePearsonScore(studentVector, domain.vector)
    const fitPercentage = isFlatProfile ? 50.0 : pearsonToFitPercentage(pResult.r)
    const alignmentBand = getTechnicalAlignmentBand(fitPercentage)

    fitPercentages[domain.key] = fitPercentage
    pearsonScores[domain.key] = pResult.r

    return {
      key: domain.key,
      name: domain.name,
      description: domain.description,
      pearsonR: pResult.r,
      fitPercentage,
      alignmentBand,
      careers: domain.careers,
      skills: domain.skills,
    }
  }).sort((a, b) => b.fitPercentage - a.fitPercentage)

  const topChoice = rankedDomains[0]
  const secondChoice = rankedDomains[1]

  const guidanceNotes: string[] = []

  if (isFlatProfile) {
    guidanceNotes.push(
      'Flat Interest Profile: Your interest scores were equal across all six RIASEC dimensions. All technical domains present a 50% baseline fit. Explore projects actively to discover your unique technical preferences.'
    )
  }

  const scoreDiff = parseFloat((topChoice.fitPercentage - secondChoice.fitPercentage).toFixed(1))
  if (scoreDiff <= 5.0 && !isFlatProfile) {
    guidanceNotes.push(
      `Close Match / Strong Overlap: Your top two technical specializations (${topChoice.name} at ${topChoice.fitPercentage}% and ${secondChoice.name} at ${secondChoice.fitPercentage}%) differ by only ${scoreDiff} percentage points, showing versatile potential across both areas.`
    )
  }

  return {
    recommendedDomain: topChoice.name,
    recommendedDomainKey: topChoice.key,
    alternativeDomain: secondChoice.name,
    alternativeDomainKey: secondChoice.key,
    fitPercentages,
    pearsonScores,
    rankedDomains,
    studentRiasecVector: riasec,
    isFlatProfile,
    guidanceNotes,
  }
}
