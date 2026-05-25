// Career API Route - Get, Update, Delete individual career
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-helpers'
import { z } from 'zod'

// Career update validation schema
const careerUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  category: z.string().min(1).max(100).optional(),
  salaryRange: z.string().max(100).optional().nullable(),
  education: z.string().max(200).optional().nullable(),
  skills: z.string().min(1).max(500).optional(),
  growth: z.string().max(200).optional().nullable(),
})

// GET - Get a single career by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const career = await prisma.career.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        salaryRange: true,
        education: true,
        skills: true,
        growth: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!career) {
      return errorResponse('Career not found', 404)
    }

    return successResponse({ career })
  } catch (error) {
    console.error('Get career error:', error)
    return errorResponse('Failed to fetch career', 500)
  }
}

// PATCH - Update a career (Admin/Counselor only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    // Only ADMIN and COUNSELOR can update careers
    if (user.role !== 'ADMIN' && user.role !== 'COUNSELOR') {
      return errorResponse('Only admins and counselors can update careers', 403)
    }

    const existingCareer = await prisma.career.findUnique({
      where: { id: params.id },
    })

    if (!existingCareer) {
      return errorResponse('Career not found', 404)
    }

    const body = await request.json()
    const validatedData = careerUpdateSchema.parse(body)
    
    const career = await prisma.career.update({
      where: { id: params.id },
      data: validatedData,
    })

    return successResponse({
      message: 'Career updated successfully',
      career,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Update career error:', error)
    return errorResponse('Failed to update career', 500)
  }
}

// DELETE - Delete a career (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    // Only ADMIN can delete careers
    if (user.role !== 'ADMIN') {
      return errorResponse('Only admins can delete careers', 403)
    }

    const existingCareer = await prisma.career.findUnique({
      where: { id: params.id },
    })

    if (!existingCareer) {
      return errorResponse('Career not found', 404)
    }

    await prisma.career.delete({
      where: { id: params.id },
    })

    return successResponse({
      message: 'Career deleted successfully',
    })
  } catch (error) {
    console.error('Delete career error:', error)
    return errorResponse('Failed to delete career', 500)
  }
}

