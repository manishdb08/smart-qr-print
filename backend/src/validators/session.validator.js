const { z } = require('zod');

const createSessionSchema = z.object({
  body: z.object({
    kioskCode: z.string().min(1, 'kioskCode is required')
  })
});

const getSessionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'session ID is required')
  })
});

module.exports = {
  createSessionSchema,
  getSessionSchema
};
