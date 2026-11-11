const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
require('./setup-env');

const { resolvePageSelection, parseCustomPageRange } = require('../src/utils/pageRange');
const { parsePrintIntent } = require('../src/services/parser.service');
const { calculateJobPricing } = require('../src/services/pricing.service');
const AppError = require('../src/utils/AppError');
const { NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError } = require('../src/utils/errors');
const { generateSessionId, generateJobId, generateDocumentId, generatePinCode } = require('../src/utils/ids');
const { createKioskQrPayload, generateQrDataUrl, generateQrSvg } = require('../src/services/qr.service');

describe('Unit Tests: Utilities & Domain Logic', () => {
  // Page Range Tests
  test('PageRange: empty or negative pages returns empty array', () => {
    assert.deepEqual(resolvePageSelection('all', '', 0), []);
    assert.deepEqual(resolvePageSelection('all', '', -5), []);
  });

  test('PageRange: resolves "all" to full page list', () => {
    const pages = resolvePageSelection('all', '', 8);
    assert.deepEqual(pages, [1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('PageRange: resolves "odd" pages only', () => {
    const pages = resolvePageSelection('odd', '', 8);
    assert.deepEqual(pages, [1, 3, 5, 7]);
  });

  test('PageRange: resolves "even" pages only', () => {
    const pages = resolvePageSelection('even', '', 8);
    assert.deepEqual(pages, [2, 4, 6, 8]);
  });

  test('PageRange: resolves custom ranges like "2-5"', () => {
    const pages = parseCustomPageRange('2-5', 10);
    assert.deepEqual(pages, [2, 3, 4, 5]);
  });

  test('PageRange: handles inverted ranges gracefully like "5-2"', () => {
    const pages = parseCustomPageRange('5-2', 10);
    assert.deepEqual(pages, [2, 3, 4, 5]);
  });

  test('PageRange: clamps out-of-bound ranges to maxPages', () => {
    const pages = parseCustomPageRange('8-25', 10);
    assert.deepEqual(pages, [8, 9, 10]);
  });

  test('PageRange: resolves compound ranges like "1, 3, 6-8"', () => {
    const pages = parseCustomPageRange('1, 3, 6-8', 10);
    assert.deepEqual(pages, [1, 3, 6, 7, 8]);
  });

  test('PageRange: deduplicates and sorts overlapping tokens', () => {
    const pages = parseCustomPageRange('3, 1-4, 2, 5', 10);
    assert.deepEqual(pages, [1, 2, 3, 4, 5]);
  });

  // Parser Tests
  test('Parser: extracts English intent "Print pages 2 to 5, two copies in black and white"', () => {
    const result = parsePrintIntent('Print pages 2 to 5, two copies in black and white');
    assert.equal(result.extracted.copies, 2);
    assert.equal(result.extracted.pageSelection, 'custom');
    assert.equal(result.extracted.customRange, '2-5');
    assert.equal(result.extracted.colorMode, 'bw');
  });

  test('Parser: extracts Hinglish intent "3 copy nikal do double sided rangeen"', () => {
    const result = parsePrintIntent('3 copy nikal do double sided rangeen');
    assert.equal(result.extracted.copies, 3);
    assert.equal(result.extracted.duplex, 'duplex');
    assert.equal(result.extracted.colorMode, 'color');
  });

  test('Parser: extracts "pura document b&w me chahiye, dono taraf"', () => {
    const result = parsePrintIntent('pura document b&w me chahiye, dono taraf');
    assert.equal(result.extracted.pageSelection, 'all');
    assert.equal(result.extracted.colorMode, 'bw');
    assert.equal(result.extracted.duplex, 'duplex');
  });

  test('Parser: extracts paper size A4 and Letter', () => {
    const r1 = parsePrintIntent('print 1 copy on a4 paper');
    assert.equal(r1.extracted.paperSize, 'A4');
    const r2 = parsePrintIntent('use letter size high quality');
    assert.equal(r2.extracted.paperSize, 'Letter');
    assert.equal(r2.extracted.quality, 'best');
  });

  test('Parser: handles words for quantities "char copy"', () => {
    const r = parsePrintIntent('char copy nikal do');
    assert.equal(r.extracted.copies, 4);
  });

  test('Parser: extracts "pehle 3 pages" (first 3 pages)', () => {
    const r = parsePrintIntent('pehle 3 pages print karo');
    assert.equal(r.extracted.customRange, '1-3');
  });

  // Pricing Engine Tests
  test('Pricing: calculates correct costs with duplex discount', () => {
    const docMeta = { totalPages: 4, colorPages: [2] };
    const settings = {
      pageSelection: 'all',
      copies: 1,
      colorMode: 'bw',
      duplex: 'duplex',
      paperSize: 'A4',
      orientation: 'portrait',
      quality: 'normal',
      staple: false
    };

    const pricing = calculateJobPricing(docMeta, settings);
    assert.equal(pricing.totalPagesToPrint, 4);
    assert.equal(pricing.bwSubtotal, 8.0); // 4 * 2.0
    assert.equal(pricing.duplexDiscount, 1.2); // 15% of 8.0
    assert.equal(pricing.netTotal, 6.8);
  });

  test('Pricing: adds stapling fee when requested', () => {
    const docMeta = { totalPages: 4, colorPages: [] };
    const settings = {
      pageSelection: 'all',
      copies: 2,
      colorMode: 'bw',
      duplex: 'simplex',
      staple: true
    };
    const pricing = calculateJobPricing(docMeta, settings);
    assert.equal(pricing.grossTotal, 16.0 + 6.0); // (8 pages * 2) + (2 copies * 3.0)
  });

  // Errors Tests
  test('AppError: preserves HTTP status and operational flag', () => {
    const err = new AppError('Resource missing', 404);
    assert.equal(err.statusCode, 404);
    assert.equal(err.status, 'fail');
    assert.equal(err.isOperational, true);
  });

  test('Specific Errors: NotFound, Validation, Unauthorized, Forbidden, Conflict', () => {
    assert.equal(new NotFoundError().statusCode, 404);
    assert.equal(new ValidationError().statusCode, 400);
    assert.equal(new UnauthorizedError().statusCode, 401);
    assert.equal(new ForbiddenError().statusCode, 403);
    assert.equal(new ConflictError().statusCode, 409);
  });

  // IDs Tests
  test('IDs: generates valid formatted IDs', () => {
    assert.ok(generateSessionId().startsWith('ses_'));
    assert.ok(generateJobId().startsWith('job_'));
    assert.ok(generateDocumentId().startsWith('doc_'));
    const pin = generatePinCode();
    assert.equal(pin.length, 6);
    assert.ok(!isNaN(parseInt(pin, 10)));
  });

  // QR Code Tests
  test('QR Service: constructs valid payload, dataUrl and SVG', async () => {
    const payload = createKioskQrPayload('LIB-4091');
    assert.ok(payload.includes('LIB-4091'));

    const dataUrl = await generateQrDataUrl(payload);
    assert.ok(dataUrl.startsWith('data:image/png;base64,'));

    const svg = await generateQrSvg(payload);
    assert.ok(svg.includes('<svg'));
  });
});
