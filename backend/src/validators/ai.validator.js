const { z } = require('zod');

const interpretPromptSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt cannot be empty'),
    documentId: z.string().optional(),
    currentSettings: z.record(z.any()).optional()
  })
});

const aiParsedSettingsSchema = z.object({
  pageSelection: z.enum(['all', 'custom', 'odd', 'even']).optional(),
  customRange: z.string().optional(),
  copies: z.number().int().min(1).max(100).optional(),
  colorMode: z.enum(['bw', 'color', 'smart_mixed']).optional(),
  duplex: z.enum(['simplex', 'duplex']).optional(),
  paperSize: z.enum(['A4', 'Letter', 'Legal']).optional(),
  quality: z.enum(['draft', 'normal', 'best']).optional(),
  staple: z.boolean().optional()
});

module.exports = {
  interpretPromptSchema,
  aiParsedSettingsSchema
};
