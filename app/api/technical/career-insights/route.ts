import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { riasecScores, domainScores, topDomains } = body

    // Attempt dynamic import of '@google/genai' so build won't fail when package absent
    let insights: any = null
    try {
      // Check if API key exists
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables')
      }

      const genaiModule: any = await import('@google/genai')
      
      // Get the GenerativeAI constructor from the module
      const { GoogleGenerativeAI } = genaiModule
      if (!GoogleGenerativeAI) {
        throw new Error('GoogleGenerativeAI not found in @google/genai module')
      }

      // Initialize the client with the API key
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      
      // Get the model
      const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `You are a helpful career counselor for a high-school technical student. Given these scores, produce a concise JSON with keys: summary (1-2 sentences), recommendations (array of 3 concise actionable study/career recommendations), nextSteps (array of 3 immediate next actions for student). Provide context using the top domains: ${JSON.stringify(topDomains)} and RIASEC scores: ${JSON.stringify(riasecScores)}.`

      // Call the generative AI model
      const result = await model.generateContent(prompt)
      const text = result.response?.text?.() ?? null

      try {
        insights = text ? JSON.parse(text) : { summary: text }
      } catch (e) {
        insights = { summary: text }
      }
    } catch (e) {
      console.error('Gemini API error:', e instanceof Error ? e.message : String(e))
      // If genai not available or fails, fall back to deterministic, domain-aware recommendations
      const top = Array.isArray(topDomains) && topDomains.length > 0 ? topDomains[0] : null
      const topName = top?.name || top?.domain || 'the recommended domain'

      const domainRecommendations: { [key: string]: { recs: string[]; steps: string[] } } = {
        datascience: {
          recs: [
            'Start with Python and basic data manipulation (Pandas).',
            'Learn statistics and visualization (Matplotlib/Seaborn).',
            'Work on a small data analysis project using public datasets.'
          ],
          steps: [
            'Take an introductory course in Python for Data Science.',
            'Explore a dataset and create a short report with visualizations.',
            'Publish your project on GitHub and document findings.'
          ]
        },
        aiml: {
          recs: [
            'Learn Python and linear algebra foundations.',
            'Study core ML algorithms and experiment with scikit-learn.',
            'Try small ML projects (classification/regression) end-to-end.'
          ],
          steps: [
            'Complete an introductory ML course (Coursera/edX).',
            'Implement a basic ML model on a public dataset.',
            'Read beginner-friendly papers or tutorials in your area of interest.'
          ]
        },
        cybersecurity: {
          recs: [
            'Build foundational networking and OS knowledge.',
            'Practice hands-on labs (CTF-style) for practical security skills.',
            'Learn common security tools and basic hardening practices.'
          ],
          steps: [
            'Take an introductory cybersecurity course and networking basics.',
            'Try safe, legal CTF challenges to practice skills.',
            'Set up a lab environment to practice penetration testing tools.'
          ]
        },
        fullstack: {
          recs: [
            'Learn JavaScript/TypeScript and front-end frameworks (React).',
            'Understand backend basics (Node.js, REST APIs, databases).',
            'Build a small full-stack app end-to-end and deploy it.'
          ],
          steps: [
            'Follow a full-stack tutorial and deploy to a free cloud tier.',
            'Implement authentication and CRUD features in a project.',
            'Document and publish your app as a portfolio piece.'
          ]
        },
        devops: {
          recs: [
            'Familiarize with Linux, scripting, and basic networking.',
            'Learn containerization (Docker) and CI/CD concepts.',
            'Practice deploying simple services and monitoring them.'
          ],
          steps: [
            'Create a Dockerized app and run it locally.',
            'Set up a simple CI pipeline (GitHub Actions).',
            'Explore basic cloud services (VMs, managed databases).' 
          ]
        },
        cloudarchitect: {
          recs: [
            'Understand cloud fundamentals (compute, storage, networking).',
            'Learn infrastructure-as-code basics (Terraform).',
            'Study architectural patterns and cost/performance tradeoffs.'
          ],
          steps: [
            'Complete an introductory cloud fundamentals course.',
            'Prototype a small application architecture using cloud services.',
            'Document tradeoffs and a simple architecture diagram.'
          ]
        }
      }

      const lookupKey = (top && (top.domain || '').toString()) || 'datascience'
      const fallback = domainRecommendations[lookupKey] || domainRecommendations['datascience']

      insights = {
        // Provide a friendly, domain-specific summary (do not call out AI unavailability)
        summary: `Personalized guidance for ${topName}. Use these recommendations to get started.`,
        recommendations: fallback.recs,
        nextSteps: fallback.steps,
        source: 'fallback'
      }
    }

    // If we obtained insights from AI, tag the source (helpful for UI)
    if (insights && typeof insights === 'object' && !('source' in insights)) {
      insights.source = 'ai'
    }

    return NextResponse.json({ insights })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
