const fs = require('fs');
const env = fs.readFileSync('d:\\project-1\\.env', 'utf-8');
const match = env.match(/HUGGING_FACE_API_TOKEN="?([^"\n]+)"?/);
const apiKey = match ? match[1].trim() : '';

async function test() {
  const prompt = `Generate 2 unique multiple-choice questions based on this text.
Output ONLY valid JSON matching this exact structure:
{"questions":[{"question":"...","options":["A: ...","B: ...","C: ...","D: ..."],"correctAnswer":"A"}]}

Text:
Hello world. This is a text about the history of computers.`;

  try {
    const res = await fetch('https://api-inference.huggingface.co/models/TinyLlama/TinyLlama-1.1B-Chat-v1.0', {
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
      fs.writeFileSync('d:\\project-1\\hf-error.txt', errText);
      console.error('API Error saved');
    } else {
      const data = await res.json();
      fs.writeFileSync('d:\\project-1\\hf-success.txt', JSON.stringify(data, null, 2));
      console.log('Success saved', data[0].generated_text);
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();
