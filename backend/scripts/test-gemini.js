'use strict';

/**
 * Debug Gemini extraction on the stored resume URL.
 * Usage: node scripts/test-gemini.js [email]
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const https = require('https');
const mongoose = require('mongoose');

const email = process.argv[2] || 'test@vcet.edu.in';

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} downloading resume`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../src/models/User');

  const user = await User.findOne({ email }).select('name resumeUrl');
  if (!user || !user.resumeUrl) {
    console.log('No resume found for', email);
    process.exit(0);
  }

  console.log(`\n📄 Downloading resume for ${user.name}...`);
  console.log('   URL:', user.resumeUrl);

  const buffer = await downloadBuffer(user.resumeUrl);
  console.log(`✅  Downloaded: ${(buffer.length / 1024).toFixed(1)} KB`);

  // Detect mime type from first bytes
  const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50; // '%P' = '%PDF'
  const mimeType = isPdf ? 'application/pdf' : 'application/octet-stream';
  console.log(`🔍  Detected type: ${mimeType}`);

  console.log('\n🤖  Calling Gemini...');
  const { model } = require('../src/config/gemini');

  const prompt =
    'You are a resume parser. Analyze this resume and return ONLY a raw JSON object ' +
    '(no markdown, no code fences) with this exact structure:\n' +
    '{\n' +
    '  "summary": "brief 1-2 sentence professional summary",\n' +
    '  "skills": ["skill1", "skill2"],\n' +
    '  "education": [{ "institution": "name", "degree": "degree title", "year": "graduation year" }],\n' +
    '  "experience": [{ "company": "company name", "role": "job title", "duration": "time period" }]\n' +
    '}\n' +
    'Return ONLY valid JSON.';

  const result = await model.generateContent([
    {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    },
    prompt,
  ]);

  const text = result.response.text().trim();
  console.log('\n📝  Raw Gemini response:\n', text);

  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const parsed = JSON.parse(cleaned);
  console.log('\n✅  Parsed successfully:\n', JSON.stringify(parsed, null, 2));

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Error:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
