const crypto = require('crypto');
const { getStatements } = require('../config/database');
const { generateJobId, generatePinCode } = require('../utils/ids');
const { calculateJobPricing } = require('./pricing.service');
const { getDocumentById } = require('./document.service');
const { NotFoundError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

async function createPrintJob(session, documentId, settings) {
  const { createJob: insertJob, getJobByFingerprint, getKioskById } = getStatements();

  const doc = await getDocumentById(documentId);
  const kiosk = getKioskById.get(session.kiosk_id);

  if (!kiosk) {
    throw new NotFoundError(`Kiosk not found: ${session.kiosk_id}`);
  }

  // Calculate pricing authoritatively on server
  const pricing = calculateJobPricing(doc, settings);

  // Generate fingerprint to avoid accidental duplicate job creation
  const fpPayload = `${session.id}:${documentId}:${JSON.stringify(settings)}`;
  const fingerprint = crypto.createHash('md5').update(fpPayload).digest('hex');

  const existing = getJobByFingerprint.get(fingerprint);
  if (existing) {
    logger.info(`Reusing active job with matching fingerprint: ${existing.id}`);
    return formatJobRecord(existing, doc, kiosk);
  }

  const jobId = generateJobId();
  const claimPin = generatePinCode();
  const now = new Date().toISOString();

  const record = {
    id: jobId,
    session_id: session.id,
    kiosk_id: session.kiosk_id,
    document_id: documentId,
    claim_pin: claimPin,
    status: 'pending_payment',
    settings_json: JSON.stringify(settings),
    pricing_json: JSON.stringify(pricing),
    progress: 0,
    current_page: 0,
    total_pages: pricing.totalPagesToPrint,
    payment_method: null,
    payment_status: 'unpaid',
    payment_reference: null,
    fingerprint,
    created_at: now,
    updated_at: now
  };

  insertJob.run(record);
  logger.info(`Created Print Job ${jobId} (PIN: ${claimPin}, Total: ${pricing.currency}${pricing.netTotal})`);

  return formatJobRecord(record, doc, kiosk);
}

async function getJobById(jobId) {
  const { getJobById: queryJob, getKioskById } = getStatements();
  const record = queryJob.get(jobId);

  if (!record) {
    throw new NotFoundError(`Job not found: ${jobId}`);
  }

  const doc = await getDocumentById(record.document_id);
  const kiosk = getKioskById.get(record.kiosk_id);

  return formatJobRecord(record, doc, kiosk);
}

async function getJobByPin(pin) {
  const { getJobByPin: queryJob, getKioskById } = getStatements();
  const record = queryJob.get(pin);

  if (!record) {
    throw new NotFoundError(`No job found for Claim PIN: ${pin}`);
  }

  const doc = await getDocumentById(record.document_id);
  const kiosk = getKioskById.get(record.kiosk_id);

  return formatJobRecord(record, doc, kiosk);
}

function formatJobRecord(record, doc, kiosk) {
  return {
    id: record.id,
    sessionId: record.session_id,
    kioskId: record.kiosk_id,
    kioskName: kiosk?.name || 'VisionX Kiosk',
    documentId: record.document_id,
    documentName: doc?.fileName || 'Document.pdf',
    claimPin: record.claim_pin,
    status: record.status,
    settings: JSON.parse(record.settings_json || '{}'),
    pricing: JSON.parse(record.pricing_json || '{}'),
    progress: record.progress,
    currentPage: record.current_page,
    totalPages: record.total_pages,
    paymentMethod: record.payment_method,
    paymentStatus: record.payment_status,
    paymentReference: record.payment_reference,
    createdAt: record.created_at,
    updated_at: record.updated_at,
    completedAt: record.completed_at
  };
}

module.exports = {
  createPrintJob,
  getJobById,
  getJobByPin
};
