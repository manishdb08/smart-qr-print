const { processAndSaveDocument, getDocumentById } = require('../services/document.service');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const handleUploadDocument = asyncHandler(async (req, res) => {
  const sessionId = req.session?.id || req.body?.sessionId || null;
  const document = await processAndSaveDocument(req.file, sessionId);
  return successResponse(res, document, 'Document uploaded and validated successfully', 201);
});

const handleGetDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const document = await getDocumentById(id);
  return successResponse(res, document, 'Document details retrieved successfully');
});

module.exports = {
  handleUploadDocument,
  handleGetDocument
};
