import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const progressSchema = z.object({
  pathway: z.string().min(1),
  nodeId: z.string().min(1),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  passed: z.boolean()
})

// GET user's progress for a specific pathway
export async function GET(request: NextRequest) {
  try {
    const userSession = await getAuthenticatedUser()
    if (!userSession || !userSession.email) return unauthorizedResponse()

    const realUser = await prisma.user.findUnique({
      where: { email: userSession.email }
    })
    
    if (!realUser) {
      return successResponse({ progress: [] }) // Return empty if user missing in DB but has session
    }

    const { searchParams } = new URL(request.url)
    const pathway = searchParams.get('pathway')

    if (!pathway) {
      return errorResponse('Pathway is required', 400)
    }

    const progress = await prisma.roadmapProgress.findMany({
      where: {
        userId: realUser.id,
        pathway: pathway
      }
    })

    return successResponse({ progress })
  } catch (error) {
    console.error('Failed to fetch roadmap progress:', error)
    return errorResponse('Internal server error', 500)
  }
}

// POST to save progress (upsert if highest score)
export async function POST(request: NextRequest) {
  try {
    const userSession = await getAuthenticatedUser()
    if (!userSession || !userSession.email) return unauthorizedResponse()

    // Find real user by email to avoid P2003 foreign key issues with stale sessions
    const realUser = await prisma.user.findUnique({
      where: { email: userSession.email }
    })
    
    if (!realUser) {
      return errorResponse('User record not found in database', 404)
    }

    const body = await request.json()
    const data = progressSchema.parse(body)

    // Check if progress already exists
    const existing = await prisma.roadmapProgress.findUnique({
      where: {
        userId_pathway_nodeId: {
          userId: realUser.id,
          pathway: data.pathway,
          nodeId: data.nodeId
        }
      }
    })

    let savedProgress

    if (existing) {
      // Only update if the new score is higher
      if (data.score > existing.score) {
        savedProgress = await prisma.roadmapProgress.update({
          where: { id: existing.id },
          data: {
            score: data.score,
            total: data.total,
            passed: data.passed
          }
        })
      } else {
        // Keep existing
        savedProgress = existing
      }
    } else {
      // Create new progress
      savedProgress = await prisma.roadmapProgress.create({
        data: {
          userId: realUser.id,
          pathway: data.pathway,
          nodeId: data.nodeId,
          score: data.score,
          total: data.total,
          passed: data.passed
        }
      })
    }

    return successResponse({ progress: savedProgress })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input', 400)
    }
    console.error('Failed to save roadmap progress:', error)
    return errorResponse('Internal server error', 500)
  }
}
