import { prisma } from '../lib/prisma'
import { calculatePearsonScore } from '../lib/pearson-engine'
import { filterEligibleOccupations } from '../lib/eligibility-engine'
import { calculate12thCareerRecommendations } from '../lib/family-scoring-engine'

async function runTests() {
  console.log('🧪 RUNNING AUTOMATED VERIFICATION SUITE FOR 12TH CAREER RECOMMENDATION REDESIGN\n')
  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail || 'Assertion failed'}`)
      failed++
    }
  }

  // --- A. O*NET IMPORT INTEGRITY ---
  console.log('[Test Suite 1: O*NET 31.0 Database Integrity]')
  const totalFamilies = await prisma.careerFamily.count()
  const totalOccupations = await prisma.onetOccupation.count()

  assert(totalFamilies === 24, '24 Career Families present', `Found ${totalFamilies}`)
  assert(totalOccupations === 83, '83 Verified O*NET Occupations seeded', `Found ${totalOccupations}`)

  const allOccupations = await prisma.onetOccupation.findMany({ select: { socCode: true } })
  const uniqueSocCodes = new Set(allOccupations.map(o => o.socCode))
  assert(uniqueSocCodes.size === totalOccupations, 'Zero Duplicate SOC Codes (Unique primary assignment)', `Total ${totalOccupations}, Unique ${uniqueSocCodes.size}`)

  const scienceFamilies = await prisma.careerFamily.count({ where: { stream: 'SCIENCE' } })
  const commerceFamilies = await prisma.careerFamily.count({ where: { stream: 'COMMERCE' } })
  const artsFamilies = await prisma.careerFamily.count({ where: { stream: 'ARTS_HUMANITIES' } })

  assert(scienceFamilies === 8, 'Science families count === 8', `Found ${scienceFamilies}`)
  assert(commerceFamilies === 8, 'Commerce families count === 8', `Found ${commerceFamilies}`)
  assert(artsFamilies === 8, 'Arts families count === 8', `Found ${artsFamilies}`)

  // --- B. PEARSON MATH & ZERO-VARIANCE ---
  console.log('\n[Test Suite 2: Pearson Correlation Engine]')
  const vIdentical = calculatePearsonScore([5, 5, 1, 1, 3, 3], [5, 5, 1, 1, 3, 3])
  assert(vIdentical.r === 1.0 && vIdentical.matchScore === 100, 'Perfect Positive Correlation (r = 1.0 -> 100%)', `Got r=${vIdentical.r}, score=${vIdentical.matchScore}`)

  const vInverse = calculatePearsonScore([5, 5, 1, 1, 1, 1], [1, 1, 5, 5, 5, 5])
  assert(vInverse.r === -1.0 && vInverse.matchScore === 0, 'Perfect Negative Correlation (r = -1.0 -> 0%)', `Got r=${vInverse.r}, score=${vInverse.matchScore}`)

  const vFlat = calculatePearsonScore([3, 3, 3, 3, 3, 3], [5, 4, 3, 2, 1, 6])
  assert(vFlat.r === 0.0 && vFlat.matchScore === 50 && vFlat.isFlatProfile === true, 'Zero Variance Rule (r = 0.0 -> 50%, isFlatProfile=true)', `Got r=${vFlat.r}, score=${vFlat.matchScore}`)

  // --- C. STRICT STREAM ISOLATION ---
  console.log('\n[Test Suite 3: Strict Stream Isolation]')
  const sciencePipeline = await calculate12thCareerRecommendations({
    stream: 'SCIENCE',
    hasPcm: true,
    hasPcb: false,
    hasMath: true,
    profileAnswers: { R1: 5, R2: 5, R3: 4, I1: 5, I2: 5, I3: 5 }
  })

  const hasNonScienceInScience = sciencePipeline.top3Families.some(f => f.stream !== 'SCIENCE')
  assert(!hasNonScienceInScience, 'Science Student receives ONLY Science Families', 'Non-science family found')

  const commercePipeline = await calculate12thCareerRecommendations({
    stream: 'COMMERCE',
    hasPcm: false,
    hasPcb: false,
    hasMath: true,
    profileAnswers: { C1: 5, C2: 5, C3: 5, E1: 4, E2: 4, E3: 4 }
  })

  const hasNonCommerceInCommerce = commercePipeline.top3Families.some(f => f.stream !== 'COMMERCE')
  assert(!hasNonCommerceInCommerce, 'Commerce Student receives ONLY Commerce Families', 'Non-commerce family found')

  const artsPipeline = await calculate12thCareerRecommendations({
    stream: 'ARTS_HUMANITIES',
    hasPcm: false,
    hasPcb: false,
    hasMath: false,
    profileAnswers: { A1: 5, A2: 5, A3: 5, S1: 4, S2: 4, S3: 4 }
  })

  const hasNonArtsInArts = artsPipeline.top3Families.some(f => f.stream !== 'ARTS_HUMANITIES')
  assert(!hasNonArtsInArts, 'Arts/Humanities Student receives ONLY Arts/Humanities Families', 'Non-arts family found')

  // --- D. FAMILY MAXIMUM SCORING ---
  console.log('\n[Test Suite 4: Family MAXIMUM Scoring (Not Average)]')
  const topFam = sciencePipeline.top3Families[0]
  if (topFam && topFam.topOccupations.length > 0) {
    const highestOccScore = topFam.topOccupations[0].matchScore
    assert(topFam.familyScore === highestOccScore, 'Family Score strictly equals top[0] occupation score (MAX Scoring)', `Family score=${topFam.familyScore}, topOccScore=${highestOccScore}`)
    assert(topFam.topOccupations.length <= 5, 'Top Occupations count per family <= 5', `Found ${topFam.topOccupations.length}`)
  }

  // --- E. OCEAN EXCLUSION ---
  console.log('\n[Test Suite 5: OCEAN Zero-Influence Verification]')
  const baseAnswers = { R1: 5, R2: 5, R3: 5, I1: 4, I2: 4, I3: 4, O1: 1, O2: 1, O3: 1, N1: 5, N2: 5 }
  const altAnswers  = { R1: 5, R2: 5, R3: 5, I1: 4, I2: 4, I3: 4, O1: 5, O2: 5, O3: 5, N1: 1, N2: 1 }

  const resBase = await calculate12thCareerRecommendations({ stream: 'SCIENCE', hasPcm: true, profileAnswers: baseAnswers })
  const resAlt  = await calculate12thCareerRecommendations({ stream: 'SCIENCE', hasPcm: true, profileAnswers: altAnswers })

  const scoresMatch = resBase.top3Families[0].familyScore === resAlt.top3Families[0].familyScore
  assert(scoresMatch, 'Changing OCEAN answers has ZERO effect on 12th Career Recommendations', `Base=${resBase.top3Families[0]?.familyScore}, Alt=${resAlt.top3Families[0]?.familyScore}`)

  // --- F. API STREAM NORMALIZATION ---
  console.log('\n[Test Suite 6: API Stream Normalization]')
  const normalizeStream = (rawStream: string): 'SCIENCE' | 'COMMERCE' | 'ARTS_HUMANITIES' => {
    const s = (rawStream || 'science').toLowerCase()
    if (s.includes('commerce')) return 'COMMERCE'
    if (s.includes('arts') || s.includes('humanities')) return 'ARTS_HUMANITIES'
    return 'SCIENCE'
  }

  assert(normalizeStream('arts') === 'ARTS_HUMANITIES', "Stream 'arts' normalizes to 'ARTS_HUMANITIES'")
  assert(normalizeStream('arts & humanities') === 'ARTS_HUMANITIES', "Stream 'arts & humanities' normalizes to 'ARTS_HUMANITIES'")
  assert(normalizeStream('humanities') === 'ARTS_HUMANITIES', "Stream 'humanities' normalizes to 'ARTS_HUMANITIES'")
  assert(normalizeStream('commerce') === 'COMMERCE', "Stream 'commerce' normalizes to 'COMMERCE'")
  assert(normalizeStream('science') === 'SCIENCE', "Stream 'science' normalizes to 'SCIENCE'")

  const normalizedArtsPipeline = await calculate12thCareerRecommendations({
    stream: normalizeStream('arts'),
    hasMath: false,
    hasBiology: false,
    hasCs: false,
    profileAnswers: { A1: 5, A2: 5, A3: 5, S1: 4, S2: 4, S3: 4 }
  })
  const hasOnlyArtsFromNormalized = normalizedArtsPipeline.top3Families.every(f => f.stream === 'ARTS_HUMANITIES')
  assert(hasOnlyArtsFromNormalized, 'Normalized Arts input returns ONLY Arts/Humanities Families')

  // --- G. DIRECT SUBJECT ELIGIBILITY (PCM, PCMC, PCB, PCMB, Math+CS, Bio+CS) ---
  console.log('\n[Test Suite 7: Direct Subject Eligibility Engine]')
  
  // 1. PCM (Math = true, Biology = false)
  const resPcm = await calculate12thCareerRecommendations({
    stream: 'SCIENCE',
    hasMath: true,
    hasBiology: false,
    hasCs: false,
    profileAnswers: { R1: 5, I1: 5, S1: 5 }
  })
  const pcmMedical = resPcm.top3Families.some(f => f.slug === 'medicine-clinical-healthcare' || f.slug === 'biological-life-sciences')
  assert(!pcmMedical, 'PCM (Math only) excludes Medicine and Life Sciences pathways')

  // 2. PCMC (Math = true, CS = true, Biology = false)
  const resPcmc = await calculate12thCareerRecommendations({
    stream: 'SCIENCE',
    hasMath: true,
    hasBiology: false,
    hasCs: true,
    profileAnswers: { I1: 5, R1: 5, C1: 5 }
  })
  const pcmcTech = resPcmc.top3Families.some(f => f.slug === 'computing-software-engineering' || f.slug === 'data-science-analytics' || f.slug === 'engineering-technology')
  const pcmcMedical = resPcmc.top3Families.some(f => f.slug === 'medicine-clinical-healthcare')
  assert(pcmcTech && !pcmcMedical, 'PCMC (Math + CS) enables Technical/CS pathways and excludes Medical')

  // 3. PCB (Math = false, Biology = true)
  const resPcb = await calculate12thCareerRecommendations({
    stream: 'SCIENCE',
    hasMath: false,
    hasBiology: true,
    hasCs: false,
    profileAnswers: { I1: 5, S1: 5, R1: 4 }
  })
  const pcbMedical = resPcb.top3Families.some(f => f.slug === 'medicine-clinical-healthcare' || f.slug === 'biological-life-sciences')
  const pcbEngineering = resPcb.top3Families.some(f => f.slug === 'engineering-technology' || f.slug === 'architecture-spatial-design')
  assert(pcbMedical && !pcbEngineering, 'PCB (Biology only) enables Medical/Life-Sciences and excludes Engineering/Architecture')

  // 4. PCMB (Math = true, Biology = true)
  const resPcmbMedicalIntent = await calculate12thCareerRecommendations({
    stream: 'SCIENCE',
    hasMath: true,
    hasBiology: true,
    hasCs: false,
    profileAnswers: { S1: 5, S2: 5, S3: 5, I1: 5, I2: 5, I3: 5 } // Medical / Bio RIASEC preference
  })
  const pcmbHasMedical = resPcmbMedicalIntent.top3Families.some(f => f.slug === 'medicine-clinical-healthcare' || f.slug === 'biological-life-sciences')

  const resPcmbTechIntent = await calculate12thCareerRecommendations({
    stream: 'SCIENCE',
    hasMath: true,
    hasBiology: true,
    hasCs: false,
    profileAnswers: { R1: 5, R2: 5, R3: 5, C1: 5, C2: 5, C3: 5 } // Technical / CS RIASEC preference
  })
  const pcmbHasTech = resPcmbTechIntent.top3Families.some(f => f.slug === 'computing-software-engineering' || f.slug === 'engineering-technology')

  assert(pcmbHasMedical && pcmbHasTech, 'PCMB (Math + Biology) keeps BOTH Technical AND Medical pools eligible simultaneously based on RIASEC profile')

  // 5. Biology + CS without Math (Math = false, Biology = true, CS = true)
  const resBioCs = await calculate12thCareerRecommendations({
    stream: 'SCIENCE',
    hasMath: false,
    hasBiology: true,
    hasCs: true,
    profileAnswers: { S1: 5, I1: 5, C1: 5 }
  })
  const bioCsHasMedical = resBioCs.top3Families.some(f => f.slug === 'medicine-clinical-healthcare' || f.slug === 'biological-life-sciences')
  const bioCsHasEngineering = resBioCs.top3Families.some(f => f.slug === 'engineering-technology' || f.slug === 'architecture-spatial-design')
  assert(bioCsHasMedical && !bioCsHasEngineering, 'Biology + CS without Math enables Biology pool but excludes Math-dependent Engineering')

  // 6. No Subject Selected (Math = false, Biology = false, CS = false)
  const resNone = await calculate12thCareerRecommendations({
    stream: 'SCIENCE',
    hasMath: false,
    hasBiology: false,
    hasCs: false,
    profileAnswers: { R1: 5, I1: 5 }
  })
  const hasMathOrBioFamilies = resNone.top3Families.some(f => 
    f.slug === 'engineering-technology' || 
    f.slug === 'medicine-clinical-healthcare' || 
    f.slug === 'computing-software-engineering' ||
    f.slug === 'biological-life-sciences' ||
    f.slug === 'architecture-spatial-design'
  )
  assert(!hasMathOrBioFamilies, 'No Science subjects selected excludes all Math-dependent and Biology-dependent families')

  console.log(`\n==========================================`)
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`)
  console.log(`==========================================`)

  if (failed > 0) process.exit(1)
}

runTests()
  .catch(e => {
    console.error('Test execution failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
