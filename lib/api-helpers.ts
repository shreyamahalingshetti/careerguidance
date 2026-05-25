// API Helper functions for error handling and validation

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return null
  }
  return session.user
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

