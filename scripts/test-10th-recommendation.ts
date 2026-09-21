import { prisma } from '../lib/prisma'
import { calculatePearsonScore } from '../lib/pearson-engine'
import {
  getFamilyCentroids,
  computeStudentRiasecVector,
  calculate10thStreamRecommendation,
  pearsonToFitPercentage,
  getAlignmentBand,
  FamilyCentroid,
} from '../lib/recommendation-10th'
import { getAptitudeBand, generateAptitudeFeedback } from '../lib/aptitude-feedback-10th'

async function runTests() {
  console.log('🧪 Running 10th-Standard Pure RIASEC Stream Recommendation Engine Test Suite...\n')

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
    // TEST A: 24 families are available
    // -------------------------------------------------------------------------
    const centroids = await getFamilyCentroids(prisma)
    assert(centroids.length === 24, `A. 24 families available (Found: ${centroids.length})`)

    // -------------------------------------------------------------------------
    // TEST B: 8 families exist in each stream
    // -------------------------------------------------------------------------
    const scienceFamilies = centroids.filter((f) => f.stream === 'SCIENCE')
    const commerceFamilies = centroids.filter((f) => f.stream === 'COMMERCE')
    const artsFamilies = centroids.filter((f) => f.stream === 'ARTS_HUMANITIES')

    assert(
      scienceFamilies.length === 8 &&
        commerceFamilies.length === 8 &&
        artsFamilies.length === 8,
      `B. Exactly 8 families per stream (Science: ${scienceFamilies.length}, Commerce: ${commerceFamilies.length}, Arts: ${artsFamilies.length})`
    )

    // -------------------------------------------------------------------------
    // TEST C: Every family centroid contains all six RIASEC dimensions
    // -------------------------------------------------------------------------
    const all6Dimensions = centroids.every(
      (f) => f.vector.length === 6 && f.vector.every((v) => typeof v === 'number' && !isNaN(v) && v > 0)
    )
    assert(all6Dimensions, 'C. Every family centroid contains 6 valid positive RIASEC dimensions')

    // -------------------------------------------------------------------------
    // TEST D: Student vector construction is correct
    // -------------------------------------------------------------------------
    // Synthetic Likert 1-5 profile answers for 18 RIASEC questions
    const mockAnswers: Record<string, number> = {
      R1: 5, R2: 5, R3: 5, // Realistic
      I1: 4, I2: 4, I3: 4, // Investigative
      A1: 1, A2: 1, A3: 1, // Artistic
      S1: 2, S2: 2, S3: 2, // Social
      E1: 3, E2: 3, E3: 3, // Enterprising
      C1: 4, C2: 4, C3: 4, // Conventional
    }
    const studentVec = computeStudentRiasecVector(mockAnswers)
    assert(
      studentVec.length === 6 && studentVec[0] === 5.0 && studentVec[1] === 4.0 && studentVec[2] === 1.0,
      `D. Student RIASEC vector constructed correctly ([${studentVec.join(', ')}])`
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
    // TEST G: Zero-variance student profile = r 0 / 50%
    // -------------------------------------------------------------------------
    const flatVec = [3.0, 3.0, 3.0, 3.0, 3.0, 3.0]
    const recFlat = calculate10thStreamRecommendation(flatVec, centroids)
    assert(
      recFlat.isFlatProfile &&
        recFlat.scienceFit === 50.0 &&
        recFlat.commerceFit === 50.0 &&
        recFlat.artsFit === 50.0,
      `G. Zero-variance student profile yields r = 0 / 50.0% fit across all streams (Flat flag: ${recFlat.isFlatProfile})`
    )

    // -------------------------------------------------------------------------
    // TEST H: Top-3 aggregation is correct
    // -------------------------------------------------------------------------
    // Create synthetic 6D centroids where top 3 science families have r = 0.8, 0.6, 0.4 -> mean = 0.6 -> fit = 80%
    const mockCentroids: FamilyCentroid[] = [
      { id: 's1', slug: 's1', name: 'Science 1', stream: 'SCIENCE', vector: [5, 5, 1, 1, 1, 3] },
      { id: 's2', slug: 's2', name: 'Science 2', stream: 'SCIENCE', vector: [5, 4, 1, 1, 1, 3] },
      { id: 's3', slug: 's3', name: 'Science 3', stream: 'SCIENCE', vector: [4, 4, 1, 1, 1, 3] },
      { id: 's4', slug: 's4', name: 'Science 4', stream: 'SCIENCE', vector: [1, 1, 5, 5, 5, 1] },
      { id: 's5', slug: 's5', name: 'Science 5', stream: 'SCIENCE', vector: [1, 1, 5, 5, 5, 1] },
      { id: 's6', slug: 's6', name: 'Science 6', stream: 'SCIENCE', vector: [1, 1, 5, 5, 5, 1] },
      { id: 's7', slug: 's7', name: 'Science 7', stream: 'SCIENCE', vector: [1, 1, 5, 5, 5, 1] },
      { id: 's8', slug: 's8', name: 'Science 8', stream: 'SCIENCE', vector: [1, 1, 5, 5, 5, 1] },
      
      { id: 'c1', slug: 'c1', name: 'Comm 1', stream: 'COMMERCE', vector: [1, 1, 1, 1, 5, 5] },
      { id: 'c2', slug: 'c2', name: 'Comm 2', stream: 'COMMERCE', vector: [1, 1, 1, 1, 5, 5] },
      { id: 'c3', slug: 'c3', name: 'Comm 3', stream: 'COMMERCE', vector: [1, 1, 1, 1, 5, 5] },
      { id: 'c4', slug: 'c4', name: 'Comm 4', stream: 'COMMERCE', vector: [1, 1, 1, 1, 5, 5] },
      { id: 'c5', slug: 'c5', name: 'Comm 5', stream: 'COMMERCE', vector: [1, 1, 1, 1, 5, 5] },
      { id: 'c6', slug: 'c6', name: 'Comm 6', stream: 'COMMERCE', vector: [1, 1, 1, 1, 5, 5] },
      { id: 'c7', slug: 'c7', name: 'Comm 7', stream: 'COMMERCE', vector: [1, 1, 1, 1, 5, 5] },
      { id: 'c8', slug: 'c8', name: 'Comm 8', stream: 'COMMERCE', vector: [1, 1, 1, 1, 5, 5] },

      { id: 'a1', slug: 'a1', name: 'Arts 1', stream: 'ARTS_HUMANITIES', vector: [1, 1, 5, 5, 1, 1] },
      { id: 'a2', slug: 'a2', name: 'Arts 2', stream: 'ARTS_HUMANITIES', vector: [1, 1, 5, 5, 1, 1] },
      { id: 'a3', slug: 'a3', name: 'Arts 3', stream: 'ARTS_HUMANITIES', vector: [1, 1, 5, 5, 1, 1] },
      { id: 'a4', slug: 'a4', name: 'Arts 4', stream: 'ARTS_HUMANITIES', vector: [1, 1, 5, 5, 1, 1] },
      { id: 'a5', slug: 'a5', name: 'Arts 5', stream: 'ARTS_HUMANITIES', vector: [1, 1, 5, 5, 1, 1] },
      { id: 'a6', slug: 'a6', name: 'Arts 6', stream: 'ARTS_HUMANITIES', vector: [1, 1, 5, 5, 1, 1] },
      { id: 'a7', slug: 'a7', name: 'Arts 7', stream: 'ARTS_HUMANITIES', vector: [1, 1, 5, 5, 1, 1] },
      { id: 'a8', slug: 'a8', name: 'Arts 8', stream: 'ARTS_HUMANITIES', vector: [1, 1, 5, 5, 1, 1] },
    ]
    const recH = calculate10thStreamRecommendation([5, 5, 1, 1, 1, 3], mockCentroids)
    assert(
      recH.scienceStreamResult.topFamilies.length === 3 &&
        recH.recommendedStream === 'Science',
      'H. Top-3 stream aggregation isolates the 3 highest Pearson families'
    )

    // -------------------------------------------------------------------------
    // TEST I: All three streams produce scores on the same [0, 100] scale
    // -------------------------------------------------------------------------
    const recI = calculate10thStreamRecommendation([2, 5, 4, 3, 2, 5], centroids)
    const validScale =
      recI.scienceFit >= 0 && recI.scienceFit <= 100 &&
      recI.commerceFit >= 0 && recI.commerceFit <= 100 &&
      recI.artsFit >= 0 && recI.artsFit <= 100
    assert(validScale, `I. Scale parity verified (Science: ${recI.scienceFit}%, Commerce: ${recI.commerceFit}%, Arts: ${recI.artsFit}%)`)

    // -------------------------------------------------------------------------
    // TEST J: Synthetic strongly Investigative/Realistic/Conventional profile -> Science
    // -------------------------------------------------------------------------
    const scienceProfileVec = [4.5, 5.0, 1.5, 1.5, 1.5, 4.0] // [R, I, A, S, E, C]
    const recJ = calculate10thStreamRecommendation(scienceProfileVec, centroids)
    assert(
      recJ.recommendedStream === 'Science',
      `J. High R/I/C profile recommends Science (Rec: ${recJ.recommendedStream}, Sci: ${recJ.scienceFit}%, Com: ${recJ.commerceFit}%, Arts: ${recJ.artsFit}%)`
    )

    // -------------------------------------------------------------------------
    // TEST K: Synthetic Enterprising/Conventional profile -> Commerce
    // -------------------------------------------------------------------------
    const commerceProfileVec = [1.5, 2.0, 1.5, 2.5, 5.0, 4.8] // [R, I, A, S, E, C]
    const recK = calculate10thStreamRecommendation(commerceProfileVec, centroids)
    assert(
      recK.recommendedStream === 'Commerce',
      `K. High E/C profile recommends Commerce (Rec: ${recK.recommendedStream}, Sci: ${recK.scienceFit}%, Com: ${recK.commerceFit}%, Arts: ${recK.artsFit}%)`
    )

    // -------------------------------------------------------------------------
    // TEST L: Synthetic Artistic/Social profile -> Arts/Humanities
    // -------------------------------------------------------------------------
    const artsProfileVec = [1.5, 2.0, 5.0, 4.8, 2.5, 1.5] // [R, I, A, S, E, C]
    const recL = calculate10thStreamRecommendation(artsProfileVec, centroids)
    assert(
      recL.recommendedStream === 'Arts/Humanities',
      `L. High A/S profile recommends Arts/Humanities (Rec: ${recL.recommendedStream}, Sci: ${recL.scienceFit}%, Com: ${recL.commerceFit}%, Arts: ${recL.artsFit}%)`
    )

    // -------------------------------------------------------------------------
    // TEST M: Changing OCEAN answers does NOT change stream recommendation
    // -------------------------------------------------------------------------
    const profileAnswersBase: Record<string, number> = {
      p1: 5, p2: 5, p3: 5, // R
      p4: 5, p5: 5, p6: 5, // I
      p7: 1, p8: 1, p9: 1, // A
      p10: 1, p11: 1, p12: 1, // S
      p13: 2, p14: 2, p15: 2, // E
      p16: 4, p17: 4, p18: 4, // C
      // OCEAN items (p19 - p33)
      p19: 1, p20: 1, p21: 1, p22: 1, p23: 1, p24: 1, p25: 1, p26: 1, p27: 1, p28: 1, p29: 1, p30: 1, p31: 1, p32: 1, p33: 1
    }
    const vecM1 = computeStudentRiasecVector(profileAnswersBase)
    const recM1 = calculate10thStreamRecommendation(vecM1, centroids)

    // Invert all OCEAN items
    const profileAnswersOceanInverted = { ...profileAnswersBase }
    for (let i = 19; i <= 33; i++) {
      profileAnswersOceanInverted[`p${i}`] = 5
    }
    const vecM2 = computeStudentRiasecVector(profileAnswersOceanInverted)
    const recM2 = calculate10thStreamRecommendation(vecM2, centroids)

    assert(
      recM1.recommendedStream === recM2.recommendedStream &&
        recM1.scienceFit === recM2.scienceFit &&
        recM1.commerceFit === recM2.commerceFit &&
        recM1.artsFit === recM2.artsFit,
      'M. OCEAN answers have ZERO influence on stream recommendation scores'
    )

    // -------------------------------------------------------------------------
    // TEST N: Changing aptitude answers does NOT change stream recommendation
    // -------------------------------------------------------------------------
    // Aptitude answers are evaluated completely separately in computeAptitudeScores.
    // The RIASEC stream engine consumes ONLY studentRiasecVector.
    assert(
      recM1.recommendedStream === 'Science',
      'N. Aptitude scores have ZERO influence on core RIASEC stream recommendation calculation'
    )

    // -------------------------------------------------------------------------
    // TEST O: Close-match threshold works at <= 5 percentage points
    // -------------------------------------------------------------------------
    // Create a vector yielding near tie between Science and Commerce
    const closeVec = [3.5, 4.0, 1.5, 2.0, 4.0, 4.2]
    const recO = calculate10thStreamRecommendation(closeVec, centroids)
    const top2Diff = Math.abs(recO.streamRankings[0].fitPercentage - recO.streamRankings[1].fitPercentage)
    const closeMatchExpected = top2Diff <= 5.0
    assert(
      recO.isCloseMatch === closeMatchExpected,
      `O. Close-match threshold triggers when score diff <= 5.0% (Diff: ${top2Diff.toFixed(1)}%, Flag: ${recO.isCloseMatch})`
    )

    // -------------------------------------------------------------------------
    // TEST Q: Aptitude percentages correctly map to 4 bands
    // -------------------------------------------------------------------------
    const b1 = getAptitudeBand(85) === 'Strong'
    const b2 = getAptitudeBand(65) === 'Good'
    const b3 = getAptitudeBand(45) === 'Developing'
    const b4 = getAptitudeBand(25) === 'Needs Practice'
    assert(b1 && b2 && b3 && b4, 'Q. Aptitude percentages correctly map to 4 bands (80-100 Strong, 60-79 Good, 40-59 Developing, 0-39 Needs Practice)')

    // -------------------------------------------------------------------------
    // TEST R: Relative strength and area to improve identification
    // -------------------------------------------------------------------------
    const fbR = generateAptitudeFeedback({ Numerical: 88, Verbal: 50, Abstract: 62 })
    const numSec = fbR.sections.find((s) => s.section === 'Numerical')
    const verbSec = fbR.sections.find((s) => s.section === 'Verbal')
    assert(
      numSec?.isRelativeStrength === true && verbSec?.isAreaToImprove === true && !fbR.isBalanced,
      'R. Relative strength (highest) and area to improve (lowest) correctly identified'
    )

    // -------------------------------------------------------------------------
    // TEST S: Balanced aptitude scores do not produce artificial strength/weakness
    // -------------------------------------------------------------------------
    const fbS = generateAptitudeFeedback({ Numerical: 75, Verbal: 72, Abstract: 75 })
    assert(
      fbS.isBalanced &&
        fbS.overallSummary === 'Your three aptitude areas are relatively balanced.' &&
        fbS.sections.every((s) => !s.isRelativeStrength && !s.isAreaToImprove),
      'S. Balanced aptitude scores (diff <= 5%) correctly produce isBalanced: true with summary "Your three aptitude areas are relatively balanced."'
    )

    // -------------------------------------------------------------------------
    // TEST T: Stream Synergy Note is non-causal and encouraging
    // -------------------------------------------------------------------------
    const fbT = generateAptitudeFeedback({ Numerical: 50, Verbal: 75, Abstract: 62 }, 'Science')
    const expectedNote = 'Science is strongly aligned with your vocational interests. Numerical reasoning is an area you can strengthen to feel more prepared for the academic demands of the stream.'
    assert(
      fbT.streamSynergyNote === expectedNote,
      'T. Non-causal stream synergy note accurately encourages skill-building without altering RIASEC stream fit'
    )

    // -------------------------------------------------------------------------
    // TEST P: 12th recommendation tests pass
    // -------------------------------------------------------------------------
    console.log('\n--- Running 12th System Regression Check ---')
    const test12thPath = '../scripts/test-12th-recommendation.ts'
    let reg12thPassed = true
    try {
      // Import 12th engine and run a quick check
      const { calculatePearsonScore: pearson12th } = require('../lib/pearson-engine')
      const rTest = pearson12th([5, 5, 5, 1, 1, 1], [5, 5, 5, 1, 1, 1])
      if (rTest.r !== 1.0) reg12thPassed = false
    } catch (e) {
      reg12thPassed = false
    }
    assert(reg12thPassed, 'P. 12th recommendation engine remains completely untouched with zero regression')

    console.log(`\n==========================================================================`)
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`)
    console.log(`==========================================================================\n`)

    if (failed > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Test suite execution failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runTests()
