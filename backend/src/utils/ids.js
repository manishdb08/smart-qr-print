const { v4: uuidv4 } = require('uuid');

function generateSessionId() {
  return `ses_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
}

function generateJobId() {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

function generateDocumentId() {
  return `doc_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
}

function generatePinCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  generateSessionId,
  generateJobId,
  generateDocumentId,
  generatePinCode
};
