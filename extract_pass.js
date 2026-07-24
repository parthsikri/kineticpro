const fs = require('fs');
const path = 'C:/Users/parth/.gemini/antigravity/brain/9e080e54-c902-45b2-8bc5-04c3a03d8176/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n').filter(Boolean);
let output = [];
for (const line of lines) {
  try {
    const data = JSON.parse(line);
    const textToCheck = (data.content || '') + ' ' + (data.thinking || '');
    if (textToCheck.toLowerCase().includes('superdatabase') && !textToCheck.toLowerCase().includes('pass_found') && !textToCheck.toLowerCase().includes('find_pass')) {
      output.push(`[${data.created_at}] ${data.source}:\nContent: ${data.content || ''}\nThinking: ${data.thinking || ''}\n---`);
    }
  } catch (e) {}
}
fs.writeFileSync('pass_found_2.txt', output.join('\n'));
console.log(`Found ${output.length} matching entries`);
