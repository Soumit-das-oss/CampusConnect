'use strict';

const OpenAI = require('openai');

if (!process.env.GROK_API_KEY) {
  console.warn('⚠️  GROK_API_KEY not set — resume AI extraction will be disabled.');
}

const grokClient = new OpenAI({
  apiKey: process.env.GROK_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1',
});

module.exports = { grokClient };
