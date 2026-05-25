const fs = require('fs');
const env = fs.readFileSync('d:\\project-1\\.env', 'utf-8');
const match = env.match(/HUGGING_FACE_API_TOKEN="?([^"\n]+)"?/);
const apiKey = match ? match[1].trim() : '';

async function test() {
  try {
    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: "Tell me a joke." }],
        max_tokens: 50
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      fs.writeFileSync('d:\\project-1\\hf-error.txt', errText);
      console.error('API Error saved');
    } else {
      const data = await res.json();
      fs.writeFileSync('d:\\project-1\\hf-success.txt', JSON.stringify(data, null, 2));
      console.log('Success saved', data.choices[0].message.content);
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();
