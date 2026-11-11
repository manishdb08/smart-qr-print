const { parsePrintIntent } = require('./parser.service');
const { interpretPrintCommand } = require('./ai.service');

async function processAssistantRequest(prompt, docMeta = null, currentSettings = null) {
  // First run deterministic parser
  const deterministicResult = parsePrintIntent(prompt, docMeta);

  // If AI service is available, run and merge
  const aiResult = await interpretPrintCommand(prompt, docMeta, currentSettings);

  const finalSettings = {
    ...deterministicResult.extracted,
    ...(aiResult?.extractedSettings || {})
  };

  const recommendations = [];
  if (docMeta) {
    if (docMeta.colorPages && docMeta.colorPages.length > 0 && finalSettings.colorMode === 'color') {
      recommendations.push(
        `💡 Smart Optimization: Only pages ${docMeta.colorPages.join(', ')} contain color graphics. Switch to 'Smart Mixed' mode to print text in B&W and save up to 40% on ink costs.`
      );
    }
    if (docMeta.totalPages > 3 && finalSettings.duplex !== 'duplex') {
      recommendations.push(
        `🌱 Eco-Recommendation: This document is ${docMeta.totalPages} pages long. Enabling Double-Sided (Duplex) saves paper and gets a 15% discount!`
      );
    }
  }

  if (aiResult?.recommendations) {
    recommendations.push(...aiResult.recommendations);
  }

  // Construct natural reply
  const parts = [];
  if (finalSettings.customRange) parts.push(`pages ${finalSettings.customRange}`);
  if (finalSettings.copies) parts.push(`${finalSettings.copies} copies`);
  if (finalSettings.colorMode) parts.push(finalSettings.colorMode === 'bw' ? 'in Black & White' : finalSettings.colorMode === 'color' ? 'in Full Color' : 'in Smart Mixed mode');
  if (finalSettings.duplex) parts.push(finalSettings.duplex === 'duplex' ? 'double-sided' : 'single-sided');

  const naturalReply = aiResult?.naturalReply || (parts.length > 0
    ? `Configured settings for: ${parts.join(', ')}. Backend pricing updated.`
    : `I analyzed your request: "${prompt}". Ready to adjust pages, copies, color or duplex.`);

  return {
    source: aiResult ? 'hybrid_ai' : 'deterministic',
    extractedSettings: finalSettings,
    naturalReply,
    recommendations: Array.from(new Set(recommendations)),
    thoughts: aiResult?.thoughtProcess || deterministicResult.thoughts.join(' → '),
    confidence: aiResult?.confidence || deterministicResult.confidence
  };
}

module.exports = {
  processAssistantRequest
};
