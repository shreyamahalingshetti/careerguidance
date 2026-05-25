export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const topic = searchParams.get('topic')
    const rawLimit = Number(searchParams.get('limit') || 8)
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), 12)
      : 8
    const pageToken = searchParams.get('pageToken') || ''

    if (!topic) {
      return Response.json({ error: 'No topic provided' }, { status: 400 })
    }

    const queryMap: Record<string, string> = {
      HTML: 'HTML full course beginner',
      CSS: 'CSS full course flexbox grid',
      JavaScript: 'JavaScript complete tutorial',
      React: 'React full course beginner',
      'Node.js': 'Node js backend tutorial',
      PostgreSQL: 'PostgreSQL full course',
      Git: 'Git and GitHub tutorial',
    }

    const query = queryMap[topic] || `${topic} tutorial`
    const fetchSize = Math.min(Math.max(limit * 2, 10), 25)

    const youtubeUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    youtubeUrl.searchParams.set('part', 'snippet')
    youtubeUrl.searchParams.set('q', query)
    youtubeUrl.searchParams.set('type', 'video')
    youtubeUrl.searchParams.set('maxResults', String(fetchSize))
    youtubeUrl.searchParams.set('order', 'relevance')
    youtubeUrl.searchParams.set('key', process.env.YOUTUBE_API_KEY || '')

    if (pageToken) {
      youtubeUrl.searchParams.set('pageToken', pageToken)
    }

    const res = await fetch(youtubeUrl.toString(), { cache: 'no-store' })

    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch videos' }, { status: 502 })
    }

    const data = await res.json()
    const items = Array.isArray(data?.items) ? data.items : []

    const videos = items
      .map((item: any) => ({
        title: item?.snippet?.title,
        videoId: item?.id?.videoId,
      }))
      .filter(
        (item: { title?: string; videoId?: string }) =>
          Boolean(item.title && item.videoId),
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)

    return Response.json({
      videos,
      nextPageToken: data?.nextPageToken || null,
    })
  } catch (err) {
    return Response.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}