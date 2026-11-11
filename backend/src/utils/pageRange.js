function resolvePageSelection(selection, customRange, maxPages) {
  if (!maxPages || maxPages <= 0) {
    return [];
  }

  const allPages = Array.from({ length: maxPages }, (_, i) => i + 1);

  if (selection === 'all') {
    return allPages;
  }

  if (selection === 'odd') {
    return allPages.filter(p => p % 2 !== 0);
  }

  if (selection === 'even') {
    return allPages.filter(p => p % 2 === 0);
  }

  if (selection === 'custom' || customRange) {
    return parseCustomPageRange(customRange || '', maxPages);
  }

  return allPages;
}

function parseCustomPageRange(rangeStr, maxPages) {
  if (!rangeStr || typeof rangeStr !== 'string' || !rangeStr.trim()) {
    return Array.from({ length: maxPages }, (_, i) => i + 1);
  }

  const pagesSet = new Set();
  const tokens = rangeStr.split(/[,;\s]+/).map(t => t.trim()).filter(Boolean);

  for (const token of tokens) {
    if (token.includes('-')) {
      const [startStr, endStr] = token.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(maxPages, Math.max(start, end));
        for (let i = from; i <= to; i++) {
          pagesSet.add(i);
        }
      }
    } else {
      const pageNum = parseInt(token, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        pagesSet.add(pageNum);
      }
    }
  }

  const result = Array.from(pagesSet).sort((a, b) => a - b);
  return result.length > 0 ? result : Array.from({ length: maxPages }, (_, i) => i + 1);
}

module.exports = {
  resolvePageSelection,
  parseCustomPageRange
};
