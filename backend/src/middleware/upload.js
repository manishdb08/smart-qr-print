// Legacy multer bridge used by document.routes
const { uploadSingle, cleanupOnError } = require('./upload.middleware');

module.exports = {
  uploadSingle,
  cleanupOnError
};
