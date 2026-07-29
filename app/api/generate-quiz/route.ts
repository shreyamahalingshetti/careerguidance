import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: 'A' | 'B' | 'C' | 'D'
}

type QuizResponse = {
  questions: QuizQuestion[]
}

function extractYoutubeId(url: string): string | null {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

async function fetchTranscript(videoId: string): Promise<string> {
  console.log(`[quiz] Fetching transcript for video: ${videoId}`);
  
  // Try youtube-transcript
  try {
    const ytModule = await import('youtube-transcript');
    const YoutubeTranscript = ytModule.YoutubeTranscript || (ytModule as any).default?.YoutubeTranscript;
    if (YoutubeTranscript) {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      if (transcript && transcript.length > 0) {
        const text = transcript.map((t: any) => t.text).join(' ').slice(0, 6000);
        if (text.length > 50) return text;
      }
    }
  } catch (err: any) {
    console.warn(`[quiz] youtube-transcript error: ${err?.message || err}`);
  }

  // Try yt-transcript
  try {
    const ytModule = await import('yt-transcript');
    const YtTranscript = ytModule.YtTranscript || (ytModule as any).default?.YtTranscript;
    if (YtTranscript) {
      const fetcher = new YtTranscript({ videoId });
      const data = await fetcher.getTranscript();
      if (Array.isArray(data) && data.length > 0) {
        const text = data.map((item: any) => item.text).join(' ').slice(0, 6000);
        if (text.length > 50) return text;
      }
    }
  } catch (err: any) {
    console.warn(`[quiz] yt-transcript error: ${err?.message || err}`);
  }

  return "";
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const videoUrl = body?.videoUrl;
    const topic = body?.topic || 'the main subject of the video';

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    const videoId = extractYoutubeId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    console.log(`[quiz] Processing video: ${videoId}`);

    // 1. Get Transcript
    let transcript = await fetchTranscript(videoId);
    if (!transcript) {
      console.warn(`[quiz] Transcript FETCH FAILED for ${videoId}. Falling back to topic-based generation.`);
      transcript = "";
    } else {
      console.log(`[quiz] Transcript fetched successfully: ${transcript.length} chars`);
    }

    // 2. Setup Gemini API
    let apiKey = process.env.GEMINI_API_KEY || '';
    
    // Normalize API Key: check for literal quotes or whitespace
    apiKey = apiKey.trim().replace(/^['"]|['"]$/g, '');
    if (apiKey.includes(' ')) apiKey = apiKey.split(' ')[0];
    
    if (!apiKey) {
      console.error('[quiz] Gemini API Key MISSING');
      return NextResponse.json({ error: 'Gemini API Key not configured in server environment' }, { status: 500 });
    }

    // 3. Generate Quiz
    const randomSeed = Math.random().toString(36).substring(7);
    const requestedCount = 65; // Request more to ensure we get at least 50 even if it cuts off

    const prompt = `
You are an expert exam paper setter.

The main topic of this test is: ${topic}.
Random Seed for variety: ${randomSeed} (Ensure you generate completely DIFFERENT questions than any previous test).

Generate EXACTLY ${requestedCount} multiple-choice questions focusing on ${topic}.

REQUIREMENTS:
- Focus predominantly on ${topic}
- Even if specific concepts are NOT covered in the video transcript, you MUST include questions about them to comprehensively cover the entire ${topic} roadmap.
- Difficulty: Medium to challenging
- Cover DIFFERENT subtopics related to ${topic}
- Avoid repetition
- VERY IMPORTANT: Keep questions and options EXTREMELY SHORT (under 10 words) so you do not run out of token limits. You MUST output all ${requestedCount} questions.

IMPORTANT:
Each question MUST belong to a CLEAR SUBTOPIC of ${topic}.

Examples of subtopics:
- If topic is HTML → "Forms", "Semantic HTML", "Tables", "Elements", "Attributes"
- If topic is CSS → "Selectors", "Box Model", "Flexbox", "Grid"

Each question must:
- Be clear and complete
- Have 4 options (A, B, C, D)
- Only ONE correct answer (must be EXACTLY 'A', 'B', 'C', or 'D')
- Include realistic distractors
- Include a "topic" field representing the subtopic

IMPORTANT:
- Do NOT copy sentences directly
- Ensure variety
- The "topic" field must be specific (NOT just "${topic}", but subtopics)

OUTPUT STRICTLY JSON matching the response schema.

${transcript ? `Transcript:\n${transcript.slice(0, 3000)}` : `[Important Note: No video transcript is available. Please generate foundational and standard questions broadly covering ${topic} suitable for the video's context.]`}
`;

    console.log('[quiz] Requesting Gemini output via REST API (gemini-2.5-flash)...');
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    
    const QUIZ_SCHEMA = {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: {
                type: 'array',
                items: { type: 'string' }
              },
              correctAnswer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
              topic: { type: 'string' }
            },
            required: ['question', 'options', 'correctAnswer', 'topic']
          }
        }
      },
      required: ['questions']
    };

    let geminiRes: Response | undefined = undefined;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[quiz] Requesting Gemini output (Attempt ${attempts} of ${maxAttempts})...`);
      geminiRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: QUIZ_SCHEMA
          }
        }),
        cache: 'no-store'
      });

      if (geminiRes.ok) {
        break;
      }
      
      const errText = await geminiRes.text();
      console.warn(`[quiz] Attempt ${attempts} failed:`, errText);
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        try {
          const errJson = JSON.parse(errText);
          return NextResponse.json({ error: errJson?.error?.message || errJson?.error || `Gemini API returned ${geminiRes.status}` }, { status: geminiRes.status });
        } catch (e) {
          return NextResponse.json({ error: `Gemini API returned ${geminiRes.status}` }, { status: geminiRes.status });
        }
      }
    }

    if (!geminiRes) {
      return NextResponse.json({ error: 'Gemini API failed to return a response' }, { status: 502 });
    }
    const result = await geminiRes.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('[quiz] Gemini returned empty text');
      throw new Error('Empty AI response from Gemini');
    }

    // Clean JSON from text (strip markdown fences if present)
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    let parsedQuestions = [];
    let parseSuccess = false;

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      try {
        const quizData = JSON.parse(text.slice(firstBrace, lastBrace + 1));
        if (quizData.questions && Array.isArray(quizData.questions)) {
          parsedQuestions = quizData.questions;
          parseSuccess = true;
        }
      } catch (e) {
        console.warn('[quiz] Standard JSON parse failed. Truncated output?');
      }
    }

    if (!parseSuccess) {
      console.warn('[quiz] Falling back to regex extraction for questions...');
      // Extract individual question blocks as best effort
      const qMatches = text.match(/{\s*"question"\s*:.*?,\s*"options"\s*:.*?,\s*"correctAnswer"\s*:.*?,\s*"topic"\s*:.*?}/gs);
      if (qMatches) {
        for (const match of qMatches) {
          try {
            parsedQuestions.push(JSON.parse(match));
          } catch (err) {}
        }
      }
    }

    if (parsedQuestions.length === 0) {
      throw new Error('Failed to parse any valid questions from the AI response');
    }

    // Randomize and slice exactly 50 questions
    parsedQuestions = shuffleArray(parsedQuestions);
    if (parsedQuestions.length > 50) {
      parsedQuestions = parsedQuestions.slice(0, 50);
    }

    console.log(`[quiz] SUCCESS: Returning exactly ${parsedQuestions.length} questions.`);
    return NextResponse.json({ questions: parsedQuestions });

  } catch (error: any) {
    console.error(`[quiz] Unhandled Error: ${error?.message || error}`);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
