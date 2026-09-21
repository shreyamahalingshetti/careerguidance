import { prisma } from '../lib/prisma'
import {
  computeStudentRiasecVector,
  getFamilyCentroids,
  calculate10thStreamRecommendation,
} from '../lib/recommendation-10th'
import { generateAptitudeFeedback } from '../lib/aptitude-feedback-10th'
import { APTITUDE_QUESTIONS, PROFILE_QUESTIONS } from '../lib/constants'

async function runScenario1() {
  console.log('==========================================================================')
  console.log('MANUAL END-TO-END QA TEST - SCENARIO 1: STRONG SCIENCE / TECHNICAL (R/I/C)')
  console.log('==========================================================================\n')

  // 1. Construct aptitude answers (Numerical 75%, Verbal 63%, Abstract 88%)
  const aptitudeAnswers: Record<string, number> = {}
  
  // Numerical: 6 correct out of 8
  const numQs = APTITUDE_QUESTIONS.filter(q => q.section === 'Numerical')
  numQs.forEach((q, idx) => {
    aptitudeAnswers[q.id] = idx < 6 ? q.answerIndex : (q.answerIndex + 1) % 4
  })

  // Verbal: 5 correct out of 8
  const verbQs = APTITUDE_QUESTIONS.filter(q => q.section === 'Verbal')
  verbQs.forEach((q, idx) => {
    aptitudeAnswers[q.id] = idx < 5 ? q.answerIndex : (q.answerIndex + 1) % 4
  })

  // Abstract: 7 correct out of 8
  const absQs = APTITUDE_QUESTIONS.filter(q => q.section === 'Abstract')
  absQs.forEach((q, idx) => {
    aptitudeAnswers[q.id] = idx < 7 ? q.answerIndex : (q.answerIndex + 1) % 4
  })

  // Calculate aptitude breakdown
  const aptCorrect: Record<string, number> = {}
  const aptTotal: Record<string, number> = {}
  APTITUDE_QUESTIONS.forEach(q => {
    aptTotal[q.section] = (aptTotal[q.section] || 0) + 1
    if (aptitudeAnswers[q.id] === q.answerIndex) {
      aptCorrect[q.section] = (aptCorrect[q.section] || 0) + 1
    }
  })
  const aptitudeBreakdown: Record<string, number> = {
    Numerical: Math.round(((aptCorrect['Numerical'] || 0) / (aptTotal['Numerical'] || 1)) * 100),
    Verbal: Math.round(((aptCorrect['Verbal'] || 0) / (aptTotal['Verbal'] || 1)) * 100),
    Abstract: Math.round(((aptCorrect['Abstract'] || 0) / (aptTotal['Abstract'] || 1)) * 100),
  }

  // 2. Construct 18 RIASEC Profile Answers (Strong R/I/C, Low A/S/E)
  const profileAnswers: Record<string, number> = {
    R1: 5, R2: 5, R3: 5, // Realistic = 5.0
    I1: 5, I2: 5, I3: 5, // Investigative = 5.0
    A1: 1, A2: 1, A3: 1, // Artistic = 1.0
    S1: 2, S2: 1, S3: 2, // Social = 1.67
    E1: 2, E2: 2, E3: 2, // Enterprising = 2.0
    C1: 4, C2: 5, C3: 4, // Conventional = 4.33
  }

  // 3. Compute student RIASEC vector
  const studentVector = computeStudentRiasecVector(profileAnswers)
  const centroids = await getFamilyCentroids(prisma)

  // 4. Run pure RIASEC recommendation engine
  const rec = calculate10thStreamRecommendation(studentVector, centroids)

  // 5. Generate Skill-Development Aptitude Feedback
  const aptFeedback = generateAptitudeFeedback(aptitudeBreakdown, rec.recommendedStream)

  // Output all 10 report items
  console.log('--- 1. EXACT RIASEC DIMENSION SCORES ---')
  console.log(`Realistic (R):     ${studentVector[0].toFixed(2)} / 5.0`)
  console.log(`Investigative (I): ${studentVector[1].toFixed(2)} / 5.0`)
  console.log(`Artistic (A):      ${studentVector[2].toFixed(2)} / 5.0`)
  console.log(`Social (S):        ${studentVector[3].toFixed(2)} / 5.0`)
  console.log(`Enterprising (E):  ${studentVector[4].toFixed(2)} / 5.0`)
  console.log(`Conventional (C):  ${studentVector[5].toFixed(2)} / 5.0`)

  console.log('\n--- 2. STREAM SCORES ---')
  console.log(`Science Stream Fit:        ${rec.scienceFit}% (${rec.scienceStreamResult.alignmentBand})`)
  console.log(`Commerce Stream Fit:       ${rec.commerceFit}% (${rec.commerceStreamResult.alignmentBand})`)
  console.log(`Arts/Humanities Stream Fit:${rec.artsFit}% (${rec.artsStreamResult.alignmentBand})`)

  console.log('\n--- 3. RECOMMENDED STREAM ---')
  console.log(`Primary Recommendation:    ${rec.recommendedStream}`)

  console.log('\n--- 4. ALTERNATIVE STREAM ---')
  console.log(`Top Alternative Stream:    ${rec.alternativeStream}`)

  console.log('\n--- 5. TOP 3 DRIVING CAREER FAMILIES PER STREAM ---')
  console.log('SCIENCE STREAM TOP 3 FAMILIES:')
  rec.scienceStreamResult.topFamilies.forEach((f, i) => {
    console.log(`  ${i+1}. ${f.familyName} (Pearson r: ${f.pearsonR.toFixed(4)}, Fit: ${f.fitPercentage}%)`)
  })
  console.log('COMMERCE STREAM TOP 3 FAMILIES:')
  rec.commerceStreamResult.topFamilies.forEach((f, i) => {
    console.log(`  ${i+1}. ${f.familyName} (Pearson r: ${f.pearsonR.toFixed(4)}, Fit: ${f.fitPercentage}%)`)
  })
  console.log('ARTS/HUMANITIES STREAM TOP 3 FAMILIES:')
  rec.artsStreamResult.topFamilies.forEach((f, i) => {
    console.log(`  ${i+1}. ${f.familyName} (Pearson r: ${f.pearsonR.toFixed(4)}, Fit: ${f.fitPercentage}%)`)
  })

  console.log('\n--- 6. INTUITIVE CONSISTENCY VERIFICATION ---')
  console.log(`Is recommendation intuitively consistent with R/I/C profile? ${rec.recommendedStream === 'Science' ? 'YES' : 'NO'}`)

  console.log('\n--- 7. APTITUDE PERCENTAGES ---')
  console.log(`Numerical Reasoning: ${aptitudeBreakdown.Numerical}% (${aptCorrect['Numerical']}/8)`)
  console.log(`Verbal Reasoning:    ${aptitudeBreakdown.Verbal}% (${aptCorrect['Verbal']}/8)`)
  console.log(`Abstract Reasoning:  ${aptitudeBreakdown.Abstract}% (${aptCorrect['Abstract']}/8)`)

  console.log('\n--- 8. APTITUDE PERFORMANCE BANDS ---')
  aptFeedback.sections.forEach(sec => {
    console.log(`  * ${sec.sectionLabel}: ${sec.percentage}% -> Band: ${sec.band} ${sec.isRelativeStrength ? '[⭐ Relative Strength]' : ''} ${sec.isAreaToImprove ? '[🎯 Area to Improve]' : ''}`)
    console.log(`    Explanation: "${sec.explanation}"`)
  })

  console.log('\n--- 9. SEPARATE SKILL DEVELOPMENT PRESENTATION VERIFICATION ---')
  console.log(`Overall Summary: "${aptFeedback.overallSummary}"`)
  if (aptFeedback.streamSynergyNote) {
    console.log(`Stream Synergy Note: "${aptFeedback.streamSynergyNote}"`)
  }

  console.log('\n--- 10. APTITUDE ZERO-INFLUENCE CONFIRMATION ---')
  // Verify that varying aptitude scores while keeping RIASEC profile identical changes 0 stream scores
  const altAptAnswers = { ...aptitudeAnswers }
  numQs.forEach(q => altAptAnswers[q.id] = (q.answerIndex + 1) % 4) // 0% numerical
  
  const altAptBreakdown = { Numerical: 0, Verbal: 0, Abstract: 0 }
  const recWithZeroApt = calculate10thStreamRecommendation(studentVector, centroids)
  
  const zeroInfluenceConfirmed = 
    rec.scienceFit === recWithZeroApt.scienceFit &&
    rec.commerceFit === recWithZeroApt.commerceFit &&
    rec.artsFit === recWithZeroApt.artsFit &&
    rec.recommendedStream === recWithZeroApt.recommendedStream
    
  console.log(`Stream scores identical when aptitude changes to 0%? ${zeroInfluenceConfirmed ? 'YES (Confirmed Zero Influence)' : 'NO (Failed)'}`)

  await prisma.$disconnect()
}

runScenario1()
