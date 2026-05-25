import { Prisma } from '@prisma/client'

export type RecommendedCareerInput = {
  title: string
  description?: string | null
  category?: string | null
  skills?: string | null
  notes?: string | null
}

function normalizeTitle(title: string) {
  return (title || '')
    .replace(/\r\n/g, '\n')
    .trim()
    .replace(/^[-*\d\s).]+/, '')
    .trim()
}

function clampText(text: string, maxLen: number) {
  const t = (text || '').trim()
  if (!t) return ''
  return t.length <= maxLen ? t : t.slice(0, maxLen - 1).trimEnd() + '…'
}

export async function persistRecommendedCareersForUser(args: {
  prisma: Prisma.TransactionClient
  userId: string
  careers: RecommendedCareerInput[]
  defaults: {
    category: string
    skills: string
    notes?: string
  }
}) {
  const { prisma, userId, careers, defaults } = args

  const uniqueByTitle = new Map<string, RecommendedCareerInput>()
  for (const c of careers) {
    const normalized = normalizeTitle(c.title)
    if (!normalized) continue
    uniqueByTitle.set(normalized.toLowerCase(), { ...c, title: normalized })
  }

  const uniqueCareers = Array.from(uniqueByTitle.values())

  let createdCount = 0
  let savedCount = 0
  const careerIds: string[] = []

  for (const c of uniqueCareers) {
    const title = normalizeTitle(c.title)
    if (!title) continue

    const existing = await prisma.career.findFirst({
      where: {
        title: { equals: title, mode: 'insensitive' },
      },
    })

    const description = clampText(
      c.description || `Recommended career path for ${defaults.category}.`,
      2000,
    )
    const category = clampText(c.category || defaults.category, 100)
    const skills = clampText(c.skills || defaults.skills, 500)

    const career =
      existing ??
      (await prisma.career.create({
        data: {
          title: clampText(title, 200),
          description: description || `Recommended career path for ${defaults.category}.`,
          category: category || defaults.category,
          skills: skills || defaults.skills,
          salaryRange: null,
          education: null,
          growth: null,
        },
      }))

    if (!existing) createdCount += 1
    careerIds.push(career.id)

    const notes = clampText(c.notes || defaults.notes || '', 1000)

    await prisma.savedCareer.upsert({
      where: {
        userId_careerId: {
          userId,
          careerId: career.id,
        },
      },
      create: {
        userId,
        careerId: career.id,
        notes: notes || null,
      },
      update: {
        // Only fill notes if we have something meaningful and existing notes are empty
        ...(notes
          ? {
              notes,
            }
          : {}),
      },
    })

    savedCount += 1
  }

  return {
    createdCount,
    savedCount,
    careerIds,
  }
}
