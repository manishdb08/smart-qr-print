const { getStatements } = require('../config/database');
const { getJobById } = require('./job.service');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

async function processDemoPayment(jobId, paymentMethod = 'demo', amount = 0) {
  const job = await getJobById(jobId);

  if (job.paymentStatus === 'paid') {
    return {
      success: true,
      jobId,
      status: 'already_paid',
      paymentReference: job.paymentReference,
      message: 'Job was already authorized and paid'
    };
  }

  const expectedAmount = job.pricing.netTotal;
  if (Math.abs(amount - expectedAmount) > 0.1 && amount > 0) {
    logger.warn(`Payment amount mismatch for Job ${jobId}: expected ${expectedAmount}, received ${amount}`);
  }

  const paymentReference = `PAY_DEMO_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const { updateJobPayment } = getStatements();
  const now = new Date().toISOString();

  updateJobPayment.run({
    id: jobId,
    payment_status: 'paid',
    payment_method: paymentMethod,
    payment_reference: paymentReference,
    updated_at: now
  });

  logger.info(`Verified demo payment for Job ${jobId} via ${paymentMethod} (Ref: ${paymentReference})`);

  return {
    success: true,
    jobId,
    status: 'paid',
    amount: expectedAmount,
    currency: job.pricing.currency,
    paymentMethod,
    paymentReference,
    timestamp: now
  };
}

module.exports = {
  processDemoPayment
};
