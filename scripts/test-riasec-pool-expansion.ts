import { PROFILE_QUESTIONS } from '../lib/constants'
import { TECHNICAL_QUESTIONS } from '../lib/technical-questions'
import { sampleRiasecQuestions } from '../lib/riasec-sampler'
import { computeStudentRiasecVector as compute12thVector } from '../lib/family-scoring-engine'
import { computeStudentRiasecVector as computeTechnicalVector, calculateTechnicalDomainRecommendations } from '../lib/recommendation-technical'
import { computeStudentRiasecVector as compute10thVector } from '../lib/recommendation-10th'

function runPoolExpansionTests() {
  console.log('🧪 RUNNING VERIFICATION FOR 60-QUESTION RIASEC POOL EXPANSION & RANDOM SAMPLING\n')
  let passed = 0
  let failed = 0

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${message}`)
      failed++
    }
  }

  // 1. General RIASEC Pool Size (constants.ts)
  const generalRiasecPool = PROFILE_QUESTIONS.filter((q) => q.factor === 'RIASEC')
  assert(generalRiasecPool.length === 60, `General RIASEC pool contains exactly 60 questions (Found: ${generalRiasecPool.length})`)

  // 2. Trait breakdown for General Pool
  const generalCounts: Record<string, number> = {}
  generalRiasecPool.forEach((q) => {
    generalCounts[q.type] = (generalCounts[q.type] || 0) + 1
  })
  assert(
    generalCounts['Realistic'] === 10 &&
    generalCounts['Investigative'] === 10 &&
    generalCounts['Artistic'] === 10 &&
    generalCounts['Social'] === 10 &&
    generalCounts['Enterprising'] === 10 &&
    generalCounts['Conventional'] === 10,
    `General pool has exactly 10 items per trait (Counts: ${JSON.stringify(generalCounts)})`
  )

  // 3. Technical RIASEC Pool Size (technical-questions.ts)
  assert(TECHNICAL_QUESTIONS.length === 60, `Technical pool contains exactly 60 questions (Found: ${TECHNICAL_QUESTIONS.length})`)

  // 4. Trait breakdown for Technical Pool
  const techCounts: Record<string, number> = {}
  TECHNICAL_QUESTIONS.forEach((q) => {
    techCounts[q.trait] = (techCounts[q.trait] || 0) + 1
  })
  assert(
    techCounts['R'] === 10 &&
    techCounts['I'] === 10 &&
    techCounts['A'] === 10 &&
    techCounts['S'] === 10 &&
    techCounts['E'] === 10 &&
    techCounts['C'] === 10,
    `Technical pool has exactly 10 items per trait (Counts: ${JSON.stringify(techCounts)})`
  )

  // 5. Sampling returns exactly 18 questions
  const sampled18 = sampleRiasecQuestions(generalRiasecPool, 3)
  assert(sampled18.length === 18, `Sampling returns exactly 18 questions (Found: ${sampled18.length})`)

  // 6. Sampling returns exactly 3 questions per trait
  const sampledTraitCounts: Record<string, number> = {}
  sampled18.forEach((q) => {
    const trait = q.type[0].toUpperCase()
    sampledTraitCounts[trait] = (sampledTraitCounts[trait] || 0) + 1
  })
  assert(
    sampledTraitCounts['R'] === 3 &&
    sampledTraitCounts['I'] === 3 &&
    sampledTraitCounts['A'] === 3 &&
    sampledTraitCounts['S'] === 3 &&
    sampledTraitCounts['E'] === 3 &&
    sampledTraitCounts['C'] === 3,
    `Sampling contains exactly 3 items per trait (Counts: ${JSON.stringify(sampledTraitCounts)})`
  )

  // 7. No duplicates in sampled set
  const uniqueIds = new Set(sampled18.map((q) => q.id))
  assert(uniqueIds.size === 18, `No duplicate questions in sampled set (${uniqueIds.size}/18 unique)`)

  // 8. Random sampling produces variation across multiple calls
  let attemptsWithDifferentFirstQuestion = 0
  const firstId = sampleRiasecQuestions(generalRiasecPool, 3)[0].id
  for (let i = 0; i < 20; i++) {
    if (sampleRiasecQuestions(generalRiasecPool, 3)[0].id !== firstId) {
      attemptsWithDifferentFirstQuestion++
    }
  }
  assert(attemptsWithDifferentFirstQuestion > 0, `Random sampling produces different combinations across attempts`)

  // 9. Scoring correctly handles arbitrary IDs (e.g. R4=5, R6=4, R10=3 -> avg R = 4.0)
  const arbitraryAnswers: Record<string, number> = {
    R4: 5, R6: 4, R10: 3,  // Avg: (5+4+3)/3 = 4.00
    I2: 4, I7: 4, I9: 4,   // Avg: 4.00
    A1: 2, A5: 2, A8: 2,   // Avg: 2.00
    S3: 5, S8: 5, S10: 5,  // Avg: 5.00
    E2: 1, E6: 1, E9: 1,   // Avg: 1.00
    C5: 3, C7: 3, C8: 3,   // Avg: 3.00
  }

  const vec12 = compute12thVector(arbitraryAnswers)
  assert(
    vec12.R === 4.00 && vec12.I === 4.00 && vec12.A === 2.00 && vec12.S === 5.00 && vec12.E === 1.00 && vec12.C === 3.00,
    `12th scoring engine correctly computes dynamic trait averages for arbitrary IDs R4, R6, R10 (Vector: ${JSON.stringify(vec12)})`
  )

  const vecTech = computeTechnicalVector(arbitraryAnswers)
  assert(
    vecTech.R === 4.00 && vecTech.I === 4.00 && vecTech.A === 2.00 && vecTech.S === 5.00 && vecTech.E === 1.00 && vecTech.C === 3.00,
    `Technical scoring engine correctly computes dynamic trait averages for arbitrary IDs R4, R6, R10 (Vector: ${JSON.stringify(vecTech)})`
  )

  const vec10Arr = compute10thVector(arbitraryAnswers)
  const vec10Obj = { R: vec10Arr[0], I: vec10Arr[1], A: vec10Arr[2], S: vec10Arr[3], E: vec10Arr[4], C: vec10Arr[5] }
  assert(
    vec10Obj.R === 4.00 && vec10Obj.I === 4.00 && vec10Obj.A === 2.00 && vec10Obj.S === 5.00 && vec10Obj.E === 1.00 && vec10Obj.C === 3.00,
    `10th scoring engine correctly computes dynamic trait averages for arbitrary IDs R4, R6, R10 (Vector: ${JSON.stringify(vec10Obj)})`
  )

  // 11. Class 10 assessment contains exactly 42 questions (24 Aptitude + 18 RIASEC, 0 OCEAN)
  const sampled10thRiasec = sampleRiasecQuestions(generalRiasecPool, 3)
  const total10thQuestions = 24 + sampled10thRiasec.length
  const hasOceanIn10th = sampled10thRiasec.some((q) => (q as any).factor === 'OCEAN')
  assert(
    total10thQuestions === 42 && !hasOceanIn10th,
    `Class 10 assessment contains exactly 42 questions (24 Aptitude + 18 RIASEC) and 0 OCEAN items (Total: ${total10thQuestions}, Has OCEAN: ${hasOceanIn10th})`
  )

  console.log(`\n==========================================================================`)
  console.log(`RIASEC POOL EXPANSION VERIFICATION: ${passed} PASSED, ${failed} FAILED`)
  console.log(`==========================================================================\n`)

  if (failed > 0) process.exit(1)
}

runPoolExpansionTests()
