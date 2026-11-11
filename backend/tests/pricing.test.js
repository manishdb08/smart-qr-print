const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
require('./setup-env');
const { calculateJobPricing } = require('../src/services/pricing.service');

describe('Pricing Engine Service Tests', () => {
  const baseDoc = { totalPages: 10, colorPages: [2, 5] };

  test('Calculates standard B&W pricing', () => {
    const settings = {
      pageSelection: 'all',
      copies: 1,
      colorMode: 'bw',
      duplex: 'simplex',
      staple: false
    };

    const p = calculateJobPricing(baseDoc, settings);
    assert.equal(p.totalPagesToPrint, 10);
    assert.equal(p.bwPagesCount, 10);
    assert.equal(p.colorPagesCount, 0);
    assert.equal(p.bwSubtotal, 20.0);
    // 10 pages qualifies for 10% bulk discount
    assert.equal(p.bulkDiscount, 2.0);
    assert.equal(p.netTotal, 18.0);
  });

  test('Calculates Smart Mixed Color pricing', () => {
    const settings = {
      pageSelection: 'all',
      copies: 1,
      colorMode: 'smart_mixed',
      duplex: 'simplex',
      staple: false
    };

    const p = calculateJobPricing(baseDoc, settings);
    assert.equal(p.bwPagesCount, 8); // 8 pages B&W
    assert.equal(p.colorPagesCount, 2); // 2 pages Color
    assert.equal(p.bwSubtotal, 16.0); // 8 * 2.0
    assert.equal(p.colorSubtotal, 16.0); // 2 * 8.0
    assert.equal(p.grossTotal, 32.0);
  });

  test('Applies 15% Duplex paper saving discount', () => {
    const settings = {
      pageSelection: 'custom',
      customRange: '1-4',
      copies: 1,
      colorMode: 'bw',
      duplex: 'duplex',
      staple: false
    };

    const p = calculateJobPricing(baseDoc, settings);
    assert.equal(p.totalPagesToPrint, 4);
    assert.equal(p.bwSubtotal, 8.0);
    assert.equal(p.duplexDiscount, 1.2); // 15% of 8.0
    assert.equal(p.netTotal, 6.8);
  });
});
