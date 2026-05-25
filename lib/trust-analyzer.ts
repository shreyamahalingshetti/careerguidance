/**
 * Job Trust & Safety Analyzer
 * ===========================
 * Analyzes the credibility of fetched jobs before displaying them to users.
 * Provides warning indicators for potentially suspicious opportunities.
 */

export type TrustLevel = 'Trusted' | 'Caution' | 'Suspicious';

export type TrustAnalysis = {
  score: number;
  level: TrustLevel;
  warnings: string[];
  isFake: boolean;
  platform: string;
  details: {
    hasCompany: boolean;
    hasValidLink: boolean;
    isDescriptionComplete: boolean;
    hasLocation: boolean;
    suspiciousKeywordsFound: string[];
    hasSalaryInfo: boolean;
  };
};

const SUSPICIOUS_KEYWORDS = [
  'registration fee',
  'earn instantly',
  'quick money',
  'urgent payment',
  'limited slots',
  'high salary no experience',
  'investment required',
  'pay to work',
  'guaranteed income',
  'wire transfer',
  'bank details required upfront',
];

const SALARY_KEYWORDS = [
  'salary',
  'lpa',
  'ctc',
  'pay',
  'remuneration',
  'compensation',
  '$',
  '₹',
];

/**
 * Generates a trust score and analysis for a given job.
 */
export function analyzeJobTrust(job: {
  title: string;
  company: string;
  location: string;
  applyUrl: string;
  description: string;
}): TrustAnalysis {
  let score = 100;
  const warnings: string[] = [];
  const suspiciousKeywordsFound: string[] = [];
  
  const titleLower = (job.title || '').toLowerCase();
  const descLower = (job.description || '').toLowerCase();
  const combinedText = `${titleLower} ${descLower}`;

  // 1. Check Company Availability
  const hasCompany = !!job.company && job.company.toLowerCase() !== 'unknown company' && job.company.length > 2;
  if (!hasCompany) {
    score -= 15;
    warnings.push('Missing verifiable company name');
  }

  // 2. Check Apply Link Validity
  const hasValidLink = !!job.applyUrl && (job.applyUrl.startsWith('http://') || job.applyUrl.startsWith('https://')) && job.applyUrl !== '#';
  if (!hasValidLink) {
    score -= 20;
    warnings.push('Missing or invalid application link');
  }

  // 3. Check Description Completeness
  const isDescriptionComplete = !!job.description && job.description.length > 100;
  if (!isDescriptionComplete) {
    score -= 10;
    warnings.push('Job description is unusually short or missing');
  }

  // 4. Check Location Availability
  const hasLocation = !!job.location && job.location.toLowerCase() !== 'unknown';
  if (!hasLocation) {
    score -= 5;
    warnings.push('Missing location information');
  }

  // 5. Suspicious Keyword Detection
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      suspiciousKeywordsFound.push(keyword);
      score -= 25; // Heavy penalty for suspicious keywords
    }
  }
  
  if (suspiciousKeywordsFound.length > 0) {
    warnings.push(`Suspicious phrases detected: "${suspiciousKeywordsFound.join('", "')}"`);
  }

  // 6. Check for Salary Info (Bonus / Good Practice, lack of it isn't necessarily bad, but presence is good)
  let hasSalaryInfo = false;
  for (const keyword of SALARY_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      hasSalaryInfo = true;
      break;
    }
  }
  // We don't penalize for missing salary as it's common, but we track it.

  // 7. Generic formatting checks (e.g., all caps description which is often spammy)
  if (job.description && job.description === job.description.toUpperCase() && job.description.length > 50) {
    score -= 10;
    warnings.push('Unprofessional formatting detected (all caps)');
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  // Determine Level
  let level: TrustLevel = 'Trusted';
  if (score < 60) {
    level = 'Suspicious';
  } else if (score < 85) {
    level = 'Caution';
  }

  // Determine Platform
  let platform = 'Unknown Web Source';
  const urlLower = (job.applyUrl || '').toLowerCase();
  if (urlLower.includes('linkedin.com')) platform = 'LinkedIn';
  else if (urlLower.includes('internshala.com')) platform = 'Internshala';
  else if (urlLower.includes('naukri.com')) platform = 'Naukri';
  else if (urlLower.includes('indeed.com')) platform = 'Indeed';
  else if (urlLower.includes('glassdoor.com')) platform = 'Glassdoor';
  else if (urlLower.includes('wellfound.com') || urlLower.includes('angel.co')) platform = 'Wellfound';
  else if (urlLower.includes('hirist.com')) platform = 'Hirist';
  else if (urlLower.includes('foundit.in') || urlLower.includes('monster.com')) platform = 'Foundit';

  const isFake = level === 'Suspicious';

  return {
    score,
    level,
    warnings,
    isFake,
    platform,
    details: {
      hasCompany,
      hasValidLink,
      isDescriptionComplete,
      hasLocation,
      suspiciousKeywordsFound,
      hasSalaryInfo,
    }
  };
}
