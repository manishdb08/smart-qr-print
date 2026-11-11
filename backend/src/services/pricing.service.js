const config = require('../config');
const { resolvePageSelection } = require('../utils/pageRange');

function calculateJobPricing(docMeta, settings) {
  const maxPages = docMeta?.totalPages || 1;
  const selectedPages = resolvePageSelection(settings.pageSelection, settings.customRange, maxPages);
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
    const colorSet = new Set(docMeta?.colorPages || []);
    const colorInSelection = selectedPages.filter(p => colorSet.has(p)).length;
    const bwInSelection = selectedPages.length - colorInSelection;

    colorCount = colorInSelection * copies;
    bwCount = bwInSelection * copies;
  }

  const bwSubtotal = bwCount * config.PRICE_BW;
  const colorSubtotal = colorCount * config.PRICE_COLOR;
  let grossTotal = bwSubtotal + colorSubtotal;

  if (settings.staple) {
    grossTotal += 3.0 * copies;
  }

  // Duplex discount (15%)
  let duplexDiscount = 0;
  if (settings.duplex === 'duplex' && totalPagesSelected > 1) {
    duplexDiscount = grossTotal * config.DUPLEX_DISCOUNT;
  }

  // Bulk discount (10%)
  let bulkDiscount = 0;
  if (totalPagesSelected >= config.BULK_THRESHOLD) {
    bulkDiscount = (grossTotal - duplexDiscount) * config.BULK_DISCOUNT;
  }

  const netTotal = Math.max(0, Math.round((grossTotal - duplexDiscount - bulkDiscount) * 100) / 100);

  return {
    totalPagesToPrint: totalPagesSelected,
    bwPagesCount: bwCount,
    colorPagesCount: colorCount,
    bwUnitPrice: config.PRICE_BW,
    colorUnitPrice: config.PRICE_COLOR,
    bwSubtotal: Math.round(bwSubtotal * 100) / 100,
    colorSubtotal: Math.round(colorSubtotal * 100) / 100,
    duplexDiscount: Math.round(duplexDiscount * 100) / 100,
    bulkDiscount: Math.round(bulkDiscount * 100) / 100,
    grossTotal: Math.round(grossTotal * 100) / 100,
    netTotal,
    currency: config.CURRENCY
  };
}

module.exports = {
  calculateJobPricing
};
