/**
 * JobCard Component
 * =================
 * Renders a single job recommendation with:
 * - Match percentage ring
 * - Skill chips (green = matched, red = missing)
 * - Readiness feedback
 * - Apply button
 * - Framer Motion entrance animation
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { MatchResult } from '@/lib/skill-matcher'
import type { TrustAnalysis } from '@/lib/trust-analyzer'
import JobTrustBadge from './JobTrustBadge'
import { generatePreparationGuidance } from '@/lib/preparation-analyzer'

type Job = {
  id: string
  title: string
  company: string
  location: string
  employmentType: string
  applyUrl: string
  requiredSkills: string[]
  datePosted: string
  description: string
  trustAnalysis?: TrustAnalysis
}

type Props = {
  job: Job
  match: MatchResult
  index: number
  isSelected: boolean
  onSelect: (jobId: string) => void
}

/**
 * Returns a color based on the match score.
 * Green for high match, yellow for moderate, red for low.
 */
function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e' // green
  if (score >= 40) return '#eab308' // yellow
  return '#ef4444' // red
}

/**
 * Maps employment type codes to human-readable badges.
 */
function formatEmploymentType(type: string): string {
  const map: Record<string, string> = {
    'FULLTIME': 'Full-Time',
    'PARTTIME': 'Part-Time',
    'INTERN': 'Internship',
    'CONTRACTOR': 'Contract',
  }
  return map[type] || type
}

export default function JobCard({ job, match, index, isSelected, onSelect }: Props) {
  const [isPrepOpen, setIsPrepOpen] = useState(false)
  const scoreColor = getScoreColor(match.score)
  const circumference = 2 * Math.PI * 36 // radius 36
  const offset = circumference - (match.score / 100) * circumference
  const prepGuidance = generatePreparationGuidance(job.title, job.company, match.missingSkills)

  let platform = job.trustAnalysis?.platform;
  if (!platform) {
    const urlLower = (job.applyUrl || '').toLowerCase();
    if (urlLower.includes('linkedin.com')) platform = 'LinkedIn';
    else if (urlLower.includes('internshala.com')) platform = 'Internshala';
    else if (urlLower.includes('naukri.com')) platform = 'Naukri';
    else if (urlLower.includes('indeed.com')) platform = 'Indeed';
    else if (urlLower.includes('glassdoor.com')) platform = 'Glassdoor';
    else if (urlLower.includes('wellfound.com') || urlLower.includes('angel.co')) platform = 'Wellfound';
    else if (urlLower.includes('hirist.com')) platform = 'Hirist';
    else if (urlLower.includes('foundit.in') || urlLower.includes('monster.com')) platform = 'Foundit';
    else platform = 'Unknown Web Source';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      onClick={() => onSelect(job.id)}
      className={`
        relative overflow-hidden rounded-3xl border cursor-pointer
        transition-all duration-300 hover:scale-[1.02]
        ${isSelected
          ? 'border-primary bg-surface shadow-lg shadow-primary/10'
          : 'border-outline-variant/30 bg-surface hover:border-outline-variant hover:shadow-sm'
        }
      `}
    >
      {/* Gradient accent strip at top */}
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}88, transparent)`,
        }}
      />

      <div className="p-5">
        {/* Header: Company initials + title */}
        <div className="flex items-start gap-4">
          {/* Company initial avatar */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: `linear-gradient(135deg, ${scoreColor}cc, ${scoreColor}66)` }}
          >
            {job.company.charAt(0).toUpperCase()}
          </div>

          {/* Title + company + badges */}
          <div className="flex-1 min-w-0">
            <h3 className="text-on-surface font-extrabold text-base leading-tight truncate">
              {job.title}
            </h3>
            <p className="text-on-surface-variant font-medium text-sm mt-0.5 truncate">{job.company}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                📍 {job.location}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                {formatEmploymentType(job.employmentType)}
              </span>
              {job.trustAnalysis && (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  (job.trustAnalysis.isFake ?? (job.trustAnalysis.level === 'Suspicious'))
                    ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' 
                    : 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                }`}>
                  {(job.trustAnalysis.isFake ?? (job.trustAnalysis.level === 'Suspicious')) ? '🚨 Fake/Scam Job' : '✅ Real Job'} 
                  {' '}from {platform}
                </span>
              )}
            </div>
          </div>

          {/* Match score ring */}
          <div className="flex-shrink-0 relative w-20 h-20">
            <svg width="80" height="80" viewBox="0 0 80 80">
              {/* Background circle */}
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" className="text-outline-variant/30" strokeWidth="6" />
              {/* Progress circle */}
              <circle
                cx="40" cy="40" r="36"
                fill="none"
                stroke={scoreColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black" style={{ color: scoreColor }}>{match.score}%</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">match</span>
            </div>
          </div>
        </div>

        {/* Description preview */}
        {job.description && (
          <p className="text-on-surface-variant text-xs mt-4 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}

        {/* Skill chips */}
        <div className="mt-5">
          <p className="text-[11px] text-on-surface-variant/70 uppercase tracking-wider mb-2 font-black">Skills Overview</p>
          <div className="flex flex-wrap gap-1.5">
            {match.matchedSkills.map(skill => (
              <span
                key={skill}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
              >
                ✓ {skill}
              </span>
            ))}
            {match.missingSkills.slice(0, 4).map(skill => (
              <span
                key={skill}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
              >
                ✗ {skill}
              </span>
            ))}
            {match.missingSkills.length > 4 && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                +{match.missingSkills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Feedback message */}
        <p className="text-sm mt-4 text-on-surface-variant italic">
          &ldquo;{match.feedback}&rdquo;
        </p>

        {/* Trust Badge */}
        {job.trustAnalysis && (
          <JobTrustBadge trust={job.trustAnalysis} />
        )}

        {/* Preparation Guidance Accordion */}
        <div className="mt-4 border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPrepOpen(!isPrepOpen);
            }}
            className="w-full flex items-center justify-between p-3 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              Preparation Guidance
            </div>
            <motion.div animate={{ rotate: isPrepOpen ? 180 : 0 }}>▼</motion.div>
          </button>
          
          <AnimatePresence>
            {isPrepOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4 text-sm border-t border-outline-variant/20 bg-surface-container-lowest/50 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pt-3 space-y-4">
                  {/* Skill Warnings */}
                  {prepGuidance.skillWarnings.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="font-bold text-red-700 dark:text-red-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Weak Areas to Improve
                      </p>
                      <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-300 space-y-1">
                        {prepGuidance.skillWarnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Company Insights */}
                  {prepGuidance.companyInsights && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="font-bold text-blue-700 dark:text-blue-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                        🏢 {job.company} Focus Areas
                      </p>
                      <ul className="list-disc list-inside text-xs text-blue-600 dark:text-blue-300 space-y-1">
                        {prepGuidance.companyInsights.focusAreas.map((area, i) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preparation Rounds */}
                  <div className="space-y-3">
                    {prepGuidance.rounds.map((round, idx) => (
                      <div key={idx}>
                        <p className="font-bold text-on-surface text-xs mb-1.5 flex items-center gap-1.5">
                          <span>{round.icon}</span> {round.name}
                        </p>
                        <ul className="text-xs text-on-surface-variant space-y-1.5 ml-1">
                          {round.topics.map((topic, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-outline-variant/60"></span>
                                {topic.name}
                              </span>
                              {topic.url && topic.action && (
                                <a 
                                  href={topic.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 ml-2 border border-primary/10"
                                >
                                  [{topic.action}]
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-on-surface-variant/60 italic text-center border-t border-outline-variant/20 pt-3 mt-4">
                    * Commonly expected preparation areas for similar roles.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Apply button */}
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="
            mt-5 w-full block text-center text-sm font-bold py-3 rounded-xl
            bg-primary text-white hover:bg-primary-dim
            transition-all duration-200 shadow-sm
          "
        >
          Apply Now →
        </a>
      </div>
    </motion.div>
  )
}
