'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TrustAnalysis } from '@/lib/trust-analyzer'
import { AlertTriangle, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp, Info } from 'lucide-react'

type Props = {
  trust: TrustAnalysis
}

export default function JobTrustBadge({ trust }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isTrusted = trust.level === 'Trusted'
  const isCaution = trust.level === 'Caution'
  const isSuspicious = trust.level === 'Suspicious'

  const bgColor = isTrusted ? 'bg-green-500/10' : isCaution ? 'bg-yellow-500/10' : 'bg-red-500/10'
  const borderColor = isTrusted ? 'border-green-500/20' : isCaution ? 'border-yellow-500/20' : 'border-red-500/20'
  const textColor = isTrusted ? 'text-green-700 dark:text-green-400' : isCaution ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'
  
  const Icon = isTrusted ? ShieldCheck : isCaution ? AlertTriangle : ShieldAlert
  const label = isTrusted 
    ? `Real Job Verified (${trust.platform})` 
    : isCaution 
      ? `Potential Real Job - Verify (${trust.platform})` 
      : `Fake Job Detected (${trust.platform})`

  return (
    <div className="mt-4">
      {/* Badge Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-colors hover:bg-opacity-80 ${bgColor} ${borderColor}`}
      >
        <div className={`flex items-center gap-2 ${textColor}`}>
          <Icon size={18} />
          <span className="text-xs font-bold">{label}</span>
        </div>
        <div className={`flex items-center gap-2 ${textColor}`}>
          {/* Confidence Meter (Score) */}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 dark:bg-black/20">
            {trust.score}/100
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expandable Trust Analysis Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-3 mt-2 rounded-xl text-sm ${bgColor} ${borderColor} border`}>
              <div className="flex items-center gap-2 mb-2 text-on-surface-variant">
                <Info size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Trust Analysis</span>
              </div>
              
              {/* Confidence Meter Visual */}
              <div className="mb-3">
                <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-1.5 mb-1 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full ${isTrusted ? 'bg-green-500' : isCaution ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${trust.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
                  <span>Suspicious</span>
                  <span>Trusted</span>
                </div>
              </div>

              {/* Validation Text */}
              <div className="mb-3 p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-outline-variant/30">
                <p className="text-[11px] font-bold text-on-surface mb-1">Source Validation:</p>
                <p className="text-xs text-on-surface-variant">
                  This job listing from <strong className="text-on-surface">{trust.platform}</strong> has been analyzed. 
                  Based on our criteria, this is classified as a <strong className={trust.isFake ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>{trust.isFake ? 'Fake/Scam Job' : 'Real Job'}</strong>.
                </p>
              </div>

              {/* Warnings List */}
              {trust.warnings.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-on-surface">Indicators to review:</p>
                  <ul className="text-xs space-y-1 text-on-surface-variant list-disc pl-4">
                    {trust.warnings.map((warning, idx) => (
                      <li key={idx} className={warning.includes('Suspicious phrases') ? 'text-red-500 font-medium' : ''}>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant">
                  No suspicious indicators detected. Standard credibility checks passed.
                </p>
              )}

              <p className="text-[9px] text-on-surface-variant/70 mt-3 italic text-center">
                Note: This AI analysis provides credibility indicators to help you make safer decisions. We do not guarantee that all jobs are genuine. Always exercise caution.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
