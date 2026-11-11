const aiClient = require('./ai.client');
const { aiParsedSettingsSchema } = require('../validators/ai.validator');
const logger = require('../utils/logger');

const SYSTEM_PROMPT = `You are the AI Print Assistant for SMART QR PRINT by Team VisionX Debug.
Translate natural language commands (English or Hinglish) into structured print settings.
Output a JSON object ONLY with this shape:
{
  "thoughtProcess": "short step-by-step reasoning",
  "extractedSettings": {
    "pageSelection": "all" | "custom" | "odd" | "even",
    "customRange": "string e.g. 2-5",
    "copies": number,
    "colorMode": "bw" | "color" | "smart_mixed",
    "duplex": "simplex" | "duplex",
    "paperSize": "A4" | "Letter" | "Legal",
    "quality": "draft" | "normal" | "best",
    "staple": boolean
  },
  "naturalReply": "friendly response in conversational tone",
  "recommendations": ["string array of eco/cost saving recommendations"]
}`;

async function interpretPrintCommand(prompt, docMeta = null, currentSettings = null) {
  if (!aiClient.isAvailable()) {
    return null;
  }

  const userContext = `Prompt: "${prompt}"\nDocument Context: ${JSON.stringify(docMeta || {})}\nCurrent Settings: ${JSON.stringify(currentSettings || {})}`;

  try {
    const rawAiOutput = await aiClient.generateJson(SYSTEM_PROMPT, userContext);
    if (!rawAiOutput || !rawAiOutput.extractedSettings) {
      return null;
    }

    // Zod re-validation to enforce schema safety
    const validatedSettings = aiParsedSettingsSchema.parse(rawAiOutput.extractedSettings);

    return {
      thoughtProcess: rawAiOutput.thoughtProcess || 'Processed via Cloud AI',
      extractedSettings: validatedSettings,
      naturalReply: rawAiOutput.naturalReply || 'Settings updated.',
      recommendations: Array.isArray(rawAiOutput.recommendations) ? rawAiOutput.recommendations : [],
      confidence: 0.98
    };
  } catch (err) {
    logger.warn('AI structured output failed validation, falling back to deterministic parser', err);
    return null;
  }
}

module.exports = {
  interpretPrintCommand
};
