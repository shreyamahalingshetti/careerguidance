const fs = require('fs');
const env = fs.readFileSync('d:\\project-1\\.env', 'utf-8');
const match = env.match(/HUGGING_FACE_API_TOKEN="?([^"\n]+)"?/);
const apiKey = match ? match[1].trim() : '';

const apiUrl = `https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions`;

// wait, the error is: "Model meta-llama/Meta-Llama-3-8B-Instruct is a gated model... Please use ..." No, it implies gated?
// Let's use mistralai/Mixtral-8x7B-Instruct-v0.1

async function test() {
  const prompt = `Generate 2 unique multiple-choice questions based on this transcript text.
Output ONLY valid JSON matching this exact structure:
{"questions":[{"question":"...","options":["A: ...","B: ...","C: ...","D: ..."],"correctAnswer":"A"}]}

Text:
Hello world. This is a text about the history of computers.`;

  try {
    const res = await fetch('https://api-inference.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) {
      console.error('API Error:', await res.text());
    } else {
      const data = await res.json();
      console.log('Success:', data.choices[0].message.content);
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();
