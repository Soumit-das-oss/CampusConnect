require('dotenv').config();
const OpenAI = require('openai');

async function testGroq() {
  if (!process.env.GROK_API_KEY) {
    console.error('❌ GROK_API_KEY is not set in .env');
    process.exit(1);
  }

  console.log('🔍 Testing Groq API connection...');

  const client = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    });

    const reply = completion.choices[0].message.content.trim();
    console.log('✅ Groq API is working!');
    console.log(`   Model  : ${completion.model}`);
    console.log(`   Reply  : ${reply}`);
    console.log(`   Tokens : ${completion.usage?.total_tokens ?? 'N/A'}`);
  } catch (err) {
    console.error('❌ Groq API call failed!');
    console.error(`   Status : ${err.status ?? 'N/A'}`);
    console.error(`   Error  : ${err.message}`);
    process.exit(1);
  }
}

testGroq();
