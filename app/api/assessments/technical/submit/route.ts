import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers'
import { sendEmail } from '@/lib/mailer'

const submitSchema = z.object({
  assessmentId: z.string().min(1).optional(),
  standard: z.string().min(1).default('technical-group'),
  region: z.string().min(1).default('na'),
  timeExpired: z.boolean().default(false),
  // questionId -> 1..5, null means skipped
  profileAnswers: z.record(z.string(), z.number().int().nullable()).default({}),
  recommendedDomain: z.string().nullable().optional(),
})

type Question = {
  id: number
  riasec: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
  ocean: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness'
}

const QUESTIONS: Question[] = [
  { id: 1, riasec: 'R', ocean: 'openness' },
  { id: 2, riasec: 'R', ocean: 'conscientiousness' },
  { id: 3, riasec: 'R', ocean: 'conscientiousness' },
  { id: 4, riasec: 'R', ocean: 'openness' },
  { id: 5, riasec: 'R', ocean: 'conscientiousness' },
  { id: 6, riasec: 'R', ocean: 'conscientiousness' },

  { id: 7, riasec: 'I', ocean: 'openness' },
  { id: 8, riasec: 'I', ocean: 'openness' },
  { id: 9, riasec: 'I', ocean: 'openness' },
  { id: 10, riasec: 'I', ocean: 'openness' },
  { id: 11, riasec: 'I', ocean: 'openness' },
  { id: 12, riasec: 'I', ocean: 'openness' },

  { id: 13, riasec: 'A', ocean: 'openness' },
  { id: 14, riasec: 'A', ocean: 'openness' },
  { id: 15, riasec: 'A', ocean: 'openness' },
  { id: 16, riasec: 'A', ocean: 'openness' },
  { id: 17, riasec: 'A', ocean: 'openness' },
  { id: 18, riasec: 'A', ocean: 'openness' },

  { id: 19, riasec: 'S', ocean: 'agreeableness' },
  { id: 20, riasec: 'S', ocean: 'agreeableness' },
  { id: 21, riasec: 'S', ocean: 'agreeableness' },
  { id: 22, riasec: 'S', ocean: 'agreeableness' },
  { id: 23, riasec: 'S', ocean: 'agreeableness' },
  { id: 24, riasec: 'S', ocean: 'agreeableness' },

  { id: 25, riasec: 'E', ocean: 'conscientiousness' },
  { id: 26, riasec: 'E', ocean: 'conscientiousness' },
  { id: 27, riasec: 'E', ocean: 'conscientiousness' },
  { id: 28, riasec: 'E', ocean: 'extraversion' },

  { id: 29, riasec: 'I', ocean: 'openness' },
  { id: 30, riasec: 'I', ocean: 'openness' },

  { id: 31, riasec: 'C', ocean: 'conscientiousness' },
  { id: 32, riasec: 'R', ocean: 'conscientiousness' },
  { id: 33, riasec: 'S', ocean: 'extraversion' },
]

const DOMAIN_PROFILES = {
  datascience: { name: 'Data Science', riasecMatch: ['I', 'R', 'E'] as const },
  aiml: { name: 'AI/ML Engineering', riasecMatch: ['I', 'R', 'A'] as const },
  cybersecurity: { name: 'Cybersecurity', riasecMatch: ['R', 'I', 'E'] as const },
  fullstack: { name: 'Full Stack Development', riasecMatch: ['R', 'A', 'S'] as const },
  devops: { name: 'DevOps & Cloud', riasecMatch: ['R', 'E', 'I'] as const },
  cloudarchitect: { name: 'Cloud Architecture', riasecMatch: ['R', 'E', 'I'] as const },
}

type ScoreSummary = {
  riasecAverages: Record<string, number>
  oceanPercentages: Record<string, number>
}

function computeScores(profileAnswers: Record<string, number | null>): ScoreSummary {
  const riasecSums: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const riasecCounts: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  const oceanSums: Record<string, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
  }
  const oceanCounts: Record<string, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
  }

  for (const q of QUESTIONS) {
    const v = profileAnswers[String(q.id)]
    if (v === null || v === undefined) continue

    riasecSums[q.riasec] += v
    riasecCounts[q.riasec] += 1

    oceanSums[q.ocean] += v
    oceanCounts[q.ocean] += 1
  }

  const riasecAverages: Record<string, number> = {}
  for (const k of Object.keys(riasecSums)) {
    const count = riasecCounts[k] || 0
    riasecAverages[k] = count > 0 ? riasecSums[k] / count : 0
  }

  const oceanPercentages: Record<string, number> = {}
  for (const k of Object.keys(oceanSums)) {
    const count = oceanCounts[k] || 0
    const avg = count > 0 ? oceanSums[k] / count : 0
    oceanPercentages[k] = count > 0 ? parseFloat((((avg - 1) / 4) * 100).toFixed(1)) : 0
  }

  return { riasecAverages, oceanPercentages }
}

function computeDomainRanking(riasecAverages: Record<string, number>) {
  const domainScores: Record<string, number> = {}

  for (const [domain, profile] of Object.entries(DOMAIN_PROFILES)) {
    let score = 0
    for (const t of profile.riasecMatch) {
      score += riasecAverages[t] || 0
    }
    domainScores[domain] = score
  }

  const rankedDomains = Object.entries(domainScores)
    .sort(([, a], [, b]) => b - a)
    .map(([domain, score]) => ({
      domain,
      name: DOMAIN_PROFILES[domain as keyof typeof DOMAIN_PROFILES].name,
      score,
    }))

  return { domainScores, rankedDomains }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const data = submitSchema.parse(body)

    const assessmentId = data.assessmentId

    const profileAnswers: Record<string, number | null> = {}
    for (const q of QUESTIONS) {
      const v = data.profileAnswers[String(q.id)]
      profileAnswers[String(q.id)] = v === undefined ? null : v
    }

    const { riasecAverages, oceanPercentages } = computeScores(profileAnswers)
    const { domainScores, rankedDomains } = computeDomainRanking(riasecAverages)

    const top = rankedDomains[0]
    const second = rankedDomains[1]

    const total = rankedDomains.reduce((s, r) => s + (r.score || 0), 0) || 1
    const topPercent = ((top?.score ?? 0) / total) * 100
    const secondPercent = ((second?.score ?? 0) / total) * 100

    const confidence = Math.min(100, Math.max(0, Math.round(topPercent)))
    const flexibility = Math.min(100, Math.max(0, Math.round(topPercent - secondPercent)))

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date()

      let assessment: any = null

      if (assessmentId) {
        assessment = await tx.assessment.findFirst({ where: { id: assessmentId, userId: user.id } })

        if (assessment) {
          // Sequential deletes are safer in Prisma transactions on Windows
          await tx.assessmentAnswer.deleteMany({ where: { assessmentId } })
          await tx.profileScore.deleteMany({ where: { assessmentId } })
          await tx.finalScore.deleteMany({ where: { assessmentId } })

          assessment = await tx.assessment.update({
            where: { id: assessmentId },
            data: {
              standard: data.standard,
              region: data.region,
              completed: true,
              timeExpired: data.timeExpired,
              completedAt: now,
            },
          })
        } else {
          try {
            assessment = await tx.assessment.create({
              data: {
                id: assessmentId,
                userId: user.id,
                standard: data.standard,
                region: data.region,
                completed: true,
                timeExpired: data.timeExpired,
                completedAt: now,
              },
            })
          } catch {
            assessment = await tx.assessment.create({
              data: {
                userId: user.id,
                standard: data.standard,
                region: data.region,
                completed: true,
                timeExpired: data.timeExpired,
                completedAt: now,
              },
            })
          }
        }
      } else {
        assessment = await tx.assessment.create({
          data: {
            userId: user.id,
            standard: data.standard,
            region: data.region,
            completed: true,
            timeExpired: data.timeExpired,
            completedAt: now,
          },
        })
      }

      await tx.assessmentAnswer.createMany({
        data: QUESTIONS.map((q) => ({
          assessmentId: assessment.id,
          questionId: String(q.id),
          questionType: 'profile',
          answerValue: profileAnswers[String(q.id)],
        })),
      })

      // Store RIASEC averages as "averageScore" and also store OCEAN as percentage.
      // This keeps the schema stable while still letting the UI show marks.
      const profileRows: Array<{ factor: string; averageScore: number; percentage: number }> = [
        ...Object.entries(riasecAverages).map(([k, avg]) => ({
          factor: `RIASEC_${k}`,
          averageScore: avg,
          percentage: avg > 0 ? parseFloat((((avg - 1) / 4) * 100).toFixed(1)) : 0,
        })),
        ...Object.entries(oceanPercentages).map(([k, pct]) => ({
          factor: `OCEAN_${k}`,
          averageScore: (pct / 100) * 4 + 1,
          percentage: pct,
        })),
      ]

      await tx.profileScore.createMany({
        data: profileRows.map((r) => ({
          assessmentId: assessment.id,
          factor: r.factor,
          averageScore: r.averageScore,
          percentage: r.percentage,
        })),
      })

      const finalScore = await tx.finalScore.create({
        data: {
          assessmentId: assessment.id,
          scienceFit: ((rankedDomains[0]?.score ?? 0) / total) * 100,
          commerceFit: ((rankedDomains[1]?.score ?? 0) / total) * 100,
          artsFit: ((rankedDomains[2]?.score ?? 0) / total) * 100,
          recommendedStream: top?.name ?? data.recommendedDomain ?? 'Unknown',
          confidence,
          flexibility,
        },
      })

      return {
        assessmentId: assessment.id,
        finalScore,
        riasecAverages,
        oceanPercentages,
        domainScores,
      }
    }, {
      maxWait: 15000,
      timeout: 30000,
    })

    // Dispatch Ocean RIASEC report email
    if (user.email) {
      try {
        const domainRecs = rankedDomains.slice(0, 3).map(r => `<li>${r.name}: ${r.score.toFixed(1)}</li>`).join('')
        const riasecList = Object.entries(result.riasecAverages).map(([k,v]) => `<li>${k}: ${(v as number).toFixed(1)}</li>`).join('')
        const oceanList = Object.entries(result.oceanPercentages).map(([k,v]) => `<li>${k}: ${v}%</li>`).join('')
          
        await sendEmail({
          to: user.email!,
          subject: "Your Technical Career Assessment Report 📊",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
              <h2 style="color: #2563eb;">Technical Career Report</h2>
              <p>Hi ${user.name || 'there'},</p>
              <p>Your technical profile has been analyzed based on the OCEAN and RIASEC models. Here are your results:</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Top Recommended Domain</h3>
                <p style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 5px 0;">${top?.name || 'Technical'}</p>
                <p>Confidence: <strong>${confidence}%</strong> | Path Flexibility: <strong>${flexibility}%</strong></p>
              </div>

              <h3>Domain Recommendations</h3>
              <ul>${domainRecs}</ul>

              <h3>RIASEC Model Scores (Interests)</h3>
              <ul>${riasecList}</ul>

              <h3>OCEAN Percentages (Personality)</h3>
              <ul>${oceanList}</ul>

              <p>Visit your dashboard to explore the learning roadmap for <strong>${top?.name}</strong>.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">This is an automated report from your Career Guidance App.</p>
            </div>
          `
        })
      } catch (e) {
        console.error('Failed to send technical assessment email:', e)
      }
    }

    return successResponse(result, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0]?.message || 'Invalid input', 400)
    }
    console.error('technical assessment submit error details:', error)
    return errorResponse('Failed to save assessment results: ' + (error instanceof Error ? error.message : 'Unknown error'), 500)
  }
}
