const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
require('./setup-env');
const { setupTestDb, teardownTestDb } = require('./helpers');
const { createSession } = require('../src/services/session.service');
const { processAndSaveDocument } = require('../src/services/document.service');

describe('Document Service & PDF Ingestion Tests', () => {
  let samplePdfPath = '';
  let session = null;

  before(async () => {
    setupTestDb();
    session = await createSession('LIB-4091');

    // Create minimal valid PDF for test
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([400, 400]);
    pdfDoc.addPage([400, 400]);
    const pdfBytes = await pdfDoc.save();

    samplePdfPath = path.resolve(__dirname, 'test_sample.pdf');
    fs.writeFileSync(samplePdfPath, pdfBytes);
  });

  after(() => {
    teardownTestDb();
    if (fs.existsSync(samplePdfPath)) {
      fs.unlinkSync(samplePdfPath);
    }
  });

  test('Validates and parses PDF into document record', async () => {
    const file = {
      originalname: 'test_sample.pdf',
      path: samplePdfPath,
      size: fs.statSync(samplePdfPath).size,
      mimetype: 'application/pdf'
    };

    const doc = await processAndSaveDocument(file, session.id);
    assert.ok(doc.id.startsWith('doc_'));
    assert.equal(doc.totalPages, 2);
    assert.equal(doc.fileName, 'test_sample.pdf');
    assert.ok(doc.fingerprint.length > 0);
  });
});
