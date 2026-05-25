const fs = require('fs');
const env = fs.readFileSync('d:\\project-1\\.env', 'utf-8');
const match = env.match(/HUGGING_FACE_API_TOKEN="?([^"\n]+)"?/);
const apiKey = match ? match[1].trim() : '';

const apiUrl = `https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3`;

async function test() {
  const prompt = `[INST] Generate 2 unique multiple-choice questions based on this text.
Output ONLY valid JSON matching this exact structure:
{"questions":[{"question":"...","options":["A: ...","B: ...","C: ...","D: ..."],"correctAnswer":"A"}]}

Text:
Hello world. This is a text about the history of computers. [/INST]`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 500, return_full_text: false, temperature: 0.3 }
      })
    });

    if (!res.ok) {
      console.error('API Error:', await res.text());
    } else {
      const data = await res.json();
      console.log('Success:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();
