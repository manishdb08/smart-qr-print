const { z } = require('zod');

const pageSelectionSchema = z.enum(['all', 'custom', 'odd', 'even']).default('all');
const colorModeSchema = z.enum(['bw', 'color', 'smart_mixed']).default('bw');
const duplexSchema = z.enum(['simplex', 'duplex']).default('simplex');
const paperSizeSchema = z.enum(['A4', 'Letter', 'Legal']).default('A4');
const qualitySchema = z.enum(['draft', 'normal', 'best']).default('normal');

const printSettingsSchema = z.object({
  pageSelection: pageSelectionSchema,
  customRange: z.string().optional().default(''),
  copies: z.number().int().min(1).max(100).default(1),
  colorMode: colorModeSchema,
  duplex: duplexSchema,
  paperSize: paperSizeSchema,
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  quality: qualitySchema,
  staple: z.boolean().default(false)
});

module.exports = {
  pageSelectionSchema,
  colorModeSchema,
  duplexSchema,
  paperSizeSchema,
  qualitySchema,
  printSettingsSchema
};
