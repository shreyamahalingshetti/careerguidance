const fs = require('fs');
const env = fs.readFileSync('d:\\project-1\\.env', 'utf-8');
const match = env.match(/HUGGING_FACE_API_TOKEN="?([^"\n]+)"?/);
const apiKey = match ? match[1].trim() : '';

async function test() {
  const prompt = `<|system|>
You are an expert quiz generator. Generate valid JSON only.</s>
<|user|>
Generate 2 unique multiple-choice questions based on this text.
Output ONLY valid JSON matching this structure:
{"questions":[{"question":"...","options":["A: ...","B: ...","C: ...","D: ..."],"correctAnswer":"A"}]}

Text:
Hello world. This is a text about the history of computers.</s>
<|assistant|>
`;

  try {
    const res = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 500, return_full_text: false, temperature: 0.1 }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.log('Error:', errText);
    } else {
      const data = await res.json();
      console.log('Success:', data[0].generated_text);
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();
