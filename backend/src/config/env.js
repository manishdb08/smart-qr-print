const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const env = {
  app: {
    port: parseInt(process.env.PORT || '4000', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },
  db: {
    path: process.env.DB_PATH || path.resolve(__dirname, '../../storage/data/app.db')
  },
  storage: {
    uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../storage/uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
    allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY || 'visionx-admin-secure-key-2026'
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-2.5-flash'
  },
  pricing: {
    bwPerPage: parseFloat(process.env.PRICE_BW || '2.0'),
    colorPerPage: parseFloat(process.env.PRICE_COLOR || '8.0'),
    duplexDiscount: parseFloat(process.env.DUPLEX_DISCOUNT || '0.15'),
    bulkDiscountThreshold: parseInt(process.env.BULK_THRESHOLD || '10', 10),
    bulkDiscountRate: parseFloat(process.env.BULK_DISCOUNT || '0.10'),
    currency: process.env.CURRENCY || '₹'
  },
  session: {
    ttlMinutes: parseInt(process.env.SESSION_TTL_MINUTES || '30', 10)
  }
};

module.exports = env;
