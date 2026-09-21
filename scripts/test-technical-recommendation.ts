import { TECHNICAL_QUESTIONS } from '../lib/technical-questions'
import {
  TECHNICAL_DOMAINS,
  computeStudentRiasecVector,
  calculateTechnicalDomainRecommendations,
  pearsonToFitPercentage,
} from '../lib/recommendation-technical'
import { calculatePearsonScore } from '../lib/pearson-engine'

async function runTechnicalTests() {
  console.log('🧪 Running Technical Assessment Pearson Recommendation Engine Test Suite...\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${testName}`)
      failed++
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST A: Pool contains exactly 60 questions
    // -------------------------------------------------------------------------
    assert(TECHNICAL_QUESTIONS.length === 60, `A. Pool contains exactly 60 questions (Found: ${TECHNICAL_QUESTIONS.length})`)

    // -------------------------------------------------------------------------
    // TEST B: Exactly 10 questions per RIASEC trait in pool
    // -------------------------------------------------------------------------
    const traits = ['R', 'I', 'A', 'S', 'E', 'C'] as const
    const traitCounts = traits.map((t) => TECHNICAL_QUESTIONS.filter((q) => q.trait === t).length)
    const exact10PerTrait = traitCounts.every((count) => count === 10)
    assert(
      exact10PerTrait,
      `B. Exactly 10 questions per RIASEC trait in pool (Counts: ${traits.map((t, idx) => `${t}:${traitCounts[idx]}`).join(', ')})`
    )

    // -------------------------------------------------------------------------
    // TEST C: All six dimensions are present
    // -------------------------------------------------------------------------
    const presentTraits = new Set(TECHNICAL_QUESTIONS.map((q) => q.trait))
    assert(presentTraits.size === 6, `C. All 6 RIASEC dimensions present (${Array.from(presentTraits).join(', ')})`)

    // -------------------------------------------------------------------------
    // TEST D: Student vector averages are calculated correctly
    // -------------------------------------------------------------------------
    const mockAnswers: Record<string, number> = {
      R1: 5, R2: 5, R3: 5, // R = 5.0
      I1: 4, I2: 4, I3: 4, // I = 4.0
      A1: 1, A2: 1, A3: 1, // A = 1.0
      S1: 2, S2: 2, S3: 2, // S = 2.0
      E1: 3, E2: 3, E3: 3, // E = 3.0
      C1: 4, C2: 4, C3: 4, // C = 4.0
    }
    const studentVec = computeStudentRiasecVector(mockAnswers)
    assert(
      studentVec.R === 5.0 &&
        studentVec.I === 4.0 &&
        studentVec.A === 1.0 &&
        studentVec.S === 2.0 &&
        studentVec.E === 3.0 &&
        studentVec.C === 4.0,
      `D. Student RIASEC vector averages computed correctly (${JSON.stringify(studentVec)})`
    )

    // -------------------------------------------------------------------------
    // TEST E: Pearson identical vector = +1
    // -------------------------------------------------------------------------
    const vecA = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]
    const resE = calculatePearsonScore(vecA, vecA)
    assert(resE.r === 1.0 && resE.matchScore === 100, `E. Pearson identical vector = +1 (r = ${resE.r})`)

    // -------------------------------------------------------------------------
    // TEST F: Pearson inverse vector = -1
    // -------------------------------------------------------------------------
    const vecInverse = [6.0, 5.0, 4.0, 3.0, 2.0, 1.0]
    const resF = calculatePearsonScore(vecA, vecInverse)
    assert(resF.r === -1.0 && resF.matchScore === 0, `F. Pearson inverse vector = -1 (r = ${resF.r})`)

    // -------------------------------------------------------------------------
    // TEST G: Zero-variance student profile handled safely (r=0 / 50% fit)
    // -------------------------------------------------------------------------
    const flatAnswers: Record<string, number> = {
      R1: 3, R2: 3, R3: 3,
      I1: 3, I2: 3, I3: 3,
      A1: 3, A2: 3, A3: 3,
      S1: 3, S2: 3, S3: 3,
      E1: 3, E2: 3, E3: 3,
      C1: 3, C2: 3, C3: 3,
    }
    const recFlat = calculateTechnicalDomainRecommendations(flatAnswers)
    const all50 = Object.values(recFlat.fitPercentages).every((fit) => fit === 50.0)
    assert(
      recFlat.isFlatProfile && all50,
      `G. Zero-variance student profile yields 50.0% fit across all domains (Flat flag: ${recFlat.isFlatProfile})`
    )

    // -------------------------------------------------------------------------
    // TEST H: All six technical domains are available
    // -------------------------------------------------------------------------
    const domainKeys = TECHNICAL_DOMAINS.map((d) => d.key)
    const expectedKeys = ['fullstack', 'datascience', 'cybersecurity', 'devops', 'uiux', 'hardware']
    const all6Domains = expectedKeys.every((k) => domainKeys.includes(k as any))
    assert(
      TECHNICAL_DOMAINS.length === 6 && all6Domains,
      `H. All 6 minimal technical domains available (${domainKeys.join(', ')})`
    )

    // -------------------------------------------------------------------------
    // TEST I: Ranking is descending by fit
    // -------------------------------------------------------------------------
    const recI = calculateTechnicalDomainRecommendations({
      R1: 5, R2: 5, R3: 5,
      I1: 4, I2: 4, I3: 4,
      A1: 1, A2: 1, A3: 1,
      S1: 1, S2: 1, S3: 1,
      E1: 2, E2: 2, E3: 2,
      C1: 4, C2: 4, C3: 4,
    })
    let isDescending = true
    for (let idx = 0; idx < recI.rankedDomains.length - 1; idx++) {
      if (recI.rankedDomains[idx].fitPercentage < recI.rankedDomains[idx + 1].fitPercentage) {
        isDescending = false
        break
      }
    }
    assert(isDescending, `I. Domain ranking is strictly descending by fit percentage`)

    // -------------------------------------------------------------------------
    // TEST J: Fit percentage conversion is correct
    // -------------------------------------------------------------------------
    const fitPlusOne = pearsonToFitPercentage(1.0)
    const fitZero = pearsonToFitPercentage(0.0)
    const fitMinusOne = pearsonToFitPercentage(-1.0)
    assert(
      fitPlusOne === 100.0 && fitZero === 50.0 && fitMinusOne === 0.0,
      `J. Fit percentage conversion correct (r=+1 -> ${fitPlusOne}%, r=0 -> ${fitZero}%, r=-1 -> ${fitMinusOne}%)`
    )

    // -------------------------------------------------------------------------
    // TEST K: Strongly Investigative / Conventional profile recommends Data Science / Cybersecurity
    // -------------------------------------------------------------------------
    const highICAnswers: Record<string, number> = {
      R1: 2, R2: 2, R3: 2, // Low R
      I1: 5, I2: 5, I3: 5, // High I
      A1: 1, A2: 1, A3: 1, // Low A
      S1: 1, S2: 1, S3: 1, // Low S
      E1: 2, E2: 2, E3: 2, // Low E
      C1: 5, C2: 5, C3: 5, // High C
    }
    const recK = calculateTechnicalDomainRecommendations(highICAnswers)
    const topKeyK = recK.recommendedDomainKey
    assert(
      topKeyK === 'datascience' || topKeyK === 'cybersecurity' || topKeyK === 'fullstack',
      `K. High I/C profile recommends analytical/security domains (Top: ${recK.recommendedDomain} [${topKeyK}])`
    )

    // -------------------------------------------------------------------------
    // TEST L: Strongly Realistic / Investigative profile recommends Hardware
    // -------------------------------------------------------------------------
    const highRIAnswers: Record<string, number> = {
      R1: 5, R2: 5, R3: 5, // High R
      I1: 5, I2: 5, I3: 5, // High I
      A1: 1, A2: 1, A3: 1, // Low A
      S1: 1, S2: 1, S3: 1, // Low S
      E1: 1, E2: 1, E3: 1, // Low E
      C1: 3, C2: 3, C3: 3, // Mid C
    }
    const recL = calculateTechnicalDomainRecommendations(highRIAnswers)
    assert(
      recL.recommendedDomainKey === 'hardware',
      `L. High R/I profile recommends Hardware & Embedded Systems (Top: ${recL.recommendedDomain})`
    )

    // -------------------------------------------------------------------------
    // TEST M: Strongly Artistic profile recommends UI/UX
    // -------------------------------------------------------------------------
    const highAAnswers: Record<string, number> = {
      R1: 1, R2: 1, R3: 1, // Low R
      I1: 4, I2: 4, I3: 4, // High I
      A1: 5, A2: 5, A3: 5, // High A
      S1: 1, S2: 1, S3: 1, // Low S
      E1: 2, E2: 2, E3: 2, // Low E
      C1: 3, C2: 3, C3: 3, // Mid C
    }
    const recM = calculateTechnicalDomainRecommendations(highAAnswers)
    assert(
      recM.recommendedDomainKey === 'uiux',
      `M. High A profile recommends UI/UX & Web Interface Engineering (Top: ${recM.recommendedDomain})`
    )

    // -------------------------------------------------------------------------
    // TEST N: Old aiml/cloudarchitect duplicates are not independently ranked
    // -------------------------------------------------------------------------
    const rankedKeys = recI.rankedDomains.map((d) => d.key)
    const hasOldDuplicates = rankedKeys.includes('aiml') || rankedKeys.includes('cloudarchitect')
    assert(
      !hasOldDuplicates && rankedKeys.length === 6,
      `N. Old aiml/cloudarchitect duplicates removed from independent ranking`
    )

    console.log(`\n==========================================================================`)
    console.log(`TECHNICAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
    console.log(`==========================================================================\n`)
  } catch (err) {
    console.error('Test execution error:', err)
  }
}

runTechnicalTests().catch(console.error)
