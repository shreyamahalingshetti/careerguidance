require('dotenv').config({ path: 'd:\\project-1\\.env' });
const apiKey = process.env.GEMINI_API_KEY;

const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

async function test() {
  const prompt = "Generate a dummy JSON quiz.";
  const geminiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.9, 
        maxOutputTokens: 4096,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    }),
    cache: 'no-store'
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.json();
    console.error('API Error:', err);
  } else {
    const res = await geminiRes.json();
    console.log('Success:', res.candidates?.[0]?.content?.parts?.[0]?.text);
  }
}

test();
