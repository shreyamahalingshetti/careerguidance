import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type ChatBody = {
  message?: string
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
}

function normalizeApiKey(raw: string | undefined) {
  if (!raw) return ''
  let apiKey = raw.trim().replace(/^['"]|['"]$/g, '')
  if (apiKey.includes(' ')) apiKey = apiKey.split(' ')[0]
  return apiKey
}

function getGeminiApiKey() {
  // Support common env var names users may set.
  return (
    normalizeApiKey(process.env.GEMINI_API_KEY) ||
    normalizeApiKey((process.env as any).gemini_api_key) ||
    normalizeApiKey(process.env.GOOGLE_API_KEY)
  )
}

function buildLocalReply(transcript: string) {
  const lastUserLine = transcript
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .reverse()
    .find((line) => line.toLowerCase().startsWith('user:'))

  const raw = (lastUserLine ? lastUserLine.slice(5) : transcript).trim()
  const text = raw.toLowerCase()

  const is10th = /\b10(th)?\b|\bclass\s*10\b|\bstd\s*10\b/.test(text)
  const is12th = /\b12(th)?\b|\bclass\s*12\b|\bstd\s*12\b/.test(text)

  const subjects: string[] = []
  if (/\bmaths?\b/.test(text)) subjects.push('Maths')
  if (/\bscience\b/.test(text)) subjects.push('Science')
  if (/\bsocial\b|\bsst\b|\bsocial studies\b/.test(text)) subjects.push('Social Science')
  if (/\benglish\b/.test(text)) subjects.push('English')
  if (/\bhindi\b/.test(text)) subjects.push('Hindi')
  if (/\bkannada\b/.test(text)) subjects.push('Kannada')
  if (/\bcomputer\b|\bcoding\b|\bcs\b/.test(text)) subjects.push('Computer')

  const level = is10th ? '10th' : is12th ? '12th' : 'school'
  const subjectLine = subjects.length ? `I see you mentioned: ${subjects.join(', ')}.` : ''

  // Give a useful, ChatGPT-like response even when AI is unavailable.
  if (level === '10th') {
    const streamSuggestion = subjects.some((s) => s === 'Maths' || s === 'Science' || s === 'Computer')
      ? 'Science or a Technical/CS-focused path'
      : subjects.some((s) => s === 'Social Science' || s === 'English')
        ? 'Arts/Humanities or Commerce (depending on interest in business)'
        : 'Science/Commerce/Arts based on your interest'

    return [
      `Got it — you’re in 10th. ${subjectLine}`.trim(),
      '',
      'Here’s a quick direction:',
      `- Likely best-fit stream: ${streamSuggestion}`,
      '- If you like Maths + Social Science: Commerce (Economics/Business Studies) is also a strong combo.',
      '',
      'To personalize this properly, answer 2 things:',
      '1) Your approximate marks/grade range (or Maths & Social marks out of 100)',
      '2) What you enjoy more: (A) problem-solving/tech, (B) business/finance, (C) history/politics/law, (D) design/creative',
      '',
      'Next steps you can do this week:',
      '- Try 2 sample chapters: Basic Accounting (Commerce) + Intro to Programming (CS) and see which feels easier.',
      '- Make a shortlist of 3 careers you’re curious about; I’ll map stream → subjects → exams → roadmap.',
    ]
      .filter(Boolean)
      .join('\n')
  }

  if (level === '12th') {
    return [
      `Thanks — you’re in 12th. ${subjectLine}`.trim(),
      '',
      'Tell me your stream (PCM/PCB/Commerce/Arts) + your target (college/job/exam), and I’ll give:',
      '- Best-fit options',
      '- Exams to focus',
      '- A 30-day plan',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return [
    `Thanks! ${subjectLine}`.trim(),
    '',
    'Tell me:',
    '- Are you in 10th or 12th?',
    '- Your top 2 strongest subjects',
    '- One thing you enjoy (tech/business/creative/helping people)',
    '',
    'I’ll suggest the best stream + 3 career paths + next steps.',
  ]
    .filter(Boolean)
    .join('\n')
}

export async function POST(req: Request) {
  try {
    const apiKey = getGeminiApiKey()

    const body = (await req.json().catch(() => ({}))) as ChatBody

    const userMessage = (body?.message ?? '').toString().trim()
    const messages = Array.isArray(body?.messages) ? body.messages : []

    const transcript = userMessage
      ? `User: ${userMessage}`
      : messages
          .filter((m) => m && typeof m.content === 'string')
          .map((m) => `${m.role === 'assistant' ? 'Assistant' : m.role === 'system' ? 'System' : 'User'}: ${m.content}`)
          .join('\n')

    if (!transcript.trim()) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    // If Gemini isn't configured, still return a message-specific helpful reply.
    if (!apiKey) {
      return NextResponse.json({ reply: buildLocalReply(transcript), mode: 'local-fallback' })
    }

    const system =
      `You are a ChatGPT-style career guidance assistant for Indian students. ` +
      `Be clear, structured, and practical. Ask 1-2 clarifying questions if needed. ` +
      `Prefer bullet points, short headings, and a concrete next-steps plan. Avoid fluff.`

    const prompt = `${system}\n\nConversation:\n${transcript}\n\nAssistant:`

    let reply = ''

    // Prefer SDK (installed), fall back to REST if needed.
    try {
      const genai = (await import('@google/genai').catch(() => null)) as any
      const ClientCandidates = [
        genai?.GoogleGenAI,
        genai?.default?.GoogleGenAI,
        genai?.default,
        genai?.createClient,
        genai?.default?.createClient,
      ]
      let ai: any = null
      for (const Candidate of ClientCandidates) {
        if (!Candidate) continue
        try {
          if (typeof Candidate === 'function') {
            try {
              ai = new Candidate({ apiKey })
              break
            } catch {
              ai = Candidate({ apiKey })
              break
            }
          }
        } catch {
          // keep trying
        }
      }

      if (ai?.models?.generateContent) {
        const resp = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0.6, maxOutputTokens: 600 },
        })
        reply =
          resp?.text ||
          resp?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') ||
          ''
      }
    } catch {
      // ignore and fall back
    }

    if (!reply.trim()) {
      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`

      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
        }),
      })

      if (!geminiRes.ok) {
        const raw = await geminiRes.text().catch(() => '')
        return NextResponse.json(
          {
            reply: buildLocalReply(transcript),
            mode: 'local-fallback',
            error: `Gemini request failed (${geminiRes.status})`,
            details: raw.slice(0, 2000),
          },
          { status: 200 },
        )
      }

      const data = (await geminiRes.json()) as any
      reply =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') ?? ''
    }

    if (!reply.trim()) {
      return NextResponse.json({
        reply: buildLocalReply(transcript),
        mode: 'local-fallback',
        error: 'Empty AI response',
      })
    }

    return NextResponse.json({ reply })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Unexpected error', details: err?.message ?? String(err) },
      { status: 500 },
    )
  }
}