export interface PearsonResult {
  r: number
  matchScore: number
  isFlatProfile: boolean
}

/**
 * Calculates the Pearson correlation coefficient r between a 6D Student RIASEC vector
 * and a 6D O*NET Occupation RIASEC vector.
 *
 * Match Score (%) = Math.round(50 + 50 * r)
 * Zero Variance Rule: If stdDev(Student) === 0 or stdDev(Occupation) === 0, r = 0.0 -> Match Score = 50%.
 */
export function calculatePearsonScore(
  studentVector: number[],
  occupationVector: number[]
): PearsonResult {
  if (studentVector.length !== 6 || occupationVector.length !== 6) {
    throw new Error('Pearson calculation requires 6D RIASEC vectors.')
  }

  const meanS = studentVector.reduce((sum, val) => sum + val, 0) / 6
  const meanO = occupationVector.reduce((sum, val) => sum + val, 0) / 6

  let num = 0
  let denS = 0
  let denO = 0

  for (let i = 0; i < 6; i++) {
    const diffS = studentVector[i] - meanS
    const diffO = occupationVector[i] - meanO

    num += diffS * diffO
    denS += diffS * diffS
    denO += diffO * diffO
  }

  // Zero-Variance Rule (Flat profile)
  if (denS === 0 || denO === 0) {
    return {
      r: 0.0,
      matchScore: 50,
      isFlatProfile: denS === 0, // Flag if student profile has zero variance
    }
  }

  const r = num / (Math.sqrt(denS) * Math.sqrt(denO))
  // Bound r to [-1.0, 1.0] to prevent floating point inaccuracies
  const clampedR = Math.max(-1.0, Math.min(1.0, r))
  const matchScore = Math.round(50 + 50 * clampedR)

  return {
    r: parseFloat(clampedR.toFixed(4)),
    matchScore,
    isFlatProfile: false,
  }
}
