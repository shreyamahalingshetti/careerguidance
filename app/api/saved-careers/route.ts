// Saved Careers API Route - Bookmark careers
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const saveCareerSchema = z.object({
  careerId: z.string().min(1, 'Career ID is required'),
  notes: z.string().max(1000).optional().nullable(),
})

// GET - Get user's saved careers
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const savedCareers = await prisma.savedCareer.findMany({
      where: { userId: user.id },
      include: {
        career: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({ savedCareers })
  } catch (error) {
    console.error('Get saved careers error:', error)
    return errorResponse('Failed to fetch saved careers', 500)
  }
}

// POST - Save a career
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = saveCareerSchema.parse(body)

    // Check if career exists
    const career = await prisma.career.findUnique({
      where: { id: validatedData.careerId },
    })

    if (!career) {
      return errorResponse('Career not found', 404)
    }

    // Check if already saved
    const existing = await prisma.savedCareer.findUnique({
      where: {
        userId_careerId: {
          userId: user.id,
          careerId: validatedData.careerId,
        },
      },
    })

    if (existing) {
      return errorResponse('Career already saved', 409)
    }

    const savedCareer = await prisma.savedCareer.create({
      data: {
        userId: user.id,
        careerId: validatedData.careerId,
        notes: validatedData.notes || null,
      },
      include: {
        career: true,
      },
    })

    return successResponse(
      { message: 'Career saved successfully', savedCareer },
      201
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Save career error:', error)
    return errorResponse('Failed to save career', 500)
  }
}

// DELETE - Remove saved career
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const searchParams = request.nextUrl.searchParams
    const careerId = searchParams.get('careerId')

    if (!careerId) {
      return errorResponse('Career ID is required', 400)
    }

    await prisma.savedCareer.deleteMany({
      where: {
        userId: user.id,
        careerId: careerId,
      },
    })

    return successResponse({ message: 'Career removed from saved list' })
  } catch (error) {
    console.error('Delete saved career error:', error)
    return errorResponse('Failed to remove saved career', 500)
  }
}

