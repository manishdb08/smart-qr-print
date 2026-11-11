const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

// Ensure upload directory exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (config.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`Unsupported file type: ${file.mimetype}. Allowed: PDF, PNG, JPEG`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter
});

// Auto-cleanup hook if request fails or throws later in the pipeline
function cleanupOnError(err, req, res, next) {
  if (req.file && req.file.path && fs.existsSync(req.file.path)) {
    try {
      fs.unlinkSync(req.file.path);
      logger.info(`Cleaned up temp upload file: ${req.file.path}`);
    } catch (cleanupErr) {
      logger.error('Failed to clean up upload file', cleanupErr);
    }
  }
  next(err);
}

module.exports = {
  uploadSingle: upload.single('document'),
  cleanupOnError
};
