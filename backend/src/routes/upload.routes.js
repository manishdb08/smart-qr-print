const express = require('express');
const router = express.Router();
const { handleUploadDocument } = require('../controllers/upload.controller');
const { uploadSingle, cleanupOnError } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/rateLimit');
const sessionMiddleware = require('../middleware/session');

router.post(
  '/',
  uploadLimiter,
  sessionMiddleware({ required: false }),
  uploadSingle,
  cleanupOnError,
  handleUploadDocument
);

module.exports = router;
