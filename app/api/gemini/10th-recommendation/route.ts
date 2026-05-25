import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-helpers'
import { persistRecommendedCareersForUser } from '@/lib/persist-recommended-careers'

export const runtime = 'nodejs'

type RecommendationRequest = {
  streamKey: 'science' | 'commerce' | 'arts'
  streamLabel: string
  confidence: number
  flexibility: number
  region: 'north' | 'south'
  aptitudeBreakdown: Record<string, number>
  profileBreakdown: Record<string, number>
  // If true (default), persist recommended careers into careers + saved_careers for the user.
  persistToSavedCareers?: boolean
}

function extractRecommendedCareersFromRecommendation(text: string): Array<{ title: string; description: string }>
{
  const normalized = (text || '').replace(/\r\n/g, '\n')
  const startIdx = normalized.search(/^Recommended Careers\s*$/m)
  const endIdx = normalized.search(/^Exams to Prepare\s*$/m)
  if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) return []

  const section = normalized.slice(startIdx, endIdx)
  const lines = section
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => l.toLowerCase() !== 'recommended careers')

  const items: Array<{ title: string; description: string }> = []
  let current: { title: string; description: string } | null = null

  for (const line of lines) {
    const dashIdx = line.indexOf(' — ')
    if (dashIdx > 0) {
      if (current) items.push(current)
      const title = line.slice(0, dashIdx).trim()
      const desc = line.slice(dashIdx + 3).trim()
      current = { title, description: desc }
      continue
    }

    // Continuation line for previous career item
    if (current) {
      current.description = `${current.description}${current.description ? ' ' : ''}${line}`.trim()
    }
  }

  if (current) items.push(current)
  return items
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

function asRecordOfNumbers(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = clampNumber(v, 0, 100, 0)
  }
  return out
}

function countWords(text: string): number {
  return (text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length
}

function hasRequiredHeadings(text: string): boolean {
  const t = (text || '').replace(/\r\n/g, '\n')
  const required = [
    /^Top Clusters$/m,
    /^Recommended Careers$/m,
    /^Exams to Prepare$/m,
    /^Courses & Skills$/m,
    /^Next Steps$/m,
  ]
  return required.every((re) => re.test(t))
}

function normalizeText(text: string): string {
  return (text || '').replace(/\r\n/g, '\n').trim()
}

function withResultingStreamLine(streamPretty: string, text: string): string {
  const body = normalizeText(text)
  return `Resulting Stream: ${streamPretty}\n\n${body}`
}

function truncateToMaxWords(text: string, maxWords: number): string {
  const words = (text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  if (words.length <= maxWords) return normalizeText(text)
  const truncated = words.slice(0, maxWords).join(' ')
  // Ensure it ends cleanly.
  return normalizeText(truncated.replace(/[,;:]?\s*$/g, '.'))
}

function enforceWordRange(text: string, minWords: number, maxWords: number): string {
  let out = normalizeText(text)
  let wc = countWords(out)

  if (wc < minWords) {
    const fillerSentences = [
      'Focus on building daily consistency rather than studying in long, stressful bursts.',
      'Choose resources that match your board syllabus first, then add entrance-level practice gradually.',
      'Ask for feedback regularly—teachers, mentors, and mock tests help you improve faster.',
    ]
    let i = 0
    while (wc < minWords && i < fillerSentences.length) {
      out = normalizeText(out + `\n${fillerSentences[i]}`)
      wc = countWords(out)
      i += 1
    }
  }

  if (wc > maxWords) {
    out = truncateToMaxWords(out, maxWords)
  }

  return out
}

function buildFallbackRecommendation(args: {
  streamKey: 'science' | 'commerce' | 'arts'
  streamPretty: string
  confidence: number
  regionLabel: string
}): string {
  const { streamKey, streamPretty, confidence, regionLabel } = args

  const baseByStream: Record<typeof streamKey, string> = {
    science:
      `The Analytical Explorer: Building Solutions, Breaking Boundaries!\n\n` +
      `Namaste! Based on your answers, ${streamPretty} looks like a strong match for you. Your result suggests comfort with logic, curiosity to understand “how things work,” and the patience to improve through practice. With consistent study habits and the right coaching/resources in ${regionLabel}, you can keep multiple options open after 12th.\n\n` +
      `Top Clusters\n` +
      `STEM Problem Solving — You learn best by experimenting, calculating, and testing ideas.\n` +
      `Health & Life Sciences — You can stay focused and detail-oriented in high-stakes learning.\n` +
      `Design & Applied Creativity — You can turn concepts into practical, real-world solutions.\n\n` +
      `Recommended Careers\n` +
      `Engineer (B.E./B.Tech) — Build products and infrastructure in fields like CSE, ECE, Mechanical, Civil. Typical path: PCM in 11th–12th, then entrance exams and engineering degree.\n` +
      `Doctor / Allied Health — MBBS, BDS, Nursing, Physiotherapy, or Lab Technology. Path: PCB (or PCMB), strong biology + chemistry, then medical/allied programs.\n` +
      `Data & AI (after UG) — Work with data, coding, and analytics in many industries. Path: strong math + Python foundations, then CS/Stats/Engineering routes.\n` +
      `Research Scientist — Explore physics/chemistry/biology and research labs. Path: B.Sc. → M.Sc./PhD, plus internships and projects.\n` +
      `Pharmacist / Biotech — Medicines, formulations, biotech labs, and healthcare industry. Path: PCB/PCMB, then B.Pharm/Biotech and practical lab exposure.\n` +
      `Architect — Combine math with creativity to design spaces. Path: PCM, aptitude practice, then architecture degree.\n\n` +
      `Exams to Prepare\n` +
      `JEE (Main/Advanced) — Engineering admissions in many top institutes.\n` +
      `NEET — Medical and many allied health admissions.\n` +
      `KCET/State CET — State-level engineering/medical-related admissions (where applicable).\n` +
      `IAT/IISER — Research-oriented science programs and institutes.\n` +
      `NATA — Architecture aptitude for B.Arch.\n\n` +
      `Courses & Skills\n` +
      `Python Basics — Builds coding confidence for science, engineering, and data.\n` +
      `Math Foundations — Algebra, functions, and problem-solving speed for entrances.\n` +
      `Lab Skills — Observation, note-taking, and safety habits for practical subjects.\n` +
      `Basic Electronics/Robotics — Hands-on learning that strengthens concepts.\n` +
      `Scientific Writing — Helps with projects, reports, and presentations.\n` +
      `Time Management — Improves consistency for long prep cycles.\n` +
      `Mock Tests — Trains accuracy and reduces exam stress.\n\n` +
      `Next Steps\n` +
      `Talk to your parents/teachers about choosing PCM, PCB, or PCMB based on interest.\n` +
      `Pick 2–3 target careers and map the subjects needed for them.\n` +
      `Start a weekly routine: concepts → practice questions → review mistakes.\n` +
      `Do one small project each month (science model, coding mini-app, or lab log).\n` +
      `Collect past papers and begin light mock tests early.\n` +
      `Keep a “doubt notebook” and clear doubts every week.`
      ,
    commerce:
      `The Strategic Organizer: Growing Value, Leading with Numbers!\n\n` +
      `Namaste! Your answers point toward ${streamPretty} as a practical and promising path. This stream suits students who like structured learning, planning, and understanding how money, business, and markets work. With steady practice—especially in accounting and quantitative basics—you can build a strong foundation in ${regionLabel}.\n\n` +
      `Top Clusters\n` +
      `Business & Finance — You can think in terms of value, costs, and outcomes.\n` +
      `Operations & Organization — You handle routines, accuracy, and follow-through well.\n` +
      `People & Communication — You can explain ideas clearly and work in teams.\n\n` +
      `Recommended Careers\n` +
      `Chartered Accountant (CA) — Audit, taxation, and financial reporting. Path: Commerce in 11th–12th, then CA Foundation → Intermediate → Articleship.\n` +
      `Company Secretary (CS) — Corporate law, compliance, and governance. Path: Commerce + communication skills, then CSEET/CS program steps.\n` +
      `Finance & Banking — Roles in banks, insurance, and investment services. Path: B.Com/BBA/BMS, internships, and role-specific certifications.\n` +
      `Business Management — Strategy, HR, marketing, and operations. Path: BBA/BBM then MBA (optional), plus practical projects and internships.\n` +
      `Business/Data Analyst (after UG) — Use Excel/data tools to support decisions. Path: strong basics in math + spreadsheets, then analytics learning.\n` +
      `Entrepreneur / E-commerce — Build a small business, online brand, or service. Path: start small, learn budgeting, marketing, and customer handling.\n\n` +
      `Exams to Prepare\n` +
      `CUET (UG) — Admissions for many commerce/management programs.\n` +
      `CA Foundation — Entry step toward the CA qualification.\n` +
      `CSEET — Entry test for the Company Secretary track.\n` +
      `CMA Foundation — Entry step for cost and management accounting.\n` +
      `IPMAT — Integrated management programs (IIM route).\n\n` +
      `Courses & Skills\n` +
      `Accounting Basics — Journal, ledger, and financial statements.\n` +
      `Excel/Google Sheets — Essential for analysis and reporting.\n` +
      `Business Communication — Email, presentations, and confidence in interviews.\n` +
      `Financial Literacy — Budgeting, saving, investing, and responsible credit.\n` +
      `Economics Fundamentals — Demand-supply, inflation, and market behavior.\n` +
      `Quant Aptitude — Improves speed for entrance tests and aptitude rounds.\n` +
      `Basics of Digital Marketing — Helps in internships and entrepreneurship.\n\n` +
      `Next Steps\n` +
      `Choose Commerce subjects and build daily practice in accounting/quant.\n` +
      `Keep a simple monthly budget and track expenses to learn money habits.\n` +
      `Start Excel practice: formulas, charts, and basic data cleaning.\n` +
      `Explore CA/CS/CMA paths and talk to a mentor about timelines.\n` +
      `Do one mini-project: a business plan, market survey, or stock mock-portfolio.\n` +
      `Aim for consistent marks; commerce rewards accuracy and revision.`
      ,
    arts:
      `The Insightful Storyteller: Creating Meaning, Influencing Minds!\n\n` +
      `Namaste! Your profile aligns well with ${streamPretty}. This stream fits students who enjoy communication, understanding people and society, and expressing ideas with clarity. If you keep reading, writing, and staying curious about real-world issues in ${regionLabel}, you can build a strong base for many respected careers.\n\n` +
      `Top Clusters\n` +
      `Communication & Media — You can express ideas, observe details, and tell stories well.\n` +
      `People & Psychology — You show empathy and interest in how people think and behave.\n` +
      `Law, Policy & Society — You can reason, debate, and build balanced opinions.\n\n` +
      `Recommended Careers\n` +
      `Lawyer (LLB) — Advocacy, corporate law, and public interest work. Path: Humanities/any stream in 12th, then law entrance and LLB.\n` +
      `Journalist / Mass Communication — Reporting, content, media production, and PR. Path: BA/BMM/Journalism programs plus writing portfolio and internships.\n` +
      `Psychologist / Counsellor — Support mental wellbeing and learning needs. Path: BA/BSc Psychology → higher studies/training, plus supervised practice.\n` +
      `Designer (NIFT/NID/UX) — Visual design, fashion, product, or digital experiences. Path: build portfolio, learn tools, then design programs.\n` +
      `Civil Services (long-term) — Administration and public leadership. Path: graduation first, then UPSC/state prep with strong current affairs.\n` +
      `Teacher / Social Sector — Teaching, NGO work, and community development. Path: BA/B.Ed or social-work routes with field exposure.\n\n` +
      `Exams to Prepare\n` +
      `CUET (UG) — Admissions to many BA and humanities programs.\n` +
      `CLAT — National Law Universities and law admissions.\n` +
      `NID DAT — Design admissions for product/communication design.\n` +
      `NIFT — Fashion and design programs.\n` +
      `UPSC (later) — Civil services after graduation; start reading habits early.\n\n` +
      `Courses & Skills\n` +
      `Writing & Speaking — Essays, debates, and clear communication.\n` +
      `Current Affairs — Daily reading and note-making builds awareness.\n` +
      `Basic Psychology — Improves understanding of people and careers.\n` +
      `Design Tools — Canva/Figma basics for portfolio building.\n` +
      `Research Methods — Learn to verify sources and structure arguments.\n` +
      `Media Literacy — Understand how news and social media influence opinions.\n` +
      `Interview Skills — Helps in admissions and scholarships.\n\n` +
      `Next Steps\n` +
      `Choose Humanities subjects that match your interests (language, psychology, economics, etc.).\n` +
      `Build a weekly habit: reading + writing + a short speaking practice.\n` +
      `Create a small portfolio: articles, posters, videos, or case studies.\n` +
      `Explore 2–3 careers and talk to someone working in them.\n` +
      `Start light exam prep early (aptitude, reading speed, writing clarity).\n` +
      `Stay consistent; long-term careers reward discipline and curiosity.`
      ,
  }

  const confidenceLine =
    confidence >= 75
      ? `Your result confidence is strong, so you can commit and go deeper.`
      : confidence >= 55
        ? `Your result confidence is moderate, so explore a couple of options before locking in.`
        : `Your result confidence is still forming, so keep options open and refine through practice.`

  let text = `Resulting Stream: ${streamPretty}\n\n${baseByStream[streamKey]}\n\n${confidenceLine}`
  text = normalizeText(text)

  // Keep within 300–350 words strictly.
  return enforceWordRange(text, 300, 350)
}

class GeminiHttpError extends Error {
  status: number
  details: string

  constructor(status: number, details: string) {
    super(`Gemini request failed (${status})`)
    this.status = status
    this.details = details
  }
}

export async function POST(req: Request) {
  try {
    let apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      apiKey = apiKey.trim().replace(/^['"]|['"]$/g, '')
      // If someone pasted multiple keys or extra tokens, keep the first token.
      if (apiKey.includes(' ')) apiKey = apiKey.split(' ')[0]
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY. Add it to .env.local and restart the dev server.' },
        { status: 500 },
      )
    }

    if (apiKey.includes(' ') || (apiKey.match(/AIza[^\s]*/g) || []).length > 1) {
      return NextResponse.json(
        {
          error:
            'Server configuration error: GEMINI_API_KEY appears malformed or contains multiple keys. Please check your .env.',
        },
        { status: 500 },
      )
    }

    const body = (await req.json()) as Partial<RecommendationRequest>

    const streamKey = body.streamKey
    if (streamKey !== 'science' && streamKey !== 'commerce' && streamKey !== 'arts') {
      return NextResponse.json({ error: 'Invalid streamKey' }, { status: 400 })
    }

    const region = body.region
    if (region !== 'north' && region !== 'south') {
      return NextResponse.json({ error: 'Invalid region' }, { status: 400 })
    }

    const streamLabel = (body.streamLabel ?? '').toString().trim() || streamKey
    const confidence = clampNumber(body.confidence, 0, 100, 0)
    const flexibility = clampNumber(body.flexibility, 0, 100, 0)

    const aptitudeBreakdown = asRecordOfNumbers(body.aptitudeBreakdown)
    const profileBreakdown = asRecordOfNumbers(body.profileBreakdown)

    const streamPretty =
      streamKey === 'science' ? 'Science' : streamKey === 'commerce' ? 'Commerce' : 'Arts/Humanities'

    const regionLabel = region === 'north' ? 'North Karnataka' : 'South Karnataka'

    const personaHeadlineByStream: Record<RecommendationRequest['streamKey'], string[]> = {
      science: [
        'The Analytical Explorer: Building Solutions, Breaking Boundaries!',
        'The Curious Problem-Solver: Turning Questions into Discoveries!',
      ],
      commerce: [
        'The Strategic Organizer: Growing Value, Leading with Numbers!',
        'The Practical Planner: Making Smart Decisions, Creating Impact!',
      ],
      arts: [
        'The Creative Investigator: Shaping Stories, Unveiling Truths!',
        'The Insightful Storyteller: Creating Meaning, Influencing Minds!',
      ],
    }

    const headlineChoices = personaHeadlineByStream[streamKey]
    const personaHeadline = headlineChoices[(confidence + flexibility) % headlineChoices.length]

    const streamExamsHint: Record<RecommendationRequest['streamKey'], string> = {
      science:
        'Examples: JEE (engineering), NEET (medicine), KCET (Karnataka), IISER/IAT (research), NATA (architecture). Only include what fits the careers you recommend.',
      commerce:
        'Examples: CUET (UG admissions in many universities), CA Foundation, CS Executive (after 12th), CMA Foundation, CLAT (law if interested), IPMAT (IIM integrated). Only include what fits the careers you recommend.',
      arts:
        'Examples: UPSC (civil services), CUET (UG admissions), CLAT (law), NID/NIFT (design), mass-comm admissions tests where relevant. Only include what fits the careers you recommend.',
    }

    const streamCoursesHint: Record<RecommendationRequest['streamKey'], string> = {
      science:
        'Include foundational courses/projects: Python basics, problem-solving, lab skills, math for science, basic robotics/electronics, science communication.',
      commerce:
        'Include foundational courses/projects: accounting basics, Excel/Sheets, business communication, financial literacy, basic economics, entrepreneurship, data basics.',
      arts:
        'Include foundational courses/projects: writing & communication, current affairs, psychology basics, design tools, research methods, public speaking, basic media literacy.',
    }

    const prompt =
      `You are a warm, motivating Indian career counsellor for a 10th-pass student.\n` +
      `Your job is to write an "AI Recommendation" in the SAME STYLE as the example below, but tailored to the student's result data.\n\n` +
      `STUDENT RESULT DATA:\n` +
      `- Recommended stream: ${streamPretty} (original label: ${streamLabel})\n` +
      `- Confidence: ${confidence}/100\n` +
      `- Flexibility: ${flexibility}/100\n` +
      `- Region: ${region === 'north' ? 'North Karnataka' : 'South Karnataka'}\n` +
      `- Aptitude breakdown (0-100): ${JSON.stringify(aptitudeBreakdown)}\n` +
      `- Profile traits (0-100): ${JSON.stringify(profileBreakdown)}\n\n` +
      `STYLE GUIDE (follow this structure and tone exactly):\n` +
      `1) Start with a persona headline in Title Case ending with an exclamation, like:\n` +
      `   "The Creative Investigator: Shaping Stories, Unveiling Truths!"\n` +
      `2) Next paragraph starts with "Namaste!" and briefly summarizes why the student fits the stream (1 short paragraph).\n` +
      `3) Then sections with these exact headings and formatting:\n` +
      `   Top Clusters\n` +
      `   <Cluster Name> — <1-2 lines explaining trait/aptitude match>\n\n` +
      `   Recommended Careers\n` +
      `   <Career 1> — <2-3 lines description; typical pathway in India>\n` +
      `   <Career 2> — ... (give 5-7 careers)\n\n` +
      `   Exams to Prepare\n` +
      `   <Exam> — <what it is for, 1 line> (give 4-6 items)\n\n` +
      `   Courses & Skills\n` +
      `   <Course/Skill> — <why it helps, 1 line> (give 6-8 items)\n\n` +
      `   Next Steps\n` +
      `   <actionable step> (give 5-7 bullets as plain lines; no numbering needed)\n\n` +
      `4) Keep language supportive. No guarantees. No policy discussion.\n` +
      `5) Be stream-specific: Only recommend careers/exams/courses that fit ${streamPretty}.\n` +
      `   Exams hint: ${streamExamsHint[streamKey]}\n` +
      `   Courses hint: ${streamCoursesHint[streamKey]}\n\n` +
      `HARD CONSTRAINTS (do not violate):\n` +
      `- Include ALL headings exactly: Top Clusters, Recommended Careers, Exams to Prepare, Courses & Skills, Next Steps.\n` +
      `- Recommended Careers: 5 to 7 items, each 2-3 lines (not 1 line).\n` +
      `- Exams to Prepare: 4 to 6 items.\n` +
      `- Courses & Skills: 6 to 8 items.\n` +
      `- Next Steps: 5 to 7 lines.\n` +
      `- Total length: 300 to 350 words (target). Minimum 300 words. If you are short, expand descriptions until you reach the minimum.\n` +
      `- Try not to exceed 380 words.\n\n` +
      `Now write the final recommendation.\n` +
      `Use this persona headline for this student: "${personaHeadline}"\n`

    const MIN_WORDS = 300
    const TOKEN_BUDGET = 1700

    const generateOnce = async (promptText: string): Promise<string> => {
      // Prefer using the installed SDK (more resilient across API changes), then fall back to raw REST.
      let recommendation = ''

      // --- SDK path (@google/genai) ---
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

        // Call the model using whichever method exists in this SDK version.
        if (ai?.models?.generateContent) {
          const resp = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            config: { temperature: 0.6, maxOutputTokens: TOKEN_BUDGET },
          })
          recommendation =
            (resp?.text ||
              resp?.candidates?.[0]?.content?.parts
                ?.map((p: any) => p?.text)
                .filter(Boolean)
                .join('\n') ||
              '')
        } else if (ai?.models?.generate) {
          const resp = await ai.models.generate({
            model: 'gemini-2.5-flash',
            prompt: promptText,
            temperature: 0.6,
            maxOutputTokens: TOKEN_BUDGET,
          })
          recommendation =
            (resp?.text ||
              resp?.candidates?.[0]?.content?.parts
                ?.map((p: any) => p?.text)
                .filter(Boolean)
                .join('\n') ||
              '')
        }
      } catch (e: any) {
        // ignore and fall back to REST below
      }

      // --- REST fallback ---
      if (!recommendation.trim()) {
        const url =
          `https://generativelanguage.googleapis.com/v1beta/models/` +
          `gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`

        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: TOKEN_BUDGET,
            },
          }),
        })

        if (!geminiRes.ok) {
          const raw = await geminiRes.text().catch(() => '')
          let details = raw
          try {
            const parsed = JSON.parse(raw)
            details = parsed?.error?.message || parsed?.message || raw
          } catch {
            // keep raw text
          }

          if (geminiRes.status === 401 || geminiRes.status === 403) {
            details =
              (details ? `${details} ` : '') +
              'Check that GEMINI_API_KEY is a valid Google AI Studio Gemini API key with access, and that billing/quota allows requests.'
          }
          if (geminiRes.status === 404) {
            details =
              (details ? `${details} ` : '') +
              'Model not found. Try updating the model name (for example gemini-1.5-flash-latest) if your account does not support gemini-1.5-flash.'
          }

          throw new GeminiHttpError(geminiRes.status, (details || '').toString().slice(0, 2000))
        }

        const data = (await geminiRes.json()) as any
        recommendation =
          data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') ?? ''
      }

      return recommendation
    }

    const MIN_WORDS_STRICT = 300
    const MAX_WORDS_STRICT = 350

    const isAcceptable = (text: string) => {
      const t = normalizeText(text)
      const wc = countWords(t)
      if (wc < MIN_WORDS_STRICT || wc > MAX_WORDS_STRICT) return false
      if (!t.includes(`Resulting Stream:`)) return false
      return hasRequiredHeadings(t)
    }

    let recommendation = withResultingStreamLine(streamPretty, await generateOnce(prompt))

    if (!isAcceptable(recommendation)) {
      const stricterPrompt =
        prompt +
        `\n\nFINAL CHECK BEFORE YOU ANSWER (must pass):\n` +
        `- Total length must be between ${MIN_WORDS_STRICT} and ${MAX_WORDS_STRICT} words.\n` +
        `- Include the headings exactly as specified.\n` +
        `- Do not omit any section.\n` +
        `- Keep it stream-specific for ${streamPretty}.\n`
      recommendation = withResultingStreamLine(streamPretty, await generateOnce(stricterPrompt))
    }

    if (!isAcceptable(recommendation)) {
      recommendation = buildFallbackRecommendation({
        streamKey,
        streamPretty,
        confidence,
        regionLabel,
      })
    }

    if (!recommendation.trim()) {
      return NextResponse.json(
        {
          error: 'Empty AI response',
          details:
            'No text returned by Gemini. This can happen if the model is unavailable for your key or the response shape changed.',
        },
        { status: 502 },
      )
    }

    const persistToSavedCareers = body.persistToSavedCareers !== false

    let persisted: any = undefined
    if (persistToSavedCareers) {
      try {
        const user = await getAuthenticatedUser()
        if (user?.id) {
          const extracted = extractRecommendedCareersFromRecommendation(recommendation)
          if (extracted.length > 0) {
            persisted = await prisma.$transaction(async (tx) => {
              return persistRecommendedCareersForUser({
                prisma: tx,
                userId: user.id,
                careers: extracted.map((c) => ({
                  title: c.title,
                  description: c.description,
                  category: streamPretty,
                  skills:
                    streamKey === 'science'
                      ? 'Mathematics, problem-solving, lab skills, basic programming'
                      : streamKey === 'commerce'
                        ? 'Accounting, Excel/Sheets, quantitative aptitude, communication'
                        : 'Writing, communication, research, current affairs'
                  ,
                  notes: 'Auto-saved from AI recommendation',
                })),
                defaults: {
                  category: streamPretty,
                  skills:
                    streamKey === 'science'
                      ? 'Mathematics, problem-solving, lab skills, basic programming'
                      : streamKey === 'commerce'
                        ? 'Accounting, Excel/Sheets, quantitative aptitude, communication'
                        : 'Writing, communication, research, current affairs',
                  notes: 'Auto-saved from AI recommendation',
                },
              })
            })
          }
          
          if (user.email) {
            import('@/lib/mailer').then(({ sendEmail }) => {
              sendEmail({
                to: user.email!,
                subject: "Your New Pathway Roadmap 🗺️",
                html: `
                  <p>Hi ${user.name || 'there'},</p>
                  <p>As soon as selecting the pathway</p>
                  <p><b>Progress Tracking pathway roadway:</b> ${streamPretty}</p>
                `
              }).catch(e => console.error('Failed to send pathway email:', e));
            }).catch(e => console.error('Mailer import failed', e));
          }
        }
      } catch (e) {
        // Persistence should not break the recommendation response
        console.error('Persist recommended careers failed:', e)
      }
    }

    return NextResponse.json({ recommendation, persisted })
  } catch (err: any) {
    if (err instanceof GeminiHttpError) {
      return NextResponse.json(
        {
          error: `Gemini request failed (${err.status})`,
          details: err.details,
        },
        { status: 502 },
      )
    }

    return NextResponse.json(
      { error: 'Unexpected error', details: err?.message ?? String(err) },
      { status: 500 },
    )
  }
}
