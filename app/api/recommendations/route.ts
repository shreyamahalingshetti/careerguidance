// Recommendations API Route
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

// GET - Get recommendations for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const isRead = searchParams.get('isRead')
    const skip = (page - 1) * limit

    const where: any = { userId: user.id }
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true'
    }

    const [recommendations, total] = await Promise.all([
      prisma.recommendation.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.recommendation.count({ where }),
    ])

    return successResponse({
      recommendations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get recommendations error:', error)
    return errorResponse('Failed to fetch recommendations', 500)
  }
}

