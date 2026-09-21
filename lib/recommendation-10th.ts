import { prisma } from '@/lib/prisma'
import { calculatePearsonScore } from '@/lib/pearson-engine'
import { PROFILE_QUESTIONS, IProfileQuestion } from '@/lib/constants'

export interface FamilyMatch {
  familyId: string
  familyName: string
  slug: string
  stream: 'SCIENCE' | 'COMMERCE' | 'ARTS_HUMANITIES'
  pearsonR: number
  fitPercentage: number
}

export interface StreamFitResult {
  streamKey: 'science' | 'commerce' | 'arts'
  streamLabel: string
  pearsonScore: number
  fitPercentage: number
  alignmentBand: 'Strong Alignment' | 'Moderate Alignment' | 'Low Alignment'
  topFamilies: FamilyMatch[]
  allFamilies: FamilyMatch[]
}

export interface FamilyCentroid {
  id: string
  slug: string
  name: string
  stream: 'SCIENCE' | 'COMMERCE' | 'ARTS_HUMANITIES'
  vector: number[] // [R, I, A, S, E, C]
}

export interface Recommendation10thResult {
  recommendedStream: string // "Science" | "Commerce" | "Arts/Humanities"
  recommendedStreamKey: 'science' | 'commerce' | 'arts'
  alternativeStream: string
  alternativeStreamKey: 'science' | 'commerce' | 'arts'

  scienceFit: number
  commerceFit: number
  artsFit: number

  scienceStreamResult: StreamFitResult
  commerceStreamResult: StreamFitResult
  artsStreamResult: StreamFitResult

  streamRankings: StreamFitResult[]

  studentRiasecVector: { R: number; I: number; A: number; S: number; E: number; C: number }

  isCloseMatch: boolean
  isFlatProfile: boolean
  guidanceNotes: string[]
}

const STREAM_LABEL_MAP: Record<string, { key: 'science' | 'commerce' | 'arts'; label: string }> = {
  SCIENCE: { key: 'science', label: 'Science' },
  COMMERCE: { key: 'commerce', label: 'Commerce' },
  ARTS_HUMANITIES: { key: 'arts', label: 'Arts/Humanities' },
}

/**
 * Calculates alignment band from fit percentage.
 */
export function getAlignmentBand(fitPercentage: number): 'Strong Alignment' | 'Moderate Alignment' | 'Low Alignment' {
  if (fitPercentage >= 75.0) return 'Strong Alignment'
  if (fitPercentage >= 50.0) return 'Moderate Alignment'
  return 'Low Alignment'
}

/**
 * Converts Pearson r in [-1, 1] to normalized fit percentage in [0, 100].
 */
export function pearsonToFitPercentage(r: number): number {
  const clampedR = Math.max(-1.0, Math.min(1.0, r))
  const rawFit = ((clampedR + 1) / 2) * 100
  const clampedFit = Math.max(0, Math.min(100, rawFit))
  return parseFloat(clampedFit.toFixed(1))
}

const TYPE_TO_DIM: Record<string, string> = {
  Realistic: 'R',
  Investigative: 'I',
  Artistic: 'A',
  Social: 'S',
  Enterprising: 'E',
  Conventional: 'C',
  R: 'R',
  I: 'I',
  A: 'A',
  S: 'S',
  E: 'E',
  C: 'C',
}

/**
 * Computes the 6D student RIASEC vector from profile answers (Likert 1-5).
 */
export function computeStudentRiasecVector(profileAnswers: Record<string, number | null>): number[] {
  const sums: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const counts: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  const riasecQuestions = PROFILE_QUESTIONS.filter((q) =>
    q.factor === 'RIASEC' || ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional', 'R', 'I', 'A', 'S', 'E', 'C'].includes(q.type) || ['R', 'I', 'A', 'S', 'E', 'C'].includes(q.factor)
  )

  for (const q of riasecQuestions) {
    const rawScore = profileAnswers[q.id]
    if (rawScore === null || rawScore === undefined) continue

    const dim = TYPE_TO_DIM[q.type] || TYPE_TO_DIM[q.factor] || q.factor[0]
    if (!dim || !['R', 'I', 'A', 'S', 'E', 'C'].includes(dim)) continue

    const score = q.isReversed ? 6 - rawScore : rawScore
    sums[dim] = (sums[dim] || 0) + score
    counts[dim] = (counts[dim] || 0) + 1
  }

  const traits = ['R', 'I', 'A', 'S', 'E', 'C']
  return traits.map((trait) => {
    const count = counts[trait] || 0
    if (count === 0) return 3.0 // Neutral fallback if unanswered
    return parseFloat((sums[trait] / count).toFixed(2))
  })
}

/**
 * Loads or calculates 24 CareerFamily mean centroids from DB.
 */
export async function getFamilyCentroids(dbOverride?: any): Promise<FamilyCentroid[]> {
  const db = dbOverride || prisma

  const families = await db.careerFamily.findMany({
    include: {
      occupations: true,
    },
  })

  return families.map((fam: any) => {
    const occs = fam.occupations || []
    const count = occs.length || 1

    const sumR = occs.reduce((sum: number, o: any) => sum + o.riasecR, 0)
    const sumI = occs.reduce((sum: number, o: any) => sum + o.riasecI, 0)
    const sumA = occs.reduce((sum: number, o: any) => sum + o.riasecA, 0)
    const sumS = occs.reduce((sum: number, o: any) => sum + o.riasecS, 0)
    const sumE = occs.reduce((sum: number, o: any) => sum + o.riasecE, 0)
    const sumC = occs.reduce((sum: number, o: any) => sum + o.riasecC, 0)

    const vector = [
      parseFloat((sumR / count).toFixed(4)),
      parseFloat((sumI / count).toFixed(4)),
      parseFloat((sumA / count).toFixed(4)),
      parseFloat((sumS / count).toFixed(4)),
      parseFloat((sumE / count).toFixed(4)),
      parseFloat((sumC / count).toFixed(4)),
    ]

    return {
      id: fam.id,
      slug: fam.slug,
      name: fam.name,
      stream: fam.stream as 'SCIENCE' | 'COMMERCE' | 'ARTS_HUMANITIES',
      vector,
    }
  })
}

/**
 * Pure 10th-standard RIASEC Stream Recommendation Engine.
 */
export function calculate10thStreamRecommendation(
  studentVector: number[],
  familyCentroids: FamilyCentroid[]
): Recommendation10thResult {
  if (studentVector.length !== 6) {
    throw new Error('Student vector must contain exactly 6 RIASEC dimensions.')
  }

  // Calculate Pearson correlation against all 24 family centroids
  const familyMatches: FamilyMatch[] = familyCentroids.map((fam) => {
    const pearson = calculatePearsonScore(studentVector, fam.vector)
    return {
      familyId: fam.id,
      familyName: fam.name,
      slug: fam.slug,
      stream: fam.stream,
      pearsonR: pearson.r,
      fitPercentage: pearsonToFitPercentage(pearson.r),
    }
  })

  // Check flat profile (zero variance in student vector)
  const meanVal = studentVector.reduce((sum, v) => sum + v, 0) / 6
  const variance = studentVector.reduce((sum, v) => sum + (v - meanVal) ** 2, 0) / 6
  const isFlatProfile = variance === 0

  // Group family matches by stream
  const streams: Array<'SCIENCE' | 'COMMERCE' | 'ARTS_HUMANITIES'> = ['SCIENCE', 'COMMERCE', 'ARTS_HUMANITIES']
  const streamFitResults: Record<string, StreamFitResult> = {}

  for (const stream of streams) {
    const matched = familyMatches.filter((f) => f.stream === stream)
    const sorted = [...matched].sort((a, b) => b.pearsonR - a.pearsonR)
    const top3 = sorted.slice(0, 3)

    const top3PearsonMean = top3.length > 0 ? top3.reduce((sum, f) => sum + f.pearsonR, 0) / top3.length : 0.0
    const clampedPearsonMean = Math.max(-1.0, Math.min(1.0, top3PearsonMean))

    const fitPercentage = isFlatProfile ? 50.0 : pearsonToFitPercentage(clampedPearsonMean)
    const alignmentBand = getAlignmentBand(fitPercentage)
    const info = STREAM_LABEL_MAP[stream]

    streamFitResults[stream] = {
      streamKey: info.key,
      streamLabel: info.label,
      pearsonScore: parseFloat(clampedPearsonMean.toFixed(4)),
      fitPercentage,
      alignmentBand,
      topFamilies: top3,
      allFamilies: sorted,
    }
  }

  // Rank streams descending by fit percentage
  const streamRankings = [
    streamFitResults['SCIENCE'],
    streamFitResults['COMMERCE'],
    streamFitResults['ARTS_HUMANITIES'],
  ].sort((a, b) => b.fitPercentage - a.fitPercentage)

  const topChoice = streamRankings[0]
  const secondChoice = streamRankings[1]

  const scoreDiff = parseFloat((topChoice.fitPercentage - secondChoice.fitPercentage).toFixed(1))
  const isCloseMatch = scoreDiff <= 5.0

  const guidanceNotes: string[] = []

  if (isFlatProfile) {
    guidanceNotes.push(
      'Flat Interest Profile: Your interest scores were equal across all six RIASEC dimensions. All streams present a 50% baseline fit. Explore subjects actively to discover your unique preferences.'
    )
  }

  if (isCloseMatch && !isFlatProfile) {
    guidanceNotes.push(
      `Close Match / Strong Overlap: Your top two streams (${topChoice.streamLabel} at ${topChoice.fitPercentage}% and ${secondChoice.streamLabel} at ${secondChoice.fitPercentage}%) differ by only ${scoreDiff} percentage points, showing versatile potential across both streams.`
    )
  }

  return {
    recommendedStream: topChoice.streamLabel,
    recommendedStreamKey: topChoice.streamKey,
    alternativeStream: secondChoice.streamLabel,
    alternativeStreamKey: secondChoice.streamKey,

    scienceFit: streamFitResults['SCIENCE'].fitPercentage,
    commerceFit: streamFitResults['COMMERCE'].fitPercentage,
    artsFit: streamFitResults['ARTS_HUMANITIES'].fitPercentage,

    scienceStreamResult: streamFitResults['SCIENCE'],
    commerceStreamResult: streamFitResults['COMMERCE'],
    artsStreamResult: streamFitResults['ARTS_HUMANITIES'],

    streamRankings,

    studentRiasecVector: {
      R: studentVector[0],
      I: studentVector[1],
      A: studentVector[2],
      S: studentVector[3],
      E: studentVector[4],
      C: studentVector[5],
    },

    isCloseMatch,
    isFlatProfile,
    guidanceNotes,
  }
}
