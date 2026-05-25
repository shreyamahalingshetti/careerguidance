import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')

  if (!videoId) {
    return Response.json({ error: 'videoId required' }, { status: 400 })
  }

  try {
    const { YoutubeTranscript } = await import('youtube-transcript')
    const transcript = await YoutubeTranscript.fetchTranscript(videoId)
    // Join all text, limit to ~6000 chars so downstream models don't overflow
    const text = transcript
      .map((t: any) => t.text)
      .join(' ')
      .slice(0, 6000)

    return Response.json({ transcript: text })
  } catch (err) {
    console.error('Could not fetch transcript:', err)
    return Response.json({ error: 'Could not fetch transcript' }, { status: 500 })
  }
}
