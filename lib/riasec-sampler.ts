/**
 * Utility function to sample a balanced set of RIASEC questions.
 * Groups input question pool by RIASEC trait (R, I, A, S, E, C)
 * and randomly selects exactly `itemsPerTrait` (default: 3) from each trait group.
 * Returns a total of (6 * itemsPerTrait) questions (default: 18 questions).
 */
export function sampleRiasecQuestions<T extends { id: string; type?: string; factor?: string; trait?: string }>(
  pool: T[],
  itemsPerTrait: number = 3
): T[] {
  const traits = ['R', 'I', 'A', 'S', 'E', 'C']
  const selected: T[] = []

  const getTrait = (q: T): string => {
    if (q.trait && ['R', 'I', 'A', 'S', 'E', 'C'].includes(q.trait)) return q.trait
    if (q.id) {
      const prefix = q.id[0].toUpperCase()
      if (['R', 'I', 'A', 'S', 'E', 'C'].includes(prefix)) return prefix
    }
    if (q.type) {
      const firstLetter = q.type[0].toUpperCase()
      if (['R', 'I', 'A', 'S', 'E', 'C'].includes(firstLetter)) return firstLetter
    }
    return ''
  }

  for (const t of traits) {
    const traitItems = pool.filter((q) => getTrait(q) === t)
    // Fisher-Yates or random shuffle
    const shuffled = [...traitItems].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, Math.min(itemsPerTrait, shuffled.length))
    selected.push(...picked)
  }

  return selected
}
