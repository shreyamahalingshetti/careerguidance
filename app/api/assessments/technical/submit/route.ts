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
import { TECHNICAL_QUESTIONS } from '@/lib/technical-questions'
import {
  calculateTechnicalDomainRecommendations,
  computeStudentRiasecVector,
} from '@/lib/recommendation-technical'

const submitSchema = z.object({
  assessmentId: z.string().min(1).optional(),
  standard: z.string().min(1).default('technical-group'),
  region: z.string().min(1).default('na'),
  timeExpired: z.boolean().default(false),
  // questionId (R1..C3) -> 1..5, null means skipped
  profileAnswers: z.record(z.string(), z.number().int().nullable()).default({}),
  recommendedDomain: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const data = submitSchema.parse(body)

    const assessmentId = data.assessmentId

    const profileAnswers: Record<string, number | null> = {}
    for (const q of TECHNICAL_QUESTIONS) {
      const v = data.profileAnswers[q.id]
      profileAnswers[q.id] = v === undefined ? null : v
    }

    const recResult = calculateTechnicalDomainRecommendations(profileAnswers)
    const riasecAverages = recResult.studentRiasecVector
    const domainScores = recResult.fitPercentages
    const top = recResult.rankedDomains[0]
    const second = recResult.rankedDomains[1]

    const confidence = Math.round(top.fitPercentage)
    const flexibility = Math.round(top.fitPercentage - (second?.fitPercentage ?? 0))

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date()
      let assessment: any = null

      if (assessmentId) {
        assessment = await tx.assessment.findFirst({ where: { id: assessmentId, userId: user.id } })

        if (assessment) {
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
        data: TECHNICAL_QUESTIONS.map((q) => ({
          assessmentId: assessment.id,
          questionId: q.id,
          questionType: 'profile',
          answerValue: profileAnswers[q.id],
        })),
      })

      const profileRows: Array<{ factor: string; averageScore: number; percentage: number }> = Object.entries(riasecAverages).map(
        ([k, avg]) => ({
          factor: `RIASEC_${k}`,
          averageScore: avg,
          percentage: avg > 0 ? parseFloat((((avg - 1) / 4) * 100).toFixed(1)) : 0,
        })
      )

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
          scienceFit: recResult.fitPercentages['fullstack'] ?? 50.0,
          commerceFit: recResult.fitPercentages['datascience'] ?? 50.0,
          artsFit: recResult.fitPercentages['cybersecurity'] ?? 50.0,
          recommendedStream: top.name,
          confidence,
          flexibility,
        },
      })

      return {
        assessmentId: assessment.id,
        finalScore,
        riasecAverages,
        domainScores: recResult.fitPercentages,
        recommendation: recResult,
      }
    }, {
      maxWait: 15000,
      timeout: 30000,
    })

    if (user.email) {
      try {
        const domainRecs = recResult.rankedDomains.map((r) => `<li>${r.name}: ${r.fitPercentage}% Fit</li>`).join('')
        const riasecList = Object.entries(riasecAverages).map(([k, v]) => `<li>${k}: ${(v as number).toFixed(2)}</li>`).join('')

        await sendEmail({
          to: user.email!,
          subject: 'Your Technical Career Assessment Report 📊',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
              <h2 style="color: #2563eb;">Technical Career Report</h2>
              <p>Hi ${user.name || 'there'},</p>
              <p>Your technical profile has been analyzed based on Pearson correlation matching against O*NET technical centroids. Here are your results:</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Top Recommended Specialization</h3>
                <p style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 5px 0;">${top.name}</p>
                <p>Interest Alignment: <strong>${confidence}% Fit</strong> | Path Flexibility: <strong>${flexibility}%</strong></p>
              </div>

              <h3>Technical Domain Match Rankings</h3>
              <ul>${domainRecs}</ul>

              <h3>6D RIASEC Interest Vector</h3>
              <ul>${riasecList}</ul>

              <p>Visit your dashboard to explore the learning roadmap for <strong>${top.name}</strong>.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">This is an automated vocational interest report from your Career Guidance App.</p>
            </div>
          `,
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

