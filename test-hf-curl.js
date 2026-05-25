const fs = require('fs');
const env = fs.readFileSync('d:\\project-1\\.env', 'utf-8');
const match = env.match(/HUGGING_FACE_API_TOKEN="?([^"\n]+)"?/);
const apiKey = match ? match[1].trim() : '';

const { execSync } = require('child_process');

try {
  const output = execSync(`curl -i -X POST https://api-inference.huggingface.co/hf-inference/v1/chat/completions \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d "{\\"model\\":\\"meta-llama/Meta-Llama-3-8B-Instruct\\",\\"messages\\":[{\\"role\\":\\"user\\",\\"content\\":\\"hi\\"}]}"`, { encoding: 'utf-8' });
  console.log(output);
} catch (err) {
  console.log('Error:', err.stdout || err.message);
}
