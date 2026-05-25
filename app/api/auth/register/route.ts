// User Registration API Route
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-helpers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    
    if (existingUser) {
      return errorResponse('User with this email already exists', 409)
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    
    // Create user (default role: STUDENT)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })
    
    return successResponse(
      { message: 'User registered successfully', user },
      201
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Registration error:', error)
    return errorResponse('Failed to register user', 500)
  }
}