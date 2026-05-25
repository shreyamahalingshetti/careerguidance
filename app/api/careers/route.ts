// Careers API Route - CRUD operations for career profiles
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-helpers'
import { z } from 'zod'

// Career validation schema
const careerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  category: z.string().min(1, 'Category is required').max(100),
  salaryRange: z.string().max(100).optional().nullable(),
  education: z.string().max(200).optional().nullable(),
  skills: z.string().min(1, 'Skills are required').max(500),
  growth: z.string().max(200).optional().nullable(),
})

// GET - List all careers with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skills: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Category filter
    if (category) {
      where.category = category
    }

    // Fetch careers with pagination
    const [careers, total] = await Promise.all([
      prisma.career.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
        },
      }),
      prisma.career.count({ where }),
    ])

    return successResponse({
      careers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get careers error:', error)
    return errorResponse('Failed to fetch careers', 500)
  }
}

// POST - Create a new career (Admin/Counselor only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    // Only ADMIN and COUNSELOR can create careers
    if (user.role !== 'ADMIN' && user.role !== 'COUNSELOR') {
      return errorResponse('Only admins and counselors can create careers', 403)
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = careerSchema.parse(body)
    
    // Create career
    const career = await prisma.career.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        salaryRange: validatedData.salaryRange || null,
        education: validatedData.education || null,
        skills: validatedData.skills,
        growth: validatedData.growth || null,
      },
    })

    return successResponse(
      { message: 'Career created successfully', career },
      201
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Create career error:', error)
    return errorResponse('Failed to create career', 500)
  }
}

