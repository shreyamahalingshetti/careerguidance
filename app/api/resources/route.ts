/**
 * Learning Resources API Route
 * =============================
 * GET /api/resources?topics=Recursion,Binary Trees
 *
 * Returns curated learning resource links for each weak topic.
 * Used by the roadmap quiz results to show recommended resources.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getResourcesForTopics } from '@/lib/resource-recommender'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topicsParam = searchParams.get('topics') || ''

    if (!topicsParam.trim()) {
      return NextResponse.json({ resources: [], message: 'No topics provided' })
    }

    // Split comma-separated topics and trim whitespace
    const topics = topicsParam
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    // Generate resource links for each topic
    const resources = getResourcesForTopics(topics)

    return NextResponse.json({ resources, count: resources.length })
  } catch (error) {
    console.error('Resources API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resources', resources: [] },
      { status: 500 }
    )
  }
}
