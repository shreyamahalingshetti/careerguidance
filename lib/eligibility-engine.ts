import { OnetOccupation, CareerFamily } from '@prisma/client'

export interface EducationalEligibilityInput {
  stream: 'SCIENCE' | 'COMMERCE' | 'ARTS_HUMANITIES'
  hasMath?: boolean
  hasBiology?: boolean
  hasCs?: boolean
  hasPcm?: boolean
  hasPcb?: boolean
}

export type OnetOccupationWithFamily = OnetOccupation & {
  family: CareerFamily
}

/**
 * Educational Eligibility Engine:
 * 1. Enforces HARD stream pre-filtering (Science -> Science pool only; Commerce -> Commerce pool only; Arts -> Arts pool only).
 * 2. Applies direct Indian Class 12th subject prerequisite filters (Mathematics, Biology, CS/IP).
 */
export function filterEligibleOccupations(
  occupations: OnetOccupationWithFamily[],
  input: EducationalEligibilityInput
): OnetOccupationWithFamily[] {
  const normStream = input.stream.toUpperCase()

  const hasMath = input.hasMath ?? input.hasPcm ?? false
  const hasBiology = input.hasBiology ?? input.hasPcb ?? false
  const hasCs = input.hasCs ?? false

  return occupations.filter((occ) => {
    // 1. HARD STREAM PRE-FILTER
    if (occ.family.stream.toUpperCase() !== normStream) {
      return false
    }

    // 2. SCIENCE DIRECT SUBJECT ELIGIBILITY EVALUATION
    if (normStream === 'SCIENCE') {
      if (occ.requiresMath && !hasMath) return false
      if (occ.requiresBiology && !hasBiology) return false
      if (occ.requiresCs && !hasCs) return false
    }

    // 3. COMMERCE / ARTS MATHEMATICS PREREQUISITE
    if (normStream !== 'SCIENCE') {
      if (occ.requiresMath && !hasMath) return false
    }

    return true
  })
}
