const fs = require('fs');
const path = 'C:/Users/parth/.gemini/antigravity/brain/9e080e54-c902-45b2-8bc5-04c3a03d8176/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const results = lines.filter(line => line.toLowerCase().includes('superdatabase'));
fs.writeFileSync('pass_found.txt', results.join('\n'));
console.log(`Found ${results.length} lines`);
