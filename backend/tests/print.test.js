const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
require('./setup-env');
const { setupTestDb, teardownTestDb } = require('./helpers');
const { createSession } = require('../src/services/session.service');
const { processAndSaveDocument } = require('../src/services/document.service');
const { createPrintJob, getJobById } = require('../src/services/job.service');
const { processDemoPayment } = require('../src/services/payment.service');
const { executePrintJob } = require('../src/services/print.service');

describe('Print Job Lifecycle Tests', () => {
  let session = null;
  let document = null;
  let samplePdfPath = '';

  before(async () => {
    setupTestDb();
    session = await createSession('LIB-4091');

    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([400, 400]);
    pdfDoc.addPage([400, 400]);
    const pdfBytes = await pdfDoc.save();

    samplePdfPath = path.resolve(__dirname, 'test_lifecycle.pdf');
    fs.writeFileSync(samplePdfPath, pdfBytes);

    document = await processAndSaveDocument({
      originalname: 'test_lifecycle.pdf',
      path: samplePdfPath,
      size: fs.statSync(samplePdfPath).size,
      mimetype: 'application/pdf'
    }, session.id);
  });

  after(() => {
    teardownTestDb();
    if (fs.existsSync(samplePdfPath)) {
      fs.unlinkSync(samplePdfPath);
    }
  });

  test('Creates print job with 6-digit claim PIN', async () => {
    const job = await createPrintJob(session, document.id, {
      pageSelection: 'all',
      copies: 1,
      colorMode: 'bw',
      duplex: 'duplex',
      paperSize: 'A4',
      orientation: 'portrait',
      quality: 'normal',
      staple: false
    });

    assert.ok(job.id.startsWith('job_'));
    assert.equal(job.claimPin.length, 6);
    assert.equal(job.status, 'pending_payment');
  });

  test('Verifies demo payment and transitions status', async () => {
    const job = await createPrintJob(session, document.id, {
      pageSelection: 'all',
      copies: 1,
      colorMode: 'bw',
      duplex: 'duplex',
      paperSize: 'A4',
      orientation: 'portrait',
      quality: 'normal',
      staple: false
    });

    const paymentResult = await processDemoPayment(job.id, 'upi', job.pricing.netTotal);
    assert.equal(paymentResult.status, 'paid');

    const updatedJob = await getJobById(job.id);
    assert.equal(updatedJob.paymentStatus, 'paid');
  });

  test('Executes job on virtual spooler to completed state', async () => {
    const job = await createPrintJob(session, document.id, {
      pageSelection: 'all',
      copies: 1,
      colorMode: 'bw',
      duplex: 'duplex',
      paperSize: 'A4',
      orientation: 'portrait',
      quality: 'normal',
      staple: false
    });

    await processDemoPayment(job.id, 'upi', job.pricing.netTotal);
    const execution = await executePrintJob(job.id);

    assert.equal(execution.status, 'completed');
    assert.equal(execution.pagesPrinted, 2);

    const finishedJob = await getJobById(job.id);
    assert.equal(finishedJob.status, 'completed');
    assert.equal(finishedJob.progress, 100);
  });
});
