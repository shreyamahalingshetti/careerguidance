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
import { PROFILE_QUESTIONS, type IProfileQuestion } from '@/lib/constants'
import { calculate12thCareerRecommendations } from '@/lib/family-scoring-engine'

const submitSchema = z.object({
  assessmentId: z.string().min(1).optional(),
  standard: z.string().min(1).default('12th-standard'),
  stream: z.string().min(1).default('science'),
  region: z.string().optional(), // legacy fallback
  hasMath: z.boolean().default(false),
  hasBiology: z.boolean().default(false),
  hasCs: z.boolean().default(false),
  hasPcm: z.boolean().default(false),
  hasPcb: z.boolean().default(false),
  timeExpired: z.boolean().default(false),
  profileAnswers: z.record(z.string(), z.number().int().nullable()).default({}),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const data = submitSchema.parse(body)

    // Normalize stream
    const rawStream = (data.stream || data.region || 'science').toLowerCase()
    let streamEnum: 'SCIENCE' | 'COMMERCE' | 'ARTS_HUMANITIES' = 'SCIENCE'
    if (rawStream.includes('commerce')) streamEnum = 'COMMERCE'
    else if (rawStream.includes('arts') || rawStream.includes('humanities')) streamEnum = 'ARTS_HUMANITIES'

    // 1. Run Official O*NET Recommendation Engine (Stream Isolation -> Eligibility -> Pearson -> Family MAX Scoring)
    const pipelineResult = await calculate12thCareerRecommendations({
      stream: streamEnum,
      hasMath: data.hasMath || data.hasPcm,
      hasBiology: data.hasBiology || data.hasPcb,
      hasCs: data.hasCs,
      hasPcm: data.hasPcm,
      hasPcb: data.hasPcb,
      profileAnswers: data.profileAnswers,
    })

    const top1 = pipelineResult.top3Families[0]
    const top2 = pipelineResult.top3Families[1]

    const confidence = top1 ? top1.familyScore : 50
    const flexibility = top1 && top2 ? Math.max(0, top1.familyScore - top2.familyScore) : 10

    // 2. Persist to Database via Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date()
      let assessment: any = null
      const assessmentId = data.assessmentId

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
              region: streamEnum.toLowerCase(),
              completed: true,
              timeExpired: data.timeExpired,
              completedAt: now,
            },
          })
        } else {
          assessment = await tx.assessment.create({
            data: {
              userId: user.id,
              standard: data.standard,
              region: streamEnum.toLowerCase(),
              completed: true,
              timeExpired: data.timeExpired,
              completedAt: now,
            },
          })
        }
      } else {
        assessment = await tx.assessment.create({
          data: {
            userId: user.id,
            standard: data.standard,
            region: streamEnum.toLowerCase(),
            completed: true,
            timeExpired: data.timeExpired,
            completedAt: now,
          },
        })
      }

      // Save raw assessment answers
      const answersToCreate = PROFILE_QUESTIONS.map((q: IProfileQuestion) => ({
        assessmentId: assessment.id,
        questionId: q.id,
        questionType: q.factor === 'RIASEC' ? 'profile' : 'ocean',
        answerValue: data.profileAnswers[q.id] ?? null,
      }))
      await tx.assessmentAnswer.createMany({ data: answersToCreate })

      // Save Profile Scores for 6 RIASEC factors
      const riasecEntries = Object.entries(pipelineResult.studentRiasecVector)
      await tx.profileScore.createMany({
        data: riasecEntries.map(([factor, avgScore]) => ({
          assessmentId: assessment.id,
          factor,
          averageScore: avgScore,
          percentage: parseFloat((((avgScore - 1) / 4) * 100).toFixed(1)),
        })),
      })

      // Save Final Score
      const finalScore = await tx.finalScore.create({
        data: {
          assessmentId: assessment.id,
          scienceFit: streamEnum === 'SCIENCE' ? (top1?.familyScore ?? 0) : 0,
          commerceFit: streamEnum === 'COMMERCE' ? (top1?.familyScore ?? 0) : 0,
          artsFit: streamEnum === 'ARTS_HUMANITIES' ? (top1?.familyScore ?? 0) : 0,
          recommendedStream: top1?.familyName ?? 'Unknown',
          confidence,
          flexibility,
        },
      })

      return {
        assessmentId: assessment.id,
        finalScore,
        pipelineResult,
      }
    }, {
      maxWait: 15000,
      timeout: 30000,
    })

    // 3. Send Assessment Report Email
    if (user.email) {
      try {
        const familyListHtml = pipelineResult.top3Families.map(f => 
          `<li><strong>${f.familyName} (${f.familyScore}% Match):</strong> Top Match: ${f.topOccupations[0]?.title ?? 'N/A'} (${f.topOccupations[0]?.matchScore ?? 0}%)</li>`
        ).join('')

        await sendEmail({
          to: user.email,
          subject: "Your Official O*NET 12th Career Assessment Report 📊",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
              <h2 style="color: #2563eb;">12th Standard O*NET Career Report</h2>
              <p>Hi ${user.name || 'there'},</p>
              <p>Your career assessment for the <strong>${streamEnum}</strong> stream has been calculated using official O*NET 31.0 occupational data and Pearson correlation matching.</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Top Recommendation</h3>
                <p style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 5px 0;">${top1?.familyName || 'Engineering'}</p>
                <p>Family Score (Strongest Eligible Occupation): <strong>${confidence}%</strong></p>
              </div>

              <h3>Top 3 Career Families</h3>
              <ul>${familyListHtml}</ul>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Automated report from your Career Guidance Platform.</p>
            </div>
          `
        })
      } catch (e) {
        console.error('Failed to send 12th assessment email:', e)
      }
    }

    return successResponse({
      assessmentId: result.assessmentId,
      selectedStream: pipelineResult.selectedStream,
      studentRiasecVector: pipelineResult.studentRiasecVector,
      isFlatProfile: pipelineResult.isFlatProfile,
      top3Families: pipelineResult.top3Families,
    }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0]?.message || 'Invalid input', 400)
    }
    console.error('12th assessment submit error details:', error)
    return errorResponse('Failed to save assessment results: ' + (error instanceof Error ? error.message : 'Unknown error'), 500)
  }
}
