import { prisma } from '@/lib/prisma'
import { calculatePearsonScore } from '@/lib/pearson-engine'
import { filterEligibleOccupations } from '@/lib/eligibility-engine'

export interface ScoredOnetOccupation {
  socCode: string
  title: string
  description: string
  matchScore: number
  pearsonR: number
  isPathwayDependent: boolean
  relatedModernRoles: string[]
}

export interface ScoredCareerFamilyResult {
  familyId: string
  slug: string
  familyName: string
  stream: string
  description: string
  familyScore: number // MAXIMUM Match Score among Top 5 eligible occupations
  topOccupations: ScoredOnetOccupation[]
}

export interface RecommendationPipelineOutput {
  selectedStream: string
  studentRiasecVector: {
    R: number
    I: number
    A: number
    S: number
    E: number
    C: number
  }
  isFlatProfile: boolean
  top3Families: ScoredCareerFamilyResult[]
}

/**
 * Calculates student 6D RIASEC vector from 18 answers (1-5 scale).
 */
export function computeStudentRiasecVector(profileAnswers: Record<string, number | null | undefined>) {
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
 * Core 12th Career Recommendation Engine Pipeline:
 * Stream -> Subject Eligibility -> Pearson Vector Matching -> Family Grouping & Top 5 -> Family MAX Scoring -> Top 3 Families
 */
export async function calculate12thCareerRecommendations(input: {
  stream: 'SCIENCE' | 'COMMERCE' | 'ARTS_HUMANITIES'
  hasMath?: boolean
  hasBiology?: boolean
  hasCs?: boolean
  hasPcm?: boolean
  hasPcb?: boolean
  profileAnswers: Record<string, number | null | undefined>
}): Promise<RecommendationPipelineOutput> {
  const normStream = input.stream.toUpperCase()

  // 1. Compute 6D Student RIASEC Vector
  const riasec = computeStudentRiasecVector(input.profileAnswers)
  const studentVector = [riasec.R, riasec.I, riasec.A, riasec.S, riasec.E, riasec.C]

  // Check if profile is flat (zero variance across all 6 dimensions)
  const stdDevStudent = Math.sqrt(
    studentVector.reduce((sum, v) => sum + Math.pow(v - (studentVector.reduce((a, b) => a + b, 0) / 6), 2), 0) / 6
  )
  const isFlatProfile = stdDevStudent === 0

  // 2. Fetch Stream-Specific Families and Occupations from Database
  const streamFamilies = await prisma.careerFamily.findMany({
    where: { stream: normStream },
    include: { occupations: { include: { family: true } } },
  })

  const allStreamOccupations = streamFamilies.flatMap((f) => f.occupations)

  // 3. Educational & Subject Eligibility Filtering
  const eligibleOccupations = filterEligibleOccupations(allStreamOccupations, {
    stream: input.stream,
    hasMath: input.hasMath,
    hasBiology: input.hasBiology,
    hasCs: input.hasCs,
    hasPcm: input.hasPcm,
    hasPcb: input.hasPcb,
  })

  // 4. Pearson Correlation Scoring for Eligible Occupations
  const scoredOccupations = eligibleOccupations.map((occ) => {
    const occVector = [occ.riasecR, occ.riasecI, occ.riasecA, occ.riasecS, occ.riasecE, occ.riasecC]
    const pResult = calculatePearsonScore(studentVector, occVector)

    let parsedModernRoles: string[] = []
    if (occ.relatedModernRoles) {
      try {
        parsedModernRoles = JSON.parse(occ.relatedModernRoles)
      } catch (e) {
        parsedModernRoles = []
      }
    }

    return {
      id: occ.id,
      familyId: occ.familyId,
      socCode: occ.socCode,
      title: occ.title,
      description: occ.description,
      matchScore: pResult.matchScore,
      pearsonR: pResult.r,
      isPathwayDependent: occ.isPathwayDependent,
      relatedModernRoles: parsedModernRoles,
    }
  })

  // 5. Group by Career Family, Retain Top 5 Occupations, & Family Score = MAXIMUM Match Score
  const familyResults: ScoredCareerFamilyResult[] = streamFamilies.map((fam) => {
    const famOccs = scoredOccupations
      .filter((o) => o.familyId === fam.id)
      .sort((a, b) => b.matchScore - a.matchScore)

    const top5 = famOccs.slice(0, 5).map((o) => ({
      socCode: o.socCode,
      title: o.title,
      description: o.description,
      matchScore: o.matchScore,
      pearsonR: o.pearsonR,
      isPathwayDependent: o.isPathwayDependent,
      relatedModernRoles: o.relatedModernRoles,
    }))

    // Family Score is strictly MAXIMUM Match Score of Top 5 eligible occupations
    const familyScore = top5.length > 0 ? top5[0].matchScore : 0

    return {
      familyId: fam.id,
      slug: fam.slug,
      familyName: fam.name,
      stream: fam.stream,
      description: fam.description,
      familyScore,
      topOccupations: top5,
    }
  })

  // 6. Rank Families Descending & Return Top 3
  const top3Families = familyResults
    .filter((f) => f.topOccupations.length > 0)
    .sort((a, b) => b.familyScore - a.familyScore)
    .slice(0, 3)

  return {
    selectedStream: normStream,
    studentRiasecVector: riasec,
    isFlatProfile,
    top3Families,
  }
}
