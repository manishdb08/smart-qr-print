const env = require('./env');

const config = {
  PORT: env.app.port,
  HOST: env.app.host,
  NODE_ENV: env.app.nodeEnv,
  CORS_ORIGIN: env.app.corsOrigin,

  DB_PATH: env.db.path,

  UPLOAD_DIR: env.storage.uploadDir,
  MAX_FILE_SIZE: env.storage.maxFileSize,
  ALLOWED_MIME_TYPES: env.storage.allowedMimeTypes,

  ADMIN_API_KEY: env.admin.apiKey,

  GEMINI_API_KEY: env.ai.geminiApiKey,
  OPENAI_API_KEY: env.ai.openaiApiKey,
  AI_MODEL: env.ai.model,

  PRICE_BW: env.pricing.bwPerPage,
  PRICE_COLOR: env.pricing.colorPerPage,
  DUPLEX_DISCOUNT: env.pricing.duplexDiscount,
  BULK_THRESHOLD: env.pricing.bulkDiscountThreshold,
  BULK_DISCOUNT: env.pricing.bulkDiscountRate,
  CURRENCY: env.pricing.currency,

  SESSION_TTL_MINUTES: env.session.ttlMinutes,

  // Keep reference to nested object if needed
  raw: env
};

module.exports = config;
