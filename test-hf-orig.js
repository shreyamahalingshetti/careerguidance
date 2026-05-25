const fs = require('fs');
async function test() {
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 10
      })
    });
    fs.writeFileSync('d:\\project-1\\hf-error.txt', await res.text());
  } catch (err) {}
}
test();
