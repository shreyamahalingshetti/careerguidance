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
import {
  APTITUDE_QUESTIONS,
  PROFILE_QUESTIONS,
  type IAptitudeQuestion,
  type IProfileQuestion,
} from '@/lib/constants'

const submitSchema = z.object({
  assessmentId: z.string().min(1).optional(),
  standard: z.string().min(1).default('10th-standard'),
  region: z.enum(['north', 'south']).default('south'),
  timeExpired: z.boolean().default(false),
  aptitudeAnswers: z.record(z.string(), z.number().int().nullable()).default({}),
  profileAnswers: z.record(z.string(), z.number().int().nullable()).default({}),
})

function computeAptitudeScores(aptitudeAnswers: Record<string, number | null>) {
  const correctCounts: Record<string, number> = {}
  const totalCounts: Record<string, number> = {}

  for (const q of APTITUDE_QUESTIONS) {
    totalCounts[q.section] = (totalCounts[q.section] || 0) + 1
    const answer = aptitudeAnswers[q.id]
    if (answer !== null && answer !== undefined && answer === q.answerIndex) {
      correctCounts[q.section] = (correctCounts[q.section] || 0) + 1
    }
  }

  const breakdown: Record<string, number> = {}
  for (const section of Object.keys(totalCounts)) {
    const correct = correctCounts[section] || 0
    const total = totalCounts[section] || 1
    breakdown[section] = Math.round((correct / total) * 100)
  }

  return {
    breakdown,
    rows: Object.keys(totalCounts).map((section) => {
      const correct = correctCounts[section] || 0
      const total = totalCounts[section] || 0
      const percentage = breakdown[section] || 0
      return { section, correctCount: correct, totalQuestions: total, percentage }
    }),
  }
}

function computeProfileScores(profileAnswers: Record<string, number | null>) {
  const factorSums: Record<string, number> = {}
  const factorCounts: Record<string, number> = {}

  for (const q of PROFILE_QUESTIONS) {
    const rawScore = profileAnswers[q.id]
    if (rawScore === null || rawScore === undefined) continue

    const finalScore = q.isReversed ? 6 - rawScore : rawScore
    factorSums[q.type] = (factorSums[q.type] || 0) + finalScore
    factorCounts[q.type] = (factorCounts[q.type] || 0) + 1
  }

  const types = Array.from(new Set(PROFILE_QUESTIONS.map((q) => q.type)))
  const breakdown: Record<string, number> = {}
  const rows = types.map((type) => {
    const sum = factorSums[type] || 0
    const count = factorCounts[type] || 0

    const averageScore = count > 0 ? sum / count : 0
    const percentage = count > 0 ? parseFloat((((averageScore - 1) / 4) * 100).toFixed(1)) : 0

    breakdown[type] = percentage

    return { factor: type, averageScore, percentage }
  })

  return { breakdown, rows }
}

function computeFinal(aptitudeBreakdown: Record<string, number>, profileBreakdown: Record<string, number>) {
  const scienceFit = (aptitudeBreakdown['Numerical'] || 0) * 0.4 + (profileBreakdown['Investigative'] || 0) * 0.3
  const commerceFit = (aptitudeBreakdown['Numerical'] || 0) * 0.3 + (profileBreakdown['Conventional'] || 0) * 0.4
  const artsFit = (aptitudeBreakdown['Verbal'] || 0) * 0.45 + (profileBreakdown['Artistic'] || 0) * 0.4

  const scores = [
    { name: 'science', label: 'Science', score: scienceFit, flex: 90 },
    { name: 'commerce', label: 'Commerce', score: commerceFit, flex: 70 },
    { name: 'arts', label: 'Arts/Humanities', score: artsFit, flex: 60 },
  ].sort((a, b) => b.score - a.score)

  const top = scores[0]

  return {
    scienceFit,
    commerceFit,
    artsFit,
    recommendedStream: top.label,
    confidence: Math.min(100, Math.round(top.score)),
    flexibility: top.flex,
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const data = submitSchema.parse(body)

    const assessmentId = data.assessmentId

    const aptitudeAnswers: Record<string, number | null> = {}
    for (const q of APTITUDE_QUESTIONS) {
      const v = data.aptitudeAnswers[q.id]
      aptitudeAnswers[q.id] = v === undefined ? null : v
    }

    const profileAnswers: Record<string, number | null> = {}
    for (const q of PROFILE_QUESTIONS) {
      const v = data.profileAnswers[q.id]
      profileAnswers[q.id] = v === undefined ? null : v
    }

    const { breakdown: aptitudeBreakdown, rows: aptitudeRows } = computeAptitudeScores(aptitudeAnswers)
    const { breakdown: profileBreakdown, rows: profileRows } = computeProfileScores(profileAnswers)
    const final = computeFinal(aptitudeBreakdown, profileBreakdown)

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date()

      let assessment = null as any

      if (assessmentId) {
        assessment = await tx.assessment.findFirst({
          where: { id: assessmentId, userId: user.id },
        })

        if (assessment) {
          // Sequential deletes are safer in Prisma transactions
          await tx.assessmentAnswer.deleteMany({ where: { assessmentId } })
          await tx.aptitudeScore.deleteMany({ where: { assessmentId } })
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
          // If an unknown/stale assessmentId is provided, create a new attempt instead of failing.
          // We try to use the provided id to keep the client stable, but fall back to default id on error.
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

      const answersToCreate = [
        ...APTITUDE_QUESTIONS.map((q: IAptitudeQuestion) => ({
          assessmentId: assessment.id,
          questionId: q.id,
          questionType: 'aptitude',
          answerValue: aptitudeAnswers[q.id],
        })),
        ...PROFILE_QUESTIONS.map((q: IProfileQuestion) => ({
          assessmentId: assessment.id,
          questionId: q.id,
          questionType: 'profile',
          answerValue: profileAnswers[q.id],
        })),
      ]

      await tx.assessmentAnswer.createMany({ data: answersToCreate })
      await tx.aptitudeScore.createMany({
        data: aptitudeRows.map((r) => ({
          assessmentId: assessment.id,
          section: r.section,
          correctCount: r.correctCount,
          totalQuestions: r.totalQuestions,
          percentage: r.percentage,
        })),
      })
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
          scienceFit: final.scienceFit,
          commerceFit: final.commerceFit,
          artsFit: final.artsFit,
          recommendedStream: final.recommendedStream,
          confidence: final.confidence,
          flexibility: final.flexibility,
        },
      })

      return {
        assessmentId: assessment.id,
        finalScore,
        aptitudeBreakdown,
        profileBreakdown,
      }
    }, {
      maxWait: 15000,
      timeout: 30000,
    })

    console.log('10th assessment save success:', result.assessmentId)

    // Send assessment report email
    if (user.email) {
      try {
        const aptList = aptitudeRows.map(r => `<li>${r.section}: ${r.percentage}% (${r.correctCount}/${r.totalQuestions})</li>`).join('')
        const profList = profileRows.map(r => `<li>${r.factor}: ${r.percentage}%</li>`).join('')
        
        await sendEmail({
          to: user.email!,
          subject: "Your 10th Standard Career Assessment Report 📊",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
              <h2 style="color: #2563eb;">Career Assessment Report</h2>
              <p>Hi ${user.name || 'there'},</p>
              <p>Congratulations on completing your career assessment! Here is your detailed breakdown:</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Top Recommendation</h3>
                <p style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 5px 0;">${final.recommendedStream}</p>
                <p>Confidence Level: <strong>${final.confidence}%</strong></p>
              </div>

              <h3>Aptitude Scores</h3>
              <ul>${aptList}</ul>

              <h3>Profile Dimensions (Personality)</h3>
              <ul>${profList}</ul>

              <p>Visit your dashboard to explore detailed roadmaps for your recommended stream.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">This is an automated report from your Career Guidance App.</p>
            </div>
          `
        })
      } catch (e) {
        console.error('Failed to send 10th assessment email:', e)
      }
    }

    return successResponse(result, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0]?.message || 'Invalid input', 400)
    }
    console.error('10th assessment submit error details:', error)
    return errorResponse('Failed to save assessment results: ' + (error instanceof Error ? error.message : 'Unknown error'), 500)
  }
}
