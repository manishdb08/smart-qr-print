const { z } = require('zod');
const { printSettingsSchema } = require('./schemas');

const calculatePricingSchema = z.object({
  body: z.object({
    documentId: z.string().min(1, 'documentId is required'),
    settings: printSettingsSchema
  })
});

const createJobSchema = z.object({
  body: z.object({
    documentId: z.string().min(1, 'documentId is required'),
    settings: printSettingsSchema
  })
});

const payJobSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Job ID is required')
  }),
  body: z.object({
    paymentMethod: z.enum(['upi', 'wallet', 'card', 'demo']).default('demo'),
    amount: z.number().positive('Payment amount must be greater than 0')
  })
});

const executeJobSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Job ID is required')
  })
});

module.exports = {
  calculatePricingSchema,
  createJobSchema,
  payJobSchema,
  executeJobSchema
};
