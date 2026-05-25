import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

// GET /api/assessments/latest?standard=10th-standard
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const standard = request.nextUrl.searchParams.get('standard') || undefined

    const assessment = await prisma.assessment.findFirst({
      where: {
        userId: user.id,
        ...(standard ? { standard } : {}),
        completed: true,
      },
      orderBy: { completedAt: 'desc' },
      include: {
        finalScore: true,
        aptitudeScores: { orderBy: { section: 'asc' } },
        profileScores: { orderBy: { factor: 'asc' } },
      },
    })

    if (!assessment) {
      return successResponse({ assessment: null })
    }

    return successResponse({ assessment })
  } catch (error) {
    console.error('Get latest assessment error:', error)
    return errorResponse('Failed to fetch latest assessment', 500)
  }
}
