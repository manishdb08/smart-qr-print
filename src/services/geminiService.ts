import { DocumentMeta, PrintSettings } from '../types';

export interface AIInterpretationResult {
  thoughtProcess: string;
  extractedSettings: Partial<PrintSettings>;
  naturalReply: string;
  recommendations: string[];
  confidence: number;
}

// Local high-precision fallback NLP interpreter
export function parseNaturalLanguagePrintPrompt(
  prompt: string,
  currentDoc?: DocumentMeta,
  currentSettings?: PrintSettings
): AIInterpretationResult {
  const lower = prompt.toLowerCase();
  const extracted: Partial<PrintSettings> = {};
  const recommendations: string[] = [];
  const thoughts: string[] = [];

  thoughts.push(`Analyzing input text: "${prompt}"`);

  // 1. Detect Copies
  const copiesMatch =
    lower.match(/(\d+)\s*(?:copies|sets|copy|prints)/i) ||
    lower.match(/(?:make|need|print)\s+(\d+)\s+(?:copies|sets|copy)/i) ||
    lower.match(/(?:two|three|four|five|six|seven|eight|nine|ten)\s+copies/i);

  if (copiesMatch) {
    let copies = 1;
    const numWordMap: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    if (copiesMatch[1] && !isNaN(parseInt(copiesMatch[1], 10))) {
      copies = parseInt(copiesMatch[1], 10);
    } else {
      const word = copiesMatch[0].split(' ')[0].toLowerCase();
      if (numWordMap[word]) copies = numWordMap[word];
    }
    extracted.copies = Math.min(50, Math.max(1, copies));
    thoughts.push(`Extracted copies quantity: ${extracted.copies}`);
  }

  // 2. Detect Page Range / Selection
  if (lower.includes('odd pages') || lower.includes('only odd')) {
    extracted.pageSelection = 'odd';
    thoughts.push('Set page selection mode: Odd pages only');
  } else if (lower.includes('even pages') || lower.includes('only even')) {
    extracted.pageSelection = 'even';
    thoughts.push('Set page selection mode: Even pages only');
  } else if (lower.includes('all pages') || lower.includes('entire document') || lower.includes('whole document')) {
    extracted.pageSelection = 'all';
    thoughts.push('Set page selection mode: All pages');
  } else {
    // Custom range like "pages 2 to 5", "page 2-5", "pages 1, 3, 5"
    const rangeMatch =
      lower.match(/pages?\s*(\d+)\s*(?:to|-)\s*(\d+)/i) ||
      lower.match(/pages?\s*([\d\s,-]+)/i) ||
      lower.match(/first\s*(\d+)\s*pages?/i);

    if (rangeMatch) {
      if (lower.includes('first') && rangeMatch[1]) {
        const count = parseInt(rangeMatch[1], 10);
        extracted.pageSelection = 'custom';
        extracted.customRange = `1-${count}`;
        thoughts.push(`Extracted initial page range: 1-${count}`);
      } else if (rangeMatch[2]) {
        extracted.pageSelection = 'custom';
        extracted.customRange = `${rangeMatch[1]}-${rangeMatch[2]}`;
        thoughts.push(`Extracted bounded page range: ${extracted.customRange}`);
      } else if (rangeMatch[1]) {
        const cleaned = rangeMatch[1].trim();
        if (cleaned && /\d/.test(cleaned)) {
          extracted.pageSelection = 'custom';
          extracted.customRange = cleaned.replace(/\s+/g, '');
          thoughts.push(`Extracted custom page range: ${extracted.customRange}`);
        }
      }
    }
  }

  // 3. Detect Color Mode
  if (lower.includes('black and white') || lower.includes('black & white') || lower.includes('b&w') || lower.includes('grayscale') || lower.includes('mono') || lower.includes('monochrome')) {
    extracted.colorMode = 'bw';
    thoughts.push('Configured color mode: Black & White (Monochrome)');
  } else if (lower.includes('smart mixed') || lower.includes('mixed mode') || lower.includes('smart color')) {
    extracted.colorMode = 'smart_mixed';
    thoughts.push('Configured color mode: Smart Mixed (Only charts in color, text in B&W)');
  } else if (lower.includes('color') || lower.includes('colour') || lower.includes('full color')) {
    extracted.colorMode = 'color';
    thoughts.push('Configured color mode: Full Color');
  }

  // 4. Detect Duplex / Two-sided
  if (lower.includes('double sided') || lower.includes('both sides') || lower.includes('two sided') || lower.includes('duplex')) {
    extracted.duplex = 'duplex';
    thoughts.push('Duplex printing enabled: Front and Back (eco-saving)');
  } else if (lower.includes('single sided') || lower.includes('one side') || lower.includes('simplex')) {
    extracted.duplex = 'simplex';
    thoughts.push('Duplex printing disabled: Simplex (one-sided only)');
  }

  // 5. Detect Paper Size
  if (lower.includes('a4')) {
    extracted.paperSize = 'A4';
  } else if (lower.includes('letter')) {
    extracted.paperSize = 'Letter';
  } else if (lower.includes('legal')) {
    extracted.paperSize = 'Legal';
  }

  // 6. Detect Quality
  if (lower.includes('draft') || lower.includes('eco') || lower.includes('quick')) {
    extracted.quality = 'draft';
  } else if (lower.includes('best') || lower.includes('high quality') || lower.includes('photo') || lower.includes('presentation')) {
    extracted.quality = 'best';
  }

  // 7. Detect Stapling
  if (lower.includes('staple') || lower.includes('stapled') || lower.includes('bind')) {
    extracted.staple = true;
    thoughts.push('Added corner staple request');
  }

  // 8. Smart Document Analysis & Recommendations
  if (currentDoc) {
    const hasColorPages = currentDoc.colorPages.length > 0;
    const isHeavyDoc = currentDoc.totalPages > 4;

    if (hasColorPages && extracted.colorMode === 'color') {
      recommendations.push(
        `💡 Smart Optimization: Only pages ${currentDoc.colorPages.join(', ')} contain color images. Switch to 'Smart Mixed' mode to print text in B&W and save up to 40% on ink costs.`
      );
    }

    if (isHeavyDoc && extracted.duplex !== 'duplex') {
      recommendations.push(
        `🌱 Eco-Recommendation: This document is ${currentDoc.totalPages} pages long. Enabling Double-Sided (Duplex) printing will save ${Math.ceil(currentDoc.totalPages / 2)} paper sheets and get a 15% discount!`
      );
    }

    if (!extracted.copies && currentSettings?.copies === 1) {
      recommendations.push('Tip: You can specify quantities easily, e.g. "make 2 copies".');
    }
  }

  // Formulate conversational response
  const summaryParts: string[] = [];
  if (extracted.pageSelection === 'custom' && extracted.customRange) {
    summaryParts.push(`pages ${extracted.customRange}`);
  } else if (extracted.pageSelection === 'odd') {
    summaryParts.push('odd pages only');
  } else if (extracted.pageSelection === 'even') {
    summaryParts.push('even pages only');
  } else if (extracted.pageSelection === 'all') {
    summaryParts.push('all pages');
  }

  if (extracted.copies) {
    summaryParts.push(`${extracted.copies} ${extracted.copies === 1 ? 'copy' : 'copies'}`);
  }

  if (extracted.colorMode) {
    summaryParts.push(
      extracted.colorMode === 'bw'
        ? 'in Black & White'
        : extracted.colorMode === 'color'
        ? 'in Full Color'
        : 'in Smart Mixed mode'
    );
  }

  if (extracted.duplex) {
    summaryParts.push(extracted.duplex === 'duplex' ? 'double-sided' : 'single-sided');
  }

  const naturalReply = summaryParts.length > 0
    ? `I have updated your print settings for: ${summaryParts.join(', ')}. Backend cost recalculation has been applied.`
    : `I analyzed your request. I didn't detect specific parameter changes, but I'm ready to adjust copies, page ranges, color mode, or paper sizes whenever you ask!`;

  return {
    thoughtProcess: thoughts.join(' → '),
    extractedSettings: extracted,
    naturalReply,
    recommendations,
    confidence: 0.94
  };
}

// Call live Gemini API if user supplies API key
export async function callGeminiForPrintIntent(
  apiKey: string,
  userPrompt: string,
  currentDoc?: DocumentMeta,
  currentSettings?: PrintSettings
): Promise<AIInterpretationResult> {
  if (!apiKey || !apiKey.trim()) {
    return parseNaturalLanguagePrintPrompt(userPrompt, currentDoc, currentSettings);
  }

  try {
    const systemPrompt = `You are the AI Print Assistant for SMART QR PRINT by Team VisionX Debug.
Your task is to parse the user's natural language print request into structured JSON print settings and provide smart recommendations.
Document Details:
- Name: ${currentDoc?.name || 'Unknown'}
- Total Pages: ${currentDoc?.totalPages || 1}
- Color Pages: ${currentDoc?.colorPages.join(', ') || 'None'}
- Current Settings: ${JSON.stringify(currentSettings || {})}

Return a valid JSON object ONLY with the following schema:
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
  "naturalReply": "friendly conversational confirmation to user",
  "recommendations": ["string array of eco/cost saving recommendations"],
  "confidence": number
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Print Command: "${userPrompt}"` }] }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.warn('Gemini API call failed, falling back to local NLP parser');
      return parseNaturalLanguagePrintPrompt(userPrompt, currentDoc, currentSettings);
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textOutput) {
      const parsed = JSON.parse(textOutput);
      return {
        thoughtProcess: parsed.thoughtProcess || 'Processed via Gemini 2.5 Flash',
        extractedSettings: parsed.extractedSettings || {},
        naturalReply: parsed.naturalReply || 'Settings updated successfully.',
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 0.98
      };
    }
  } catch (err) {
    console.error('Error invoking Gemini API:', err);
  }

  return parseNaturalLanguagePrintPrompt(userPrompt, currentDoc, currentSettings);
}
