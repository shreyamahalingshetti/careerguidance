import { NextResponse, NextRequest } from 'next/server';
// NOTE: Optional import for '@google/genai' (dynamic import below) — avoids compile-time failures if package isn't installed
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-helpers'
import { persistRecommendedCareersForUser } from '@/lib/persist-recommended-careers'

// --- INTERFACE DEFINITION (Used internally and for response schema) ---
// This interface defines the structured JSON output expected by the frontend.
export interface IAICareerInsight {
    summary: string; 
    personaTitle: string; 
    topClusters: { name: string; explanation: string }[];
    recommendedCareers: {
        name: string;
        category: string;
        fitReason: string;
        fitScore: number;
    }[];
    suggestedDegrees: string[]; 
    nextSteps: string[]; 
}

// --- JSON SCHEMA DEFINITION (Crucial for structured output) ---
// Use a plain JSON-schema like structure without SDK types so this module compiles without '@google/genai'.
const INSIGHTS_SCHEMA = {
    type: 'object',
    properties: {
        summary: { type: 'string', description: "A concise 2-3 line summary of the user's profile and core drive." },
        personaTitle: { type: 'string', description: "A catchy, encouraging title for the user's profile." },
        topClusters: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: "The cluster name (e.g., SocialSciences)." },
                    explanation: { type: 'string', description: "A sentence explaining why this cluster fits the user's personality traits." },
                },
            },
        },
        recommendedCareers: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    category: { type: 'string', description: "e.g., Media, Law, Design." },
                    fitReason: { type: 'string', description: "Briefly explain the trait match (e.g., 'High Agreeableness')." },
                    fitScore: { type: 'number' },
                },
            },
        },
        suggestedDegrees: { type: 'array', items: { type: 'string' } },
        nextSteps: { type: 'array', items: { type: 'string' } },
    },
    required: ["summary", "personaTitle", "topClusters", "recommendedCareers", "suggestedDegrees", "nextSteps"]
};


// --- ROUTE HANDLER ---
export async function POST(request: NextRequest) {
    // 1. Read API Key securely from the environment variables (process.env must be available in Next.js runtime)
    let GEMINI_KEY = process.env.GEMINI_API_KEY as string | undefined;

    // Normalize the key if it comes wrapped in quotes, or if whitespace was accidentally included
    if (GEMINI_KEY) {
        GEMINI_KEY = GEMINI_KEY.trim().replace(/^['"]|['"]$/g, '');
        // Some users accidentally paste two keys or multiple values - if so, we take the first token
        if (GEMINI_KEY.indexOf(' ') >= 0) GEMINI_KEY = GEMINI_KEY.split(' ')[0];
    }

    if (!GEMINI_KEY) {
        return NextResponse.json({ error: 'Server configuration error: API key missing.' }, { status: 500 });
    }
    // Basic sanity checks to help developers spot common copy/paste mistakes
    if (GEMINI_KEY.includes(' ') || (GEMINI_KEY.match(/AIza[^"]*/g) || []).length > 1) {
        console.warn('Career insights: Detected malformed or multiple API keys in GEMINI_API_KEY. Please set a single, valid Gemini/AI Studio API key.');
        return NextResponse.json({ error: 'Server configuration error: GEMINI_API_KEY appears malformed or contains multiple keys. Please check your .env.' }, { status: 500 });
    }

    // Optional: Try to dynamically import the Gemini SDK and initialize if present.
    // We explicitly cast the dynamic import to `any` so TypeScript doesn't assert the module types.
    let ai: any = null;
    try {
        const genai = (await import('@google/genai').catch(() => null)) as any;
        // Diagnostic: print module keys so we know what the SDK exposes at runtime
        console.debug('Career insights: genai module keys:', Object.keys(genai || {}));
        console.debug('Career insights: genai.default keys:', Object.keys(genai?.default || {}));
        console.debug('Career insights: genai has default export?', !!genai?.default);
        console.debug('Career insights: genai.models present?', !!genai?.models);
        // The SDK may export various named identifiers depending on version; check common variants and `default` export.
        // Try a few initialization strategies depending on the SDK version.
        // Candidate initializers to try (ordered roughly by most common API from SDK README)
        const ClientCandidates = [
            genai?.GoogleGenAI,
            genai?.default?.GoogleGenAI,
            genai?.default,
            genai?.createClient, // factory method variant
            genai?.default?.createClient,
        ];
        let clientInstantiated = false;
        for (const Candidate of ClientCandidates) {
            if (!Candidate) continue;
            console.debug('Career insights: trying SDK candidate', Candidate?.name ?? typeof Candidate);
            try {
                    if (typeof Candidate === 'function') {
                    try {
                        // Standard constructor: new GoogleGenAI({ apiKey })
                        ai = new Candidate({ apiKey: GEMINI_KEY });
                        clientInstantiated = true;
                        console.debug('Career insights: instantiated client using', Candidate?.name);
                        break;
                    } catch (nerr) {
                        try {
                            ai = Candidate({ apiKey: GEMINI_KEY });
                            clientInstantiated = true;
                            console.debug('Career insights: client factory succeeded using', Candidate?.name ?? 'factory');
                            break;
                        } catch (cerr) {
                            // not a usable form for this candidate - keep trying
                        }
                    }
                }
            } catch (e) {
                // Continue to next candidate
                continue;
            }
        }
        // SDK factory method possibilities (example: genai.createClient({ apiKey }))
        if (!ai && typeof genai?.createClient === 'function') {
            try { ai = genai.createClient({ apiKey: GEMINI_KEY }); } catch (e) { console.debug('Career insights: createClient factory failed', e); }
        }
        if (!ai && typeof genai?.default?.createClient === 'function') {
            try { ai = genai.default.createClient({ apiKey: GEMINI_KEY }); } catch (e) { console.debug('Career insights: default.createClient failed', e); }
        }
        // Fallback: SDK module itself may be structured as the client and expose `models`
        if (!ai && genai?.models) {
            ai = genai;
        }
        // If the SDK uses a slightly different API that already exposes `.models`, we can use the module directly.
        if (!ai && genai?.models) {
            ai = genai; // module already acts like the client
        }
        // Add debug log showing whether we have an ai instance and keys exported
        console.debug('Career insights: genai imported?', !!genai);
        console.debug('Career insights: ai initialized?', !!ai);
        console.debug('Career insights: ai keys', ai ? Object.keys(ai as object) : []);
    } catch (e) {
        ai = null;
    }
    // Note: Do not create fallback here because we need access to parsed body variables.

    try {
        // 2. Safely parse the data sent from the frontend (ProfileTestArts.tsx)
        const body = await request.json();
        const { normalizedScores, clusterFits, stream } = body;
        // If SDK couldn't be created, return a helpful but non-blocking local fallback result for dev.
        if (!ai) {
            console.warn('Career insights: GenAI SDK not available. Returning local fallback generated from clusterFits.');
            const fallback: IAICareerInsight = {
                summary: `Local fallback: generated based on the top ${Math.min(3, (clusterFits?.length ?? 0))} clusters.`,
                personaTitle: `${stream || 'Student'} Explorer`,
                topClusters: clusterFits?.slice(0,3)?.map((c:any) => ({ name: c.cluster, explanation: `Top fit: ${c.score}%` })) || [],
                recommendedCareers: (clusterFits?.slice(0,3) || []).map((c:any) => ({ name: `${c.cluster} - Career`, category: c.cluster, fitReason: `High match on ${c.cluster}`, fitScore: c.score })),
                suggestedDegrees: ['BA / BCom / BF A'],
                nextSteps: ['Explore top cluster specialties', 'Discuss with a counselor', 'Try sample projects or internships']
            }
            return NextResponse.json({ ...fallback, fallback: true }, { status: 200 });
        }
        
        // --- 3. Prepare User Data for LLM Prompt ---
        const scoreString = Object.entries(normalizedScores)
            .map(([trait, score]) => `${trait}: ${score}%`)
            .join(', ');

        const topClustersString = clusterFits
            .map((c: any) => `${c.cluster} Score: ${c.score}%.`)
            .join(' ');
        
        const topTraits = Object.entries(normalizedScores)
            .filter(([trait]) => ['Social', 'Artistic', 'Openness', 'Conscientiousness'].includes(trait))
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([trait, score]) => `${trait} (${score}%)`)
            .join(', ');


        // Build a stream-specific system instruction so the LLM's persona matches the student's stream.
        const streamKey = (stream || 'General').toString().toLowerCase();
        let systemInstruction = '';
        if (streamKey.includes('science')) {
            systemInstruction = `You are an expert, encouraging Indian career counsellor for the Science stream (Engineering, Medicine, Research). Your role is to analyze psychometric data and synthesize the results into a personalized career narrative and actionable roadmap. Ensure recommendations are practical and relevant to Indian higher-education pathways (e.g., B.Tech specializations, MBBS/NEET pathways, B.Sc/M.Sc research routes).`;
        } else if (streamKey.includes('commerce')) {
            systemInstruction = `You are an expert, encouraging Indian career counsellor for the Commerce stream (Accounting, Management, Finance, Business Analytics). Your role is to analyze psychometric data and synthesize the results into a personalized career narrative and actionable roadmap. Ensure recommendations focus on practical career and degree pathways (e.g., B.Com, CA, BBA, MBA, professional certifications) that suit the Indian context.`;
        } else if (streamKey.includes('arts') || streamKey.includes('human')) {
            systemInstruction = `You are an expert, encouraging Indian career counsellor for the Arts/Humanities stream. Your role is to analyze psychometric data and synthesize the results into a personalized career narrative and actionable roadmap. Ensure the language is motivating and the recommended careers are relevant to the Indian context (e.g., UPSC, specific B.A. Hons. programs).`;
        } else {
            systemInstruction = `You are an expert, encouraging Indian career counsellor. Your role is to analyze psychometric data and synthesize the results into a personalized career narrative and actionable roadmap for the given stream. Prefer recommendations that are practical and relevant to the Indian education and job market.`;
        }

        const userPrompt = `
            Analyze this 10th Pass student's profile for the ${stream} Stream:
            
            1. **Overall Stream:** ${stream}
            2. **Top Traits:** ${topTraits}
            3. **Normalized Scores (0-100):** ${scoreString}
            4. **Cluster Fit Ranking:** ${topClustersString}

            **TASK:** Generate the career insight in the exact structured JSON format provided. Use the top cluster (highest score) as the foundation for the persona and summary. Tailor recommendations for 10th pass level guidance (exploratory stage, awareness-building).
        `;

        // --- 4. Call Gemini API Securely ---
        let response: any = null;
        // Support a few possible method names depending on SDK version: `models.generateContent`, `models.generate`.
        try {
            if (ai?.models?.generateContent) {
                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                    config: {
                        systemInstruction: systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema: INSIGHTS_SCHEMA,
                    },
                });
            } else if (ai?.models?.generate) {
                response = await ai.models.generate({
                    model: "gemini-2.5-flash",
                    prompt: userPrompt,
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: INSIGHTS_SCHEMA,
                });
            }
        } catch (e) {
            const err = e as any;
            const errMsg = err?.message ?? JSON.stringify(err);
            console.error('Gemini SDK call failed or not available:', errMsg, err);
            // If the SDK returned a well-formed object with code & details, pass that to the client for debugging (but don't leak secrets).
            const apiStatus = err?.status || err?.code || 502;
            const apiDetail = err?.details || (err?.errors && err.errors[0]) || null;
            const apikeyProblem = String(errMsg || '').toLowerCase().includes('api key') || (apiDetail && JSON.stringify(apiDetail).toLowerCase().includes('api_key') );
            const statusCode = apiStatus === 400 && apikeyProblem ? 401 : apiStatus || 502;
            const userMessage = apikeyProblem ? 'Gemini API key invalid. Please verify your GEMINI_API_KEY and ensure it is a valid Gemini/AI Studio API key.' : 'Gemini SDK call failed: ' + String(errMsg);
            return NextResponse.json({ error: userMessage, detail: apiDetail }, { status: statusCode });
        }

        // 5. Parse and return the LLM's structured JSON response
        // The SDKs may return the result in different shapes. Try a few known fields.
        const jsonText = (
            response?.text ||
            response?.candidates?.[0]?.content?.[0]?.text ||
            response?.output?.[0]?.content?.[0]?.text ||
            response?.responseText ||
            ''
        ).trim();
        
        // Clean up markdown block if the LLM includes it
        const cleanedJson = jsonText.startsWith('```') ? jsonText.slice(7, -3).trim() : jsonText;
        
        // If there was no real SDK response, return a simple mock response to avoid failing the route.
        if (!cleanedJson) {
            console.warn('Career insights: LLM returned no text; response shape keys: ', Object.keys(response || {}));
            return NextResponse.json({ error: 'LLM returned no JSON or returned an unexpected format.' }, { status: 502 });
        }
        const insights: IAICareerInsight = cleanedJson ? JSON.parse(cleanedJson) : {
            summary: 'Analysis could not be completed due to missing API or SDK. Here is a suggested fallback.',
            personaTitle: `${stream} Explorer`,
            topClusters: clusterFits?.slice(0, 3)?.map((c: any) => ({ name: c.cluster, explanation: `Top fit: ${c.score}%` })) || [],
            recommendedCareers: [],
            suggestedDegrees: [],
            nextSteps: []
        };

        // Persist recommended careers into careers + saved_careers (best-effort; does not affect response).
        try {
            const user = await getAuthenticatedUser();
            if (user?.id && Array.isArray(insights?.recommendedCareers) && insights.recommendedCareers.length > 0) {
                await prisma.$transaction(async (tx) => {
                    await persistRecommendedCareersForUser({
                        prisma: tx,
                        userId: user.id,
                        careers: insights.recommendedCareers.map((c) => ({
                            title: c.name,
                            category: c.category,
                            description: `${c.fitReason}${Number.isFinite(c.fitScore) ? ` (Fit score: ${c.fitScore})` : ''}`,
                            skills: `Suggested based on your profile for ${c.category}.`,
                            notes: 'Auto-saved from career insights',
                        })),
                        defaults: {
                            category: (stream || 'General').toString(),
                            skills: 'See career insights for suggested skills.',
                            notes: 'Auto-saved from career insights',
                        },
                    });
                });
            }
        } catch (e) {
            console.error('Persist career insights recommended careers failed:', e);
        }

        // Success: Return structured insights to the frontend
        return NextResponse.json(insights, { status: 200 });

    } catch (error) {
        console.error("API Error during LLM analysis:", error);
        return NextResponse.json({ error: 'LLM analysis failed. Please check the logs for detail.' }, { status: 500 });
    }
}

// Optional diagnostic GET route to help debug SDK import / environment issues in development
export async function GET() {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    let genai: any = null;
    try {
        genai = (await import('@google/genai').catch(() => null)) as any;
    } catch (e) {
        genai = null;
    }
    const info: any = {
        geminiKeyPresent: !!GEMINI_KEY,
        genaiImported: !!genai,
        genaiKeys: genai ? Object.keys(genai) : [],
        genaiDefaultKeys: genai?.default ? Object.keys(genai.default) : [],
        clientInstantiated: false,
        nodeVersion: process.version,
    };
    if (genai) {
        // Backwards-compat candidate names (older versions): keep them as optional helpers
        const BackCompatCandidates = [
            genai?.GoogleGenerativeAIClient,
            genai?.GenerativeAI,
            genai?.GenAI,
            genai?.default?.GoogleGenerativeAIClient,
            genai?.default?.GenerativeAI,
            genai?.default?.GenAI,
        ];
        for (const Candidate of BackCompatCandidates) {
            if (!Candidate) continue;
            try {
                if (typeof Candidate === 'function') {
                    try {
                        const ai = new Candidate({ apiKey: GEMINI_KEY });
                        info.clientInstantiated = true;
                        info.clientKeys = Object.keys(ai);
                        info.clientKind = Candidate?.name ?? 'function';
                        break;
                    } catch (nerr) {
                        try {
                            const ai = Candidate({ apiKey: GEMINI_KEY });
                            info.clientInstantiated = true;
                            info.clientKeys = Object.keys(ai);
                            info.clientKind = Candidate?.name ?? 'factory';
                            break;
                        } catch (cerr) {
                            continue;
                        }
                    }
                }
            } catch (e) {
                continue;
            }
        }
    }
    return NextResponse.json(info);
}