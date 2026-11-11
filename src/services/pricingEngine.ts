import { DocumentMeta, PrintSettings, PriceBreakdown } from '../types';

export const RATES = {
  bwPerPage: 2.0,      // in currency units (e.g. ₹ / INR)
  colorPerPage: 8.0,
  duplexDiscountRatio: 0.15, // 15% discount when duplex printing
  bulkThresholdPages: 10,
  bulkDiscountRatio: 0.10,   // 10% discount on orders > 10 pages
  stapleFee: 3.0,
  currency: '₹'
};

export function parsePageRange(rangeStr: string, maxPages: number): number[] {
  if (!rangeStr || !rangeStr.trim()) {
    return Array.from({ length: maxPages }, (_, i) => i + 1);
  }

  const pagesSet = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(maxPages, Math.max(start, end));
        for (let p = from; p <= to; p++) {
          pagesSet.add(p);
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= maxPages) {
        pagesSet.add(p);
      }
    }
  }

  const result = Array.from(pagesSet).sort((a, b) => a - b);
  return result.length > 0 ? result : Array.from({ length: maxPages }, (_, i) => i + 1);
}

export function getSelectedPages(settings: PrintSettings, doc: DocumentMeta): number[] {
  const all = Array.from({ length: doc.totalPages }, (_, i) => i + 1);
  if (settings.pageSelection === 'all') {
    return all;
  }
  if (settings.pageSelection === 'odd') {
    return all.filter(p => p % 2 !== 0);
  }
  if (settings.pageSelection === 'even') {
    return all.filter(p => p % 2 === 0);
  }
  if (settings.pageSelection === 'custom') {
    return parsePageRange(settings.customRange, doc.totalPages);
  }
  return all;
}

export function calculatePrintPricing(doc: DocumentMeta, settings: PrintSettings): PriceBreakdown {
  const selectedPages = getSelectedPages(settings, doc);
  const copies = Math.max(1, settings.copies || 1);
  const totalPagesSelected = selectedPages.length * copies;

  let bwCount = 0;
  let colorCount = 0;

  if (settings.colorMode === 'bw') {
    bwCount = totalPagesSelected;
    colorCount = 0;
  } else if (settings.colorMode === 'color') {
    colorCount = totalPagesSelected;
    bwCount = 0;
  } else {
    // Smart mixed: only pages designated with color will be charged color rate
    const colorSet = new Set(doc.colorPages);
    const colorPagesInSelection = selectedPages.filter(p => colorSet.has(p)).length;
    const bwPagesInSelection = selectedPages.length - colorPagesInSelection;

    colorCount = colorPagesInSelection * copies;
    bwCount = bwPagesInSelection * copies;
  }

  const bwSubtotal = bwCount * RATES.bwPerPage;
  const colorSubtotal = colorCount * RATES.colorPerPage;
  let grossTotal = bwSubtotal + colorSubtotal;

  if (settings.staple) {
    grossTotal += RATES.stapleFee * copies;
  }

  // Duplex discount
  let duplexDiscount = 0;
  if (settings.duplex === 'duplex' && totalPagesSelected > 1) {
    duplexDiscount = grossTotal * RATES.duplexDiscountRatio;
  }

  // Bulk discount
  let bulkDiscount = 0;
  if (totalPagesSelected >= RATES.bulkThresholdPages) {
    bulkDiscount = (grossTotal - duplexDiscount) * RATES.bulkDiscountRatio;
  }

  const netTotal = Math.max(0, Math.round((grossTotal - duplexDiscount - bulkDiscount) * 100) / 100);

  return {
    totalPagesToPrint: totalPagesSelected,
    bwPagesCount: bwCount,
    colorPagesCount: colorCount,
    bwUnitPrice: RATES.bwPerPage,
    colorUnitPrice: RATES.colorPerPage,
    bwSubtotal: Math.round(bwSubtotal * 100) / 100,
    colorSubtotal: Math.round(colorSubtotal * 100) / 100,
    duplexDiscount: Math.round(duplexDiscount * 100) / 100,
    bulkDiscount: Math.round(bulkDiscount * 100) / 100,
    grossTotal: Math.round(grossTotal * 100) / 100,
    netTotal,
    currency: RATES.currency
  };
}
