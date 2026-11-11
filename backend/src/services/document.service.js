const crypto = require('crypto');
const fs = require('fs');
const { getStatements } = require('../config/database');
const { generateDocumentId } = require('../utils/ids');
const { validateAndInspectPdf } = require('./pdf.service');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

async function processAndSaveDocument(file, sessionId) {
  if (!file || !file.path) {
    throw new ValidationError('No document file was provided');
  }

  // Inspect PDF / Document
  const pdfInfo = await validateAndInspectPdf(file.path);

  // Compute file SHA-256 fingerprint
  const fileBuffer = fs.readFileSync(file.path);
  const fingerprint = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  const { createDocument: insertDoc } = getStatements();

  const docId = generateDocumentId();
  const documentRecord = {
    id: docId,
    session_id: sessionId || null,
    file_name: file.originalname,
    file_path: file.path,
    file_size: file.size,
    mime_type: file.mimetype,
    total_pages: pdfInfo.totalPages,
    color_pages_json: JSON.stringify(pdfInfo.colorPages || []),
    bw_pages_json: JSON.stringify(pdfInfo.bwPages || []),
    fingerprint,
    created_at: new Date().toISOString()
  };

  insertDoc.run(documentRecord);
  logger.info(`Saved document ${docId} (${file.originalname}, ${pdfInfo.totalPages} pages)`);

  return {
    id: docId,
    sessionId,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    totalPages: pdfInfo.totalPages,
    colorPages: pdfInfo.colorPages,
    bwPages: pdfInfo.bwPages,
    fingerprint,
    createdAt: documentRecord.created_at
  };
}

async function getDocumentById(docId) {
  const { getDocument } = getStatements();
  const doc = getDocument.get(docId);

  if (!doc) {
    throw new NotFoundError(`Document not found: ${docId}`);
  }

  return {
    id: doc.id,
    sessionId: doc.session_id,
    fileName: doc.file_name,
    filePath: doc.file_path,
    fileSize: doc.file_size,
    mimeType: doc.mime_type,
    totalPages: doc.total_pages,
    colorPages: JSON.parse(doc.color_pages_json || '[]'),
    bwPages: JSON.parse(doc.bw_pages_json || '[]'),
    fingerprint: doc.fingerprint,
    createdAt: doc.created_at
  };
}

module.exports = {
  processAndSaveDocument,
  getDocumentById
};
