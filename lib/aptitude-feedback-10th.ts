export type AptitudeBandLabel = 'Strong' | 'Good' | 'Developing' | 'Needs Practice'

export interface AptitudeSectionFeedback {
  section: 'Numerical' | 'Verbal' | 'Abstract'
  sectionLabel: string
  percentage: number
  band: AptitudeBandLabel
  bandColorClass: string
  isRelativeStrength: boolean
  isAreaToImprove: boolean
  explanation: string
  improvementTips: string[]
}

export interface AptitudeOverallFeedback {
  sections: AptitudeSectionFeedback[]
  isBalanced: boolean
  overallSummary: string
  streamSynergyNote?: string
}

/**
 * Maps section score percentage to standard performance band.
 * 80-100 -> Strong
 * 60-79  -> Good
 * 40-59  -> Developing
 * 0-39   -> Needs Practice
 */
export function getAptitudeBand(percentage: number): AptitudeBandLabel {
  if (percentage >= 80) return 'Strong'
  if (percentage >= 60) return 'Good'
  if (percentage >= 40) return 'Developing'
  return 'Needs Practice'
}

export function getAptitudeBandColor(band: AptitudeBandLabel): string {
  switch (band) {
    case 'Strong':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
    case 'Good':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
    case 'Developing':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
    case 'Needs Practice':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300'
  }
}

/**
 * Generates structured, encouraging, non-causal Skill-Development feedback for Class 10 aptitude.
 */
export function generateAptitudeFeedback(
  aptitudeBreakdown: Record<string, number>,
  recommendedStream?: string
): AptitudeOverallFeedback {
  const num = aptitudeBreakdown['Numerical'] ?? 0
  const verb = aptitudeBreakdown['Verbal'] ?? 0
  const abs = aptitudeBreakdown['Abstract'] ?? aptitudeBreakdown['Abstract Reasoning'] ?? 0

  const maxPct = Math.max(num, verb, abs)
  const minPct = Math.min(num, verb, abs)
  const isBalanced = maxPct - minPct <= 5

  const rawSections: Array<{ section: 'Numerical' | 'Verbal' | 'Abstract'; label: string; pct: number }> = [
    { section: 'Numerical', label: 'Numerical Reasoning', pct: num },
    { section: 'Verbal', label: 'Verbal Reasoning', pct: verb },
    { section: 'Abstract', label: 'Abstract Reasoning', pct: abs },
  ]

  const sections: AptitudeSectionFeedback[] = rawSections.map(({ section, label, pct }) => {
    const band = getAptitudeBand(pct)
    const bandColorClass = getAptitudeBandColor(band)
    const isRelativeStrength = !isBalanced && pct === maxPct
    const isAreaToImprove = !isBalanced && pct === minPct

    let explanation = ''
    let improvementTips: string[] = []

    if (section === 'Numerical') {
      if (band === 'Strong') {
        explanation = 'Numerical reasoning is currently one of your stronger performance areas in this assessment.'
      } else if (band === 'Good') {
        explanation = 'You demonstrated a good foundation in numerical reasoning. Continued practice with quantitative problem solving can strengthen this area.'
      } else if (band === 'Developing') {
        explanation = 'You have a developing foundation in numerical reasoning. More practice with quantitative problem solving will help strengthen this skill.'
      } else {
        explanation = 'Numerical problem solving is an area where focused practice on arithmetic, ratios, and percentages can build speed and confidence over time.'
      }
      improvementTips = [
        'Practice quantitative problem solving including percentages, ratios, and arithmetic series.',
        'Solve short daily quantitative reasoning exercises to build calculation speed and accuracy.',
      ]
    } else if (section === 'Verbal') {
      if (band === 'Strong') {
        explanation = 'Verbal reasoning is currently one of your stronger performance areas in this assessment.'
      } else if (band === 'Good') {
        explanation = 'You showed a solid grasp of verbal relationships, vocabulary, and analogies.'
      } else if (band === 'Developing') {
        explanation = 'Verbal reasoning is in a developing stage. Expanding reading habits and vocabulary practice will help strengthen this skill.'
      } else {
        explanation = 'Verbal reasoning can be built steadily through daily reading, vocabulary exercises, and word analogies.'
      }
      improvementTips = [
        'Read diverse articles and practice identifying word relationships, synonyms, and antonyms.',
        'Build vocabulary and reading comprehension through regular reading practice.',
      ]
    } else {
      // Abstract
      if (band === 'Strong') {
        explanation = 'Abstract reasoning is currently one of your stronger performance areas in this assessment.'
      } else if (band === 'Good') {
        explanation = 'You showed good visual pattern recognition and logical sequence identification.'
      } else if (band === 'Developing') {
        explanation = 'Practice with patterns, sequences, and visual reasoning can help strengthen this skill.'
      } else {
        explanation = 'Abstract and diagrammatic reasoning can be improved steadily with regular practice on visual puzzles and shape sequences.'
      }
      improvementTips = [
        'Practice visual pattern puzzles, sequence completion, and spatial rotation problems.',
        'Work through diagrammatic reasoning exercises to improve visual pattern recognition.',
      ]
    }

    return {
      section,
      sectionLabel: label,
      percentage: pct,
      band,
      bandColorClass,
      isRelativeStrength,
      isAreaToImprove,
      explanation,
      improvementTips,
    }
  })

  let overallSummary = ''
  if (isBalanced) {
    overallSummary = 'Your three aptitude areas are relatively balanced.'
  } else {
    const strength = sections.find((s) => s.isRelativeStrength)
    const weakness = sections.find((s) => s.isAreaToImprove)
    const strengthText = strength ? `${strength.sectionLabel} is currently a relative strength` : ''
    const weaknessText = weakness ? `${weakness.sectionLabel} is an area you can focus on strengthening` : ''

    if (strengthText && weaknessText) {
      overallSummary = `${strengthText}, while ${weaknessText.toLowerCase()}.`
    } else if (strengthText) {
      overallSummary = `${strengthText}.`
    } else {
      overallSummary = 'Focus on balanced practice across quantitative, verbal, and visual reasoning.'
    }
  }

  let streamSynergyNote: string | undefined = undefined
  if (recommendedStream) {
    const recLower = recommendedStream.toLowerCase()
    const numSection = sections.find((s) => s.section === 'Numerical')
    const verbSection = sections.find((s) => s.section === 'Verbal')

    if (recLower.includes('science') && numSection && numSection.percentage < 60) {
      streamSynergyNote = 'Science is strongly aligned with your vocational interests. Numerical reasoning is an area you can strengthen to feel more prepared for the academic demands of the stream.'
    } else if (recLower.includes('commerce') && numSection && numSection.percentage < 60) {
      streamSynergyNote = 'Commerce is strongly aligned with your vocational interests. Strengthening your quantitative problem solving will give you extra confidence in financial and business subjects.'
    } else if ((recLower.includes('arts') || recLower.includes('humanities')) && verbSection && verbSection.percentage < 60) {
      streamSynergyNote = 'Arts/Humanities is strongly aligned with your vocational interests. Building your verbal reasoning will help you excel in reading, writing, and analytical coursework.'
    }
  }

  return {
    sections,
    isBalanced,
    overallSummary,
    streamSynergyNote,
  }
}
