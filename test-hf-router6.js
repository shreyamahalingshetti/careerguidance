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
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [{ role: "user", content: "Say exactly the word 'OK'." }],
        max_tokens: 10
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
