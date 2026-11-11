const config = require('../config');
const logger = require('../utils/logger');

class AiClient {
  constructor() {
    this.geminiKey = config.GEMINI_API_KEY;
    this.openaiKey = config.OPENAI_API_KEY;
  }

  isAvailable() {
    return Boolean(this.geminiKey || this.openaiKey);
  }

  async generateJson(systemPrompt, userPrompt) {
    if (this.geminiKey) {
      return this.callGemini(systemPrompt, userPrompt);
    }
    if (this.openaiKey) {
      return this.callOpenAi(systemPrompt, userPrompt);
    }
    return null;
  }

  async callGemini(systemPrompt, userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.AI_MODEL}:generateContent?key=${this.geminiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!res.ok) {
        logger.warn(`Gemini API returned status ${res.status}`);
        return null;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return rawText ? JSON.parse(rawText) : null;
    } catch (err) {
      logger.error('Gemini API call failed', err);
      return null;
    }
  }

  async callOpenAi(systemPrompt, userPrompt) {
    const url = 'https://api.openai.com/v1/chat/completions';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!res.ok) {
        logger.warn(`OpenAI API returned status ${res.status}`);
        return null;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      return content ? JSON.parse(content) : null;
    } catch (err) {
      logger.error('OpenAI API call failed', err);
      return null;
    }
  }
}

module.exports = new AiClient();
