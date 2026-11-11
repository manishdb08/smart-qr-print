const { resolvePageSelection } = require('../utils/pageRange');

function parsePrintIntent(prompt, docMeta = null) {
  if (!prompt || typeof prompt !== 'string') {
    return { extracted: {}, thoughts: [], confidence: 0 };
  }

  const raw = prompt.trim();
  const lower = raw.toLowerCase();
  const extracted = {};
  const thoughts = [];

  thoughts.push(`Input analyzed: "${raw}"`);

  // 1. Detect Copies (English & Hinglish)
  // e.g. "3 copies", "2 copy", "teen copy", "do sets", "paanch print"
  const hinglishNumberMap = {
    ek: 1, do: 2, teen: 3, chaar: 4, char: 4, paanch: 5, panch: 5,
    chhe: 6, che: 6, saat: 7, aath: 8, nau: 9, das: 10,
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10
  };

  const copyRegex = /(\d+)\s*(?:copies|sets|copy|prints|prat|pratiyan)/i;
  const wordCopyRegex = /(ek|do|teen|chaar|char|paanch|panch|chhe|saat|aath|nau|das|one|two|three|four|five)\s+(?:copies|sets|copy|print)/i;

  const matchNum = lower.match(copyRegex);
  const matchWord = lower.match(wordCopyRegex);

  if (matchNum) {
    extracted.copies = Math.min(100, Math.max(1, parseInt(matchNum[1], 10)));
    thoughts.push(`Extracted copies: ${extracted.copies}`);
  } else if (matchWord) {
    const word = matchWord[1].toLowerCase();
    if (hinglishNumberMap[word]) {
      extracted.copies = hinglishNumberMap[word];
      thoughts.push(`Extracted copies from word '${word}': ${extracted.copies}`);
    }
  }

  // 2. Detect Page Selection / Ranges (English & Hinglish)
  // "odd pages", "even pages", "vishesh", "sirf odd", "even number"
  if (lower.includes('odd page') || lower.includes('sirf odd') || lower.includes('only odd')) {
    extracted.pageSelection = 'odd';
    thoughts.push('Page selection: Odd pages only');
  } else if (lower.includes('even page') || lower.includes('sirf even') || lower.includes('only even')) {
    extracted.pageSelection = 'even';
    thoughts.push('Page selection: Even pages only');
  } else if (lower.includes('pura') || lower.includes('poora') || lower.includes('all pages') || lower.includes('entire') || lower.includes('whole')) {
    extracted.pageSelection = 'all';
    thoughts.push('Page selection: All pages');
  } else {
    // Custom page ranges: "pages 2 to 5", "page 2 se 5", "page 1-4", "first 3 pages", "pehle 3 pages"
    const firstNMatch = lower.match(/(?:first|starting|pehle)\s*(\d+)\s*pages?/i);
    const rangeToMatch = lower.match(/pages?\s*(\d+)\s*(?:to|se|-)\s*(\d+)/i);
    const genericPagesMatch = lower.match(/pages?\s*([\d\s,-]+)/i);

    if (firstNMatch && firstNMatch[1]) {
      const count = parseInt(firstNMatch[1], 10);
      extracted.pageSelection = 'custom';
      extracted.customRange = `1-${count}`;
      thoughts.push(`Page range: 1 to ${count}`);
    } else if (rangeToMatch && rangeToMatch[1] && rangeToMatch[2]) {
      extracted.pageSelection = 'custom';
      extracted.customRange = `${rangeToMatch[1]}-${rangeToMatch[2]}`;
      thoughts.push(`Page range: ${extracted.customRange}`);
    } else if (genericPagesMatch && genericPagesMatch[1] && /\d/.test(genericPagesMatch[1])) {
      extracted.pageSelection = 'custom';
      extracted.customRange = genericPagesMatch[1].trim().replace(/\s+/g, '');
      thoughts.push(`Page range: ${extracted.customRange}`);
    }
  }

  // 3. Color Mode (English & Hinglish)
  // "black and white", "b&w", "kale safed", "kala", "grayscale", "rangeen", "color", "colour"
  if (
    lower.includes('black and white') ||
    lower.includes('black & white') ||
    lower.includes('b&w') ||
    lower.includes('bw') ||
    lower.includes('grayscale') ||
    lower.includes('kala') ||
    lower.includes('kale safed') ||
    lower.includes('monochrome')
  ) {
    extracted.colorMode = 'bw';
    thoughts.push('Color mode: Monochrome / B&W');
  } else if (lower.includes('smart mixed') || lower.includes('mixed')) {
    extracted.colorMode = 'smart_mixed';
    thoughts.push('Color mode: Smart Mixed');
  } else if (
    lower.includes('color') ||
    lower.includes('colour') ||
    lower.includes('rangeen') ||
    lower.includes('rangin')
  ) {
    extracted.colorMode = 'color';
    thoughts.push('Color mode: Full Color');
  }

  // 4. Duplex / Double-sided (English & Hinglish)
  // "double sided", "double-sided", "both sides", "dono side", "dono taraf", "single side", "ek side"
  if (
    lower.includes('double sided') ||
    lower.includes('double-sided') ||
    lower.includes('both sides') ||
    lower.includes('dono side') ||
    lower.includes('dono taraf') ||
    lower.includes('aage peeche') ||
    lower.includes('duplex')
  ) {
    extracted.duplex = 'duplex';
    thoughts.push('Duplex: Double-sided (Eco)');
  } else if (
    lower.includes('single sided') ||
    lower.includes('single-sided') ||
    lower.includes('one side') ||
    lower.includes('ek side') ||
    lower.includes('ek taraf') ||
    lower.includes('simplex')
  ) {
    extracted.duplex = 'simplex';
    thoughts.push('Duplex: Single-sided');
  }

  // 5. Paper Size
  if (lower.includes('a4')) extracted.paperSize = 'A4';
  if (lower.includes('letter')) extracted.paperSize = 'Letter';
  if (lower.includes('legal')) extracted.paperSize = 'Legal';

  // 6. Quality
  if (lower.includes('draft') || lower.includes('eco') || lower.includes('sasta')) {
    extracted.quality = 'draft';
  } else if (lower.includes('best') || lower.includes('high quality') || lower.includes('badhiya')) {
    extracted.quality = 'best';
  }

  // 7. Staple / Binding
  if (lower.includes('staple') || lower.includes('pin') || lower.includes('bind')) {
    extracted.staple = true;
  }

  const confidence = Object.keys(extracted).length > 0 ? 0.95 : 0.4;

  return {
    extracted,
    thoughts,
    confidence
  };
}

module.exports = {
  parsePrintIntent
};
