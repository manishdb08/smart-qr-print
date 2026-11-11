const { calculateJobPricing } = require('../services/pricing.service');
const { createPrintJob, getJobById, getJobByPin } = require('../services/job.service');
const { processDemoPayment } = require('../services/payment.service');
const { executePrintJob } = require('../services/print.service');
const { getDocumentById } = require('../services/document.service');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const handleCalculatePricing = asyncHandler(async (req, res) => {
  const { documentId, settings } = req.body;
  const doc = await getDocumentById(documentId);
  const pricing = calculateJobPricing(doc, settings);
  return successResponse(res, pricing, 'Authoritative price calculated');
});

const handleCreateJob = asyncHandler(async (req, res) => {
  const { documentId, settings } = req.body;
  const session = req.session;
  const job = await createPrintJob(session, documentId, settings);
  return successResponse(res, job, 'Print job initiated', 201);
});

const handleGetJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await getJobById(id);
  return successResponse(res, job, 'Job details retrieved');
});

const handleLookupJobByPin = asyncHandler(async (req, res) => {
  const { pin } = req.params;
  const job = await getJobByPin(pin);
  return successResponse(res, job, 'Job matched by Claim PIN');
});

const handlePayJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod, amount } = req.body;
  const result = await processDemoPayment(id, paymentMethod, amount);
  return successResponse(res, result, 'Payment verified and authorized');
});

const handleExecuteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await executePrintJob(id);
  return successResponse(res, result, 'Job sent to printer spooler');
});

module.exports = {
  handleCalculatePricing,
  handleCreateJob,
  handleGetJob,
  handleLookupJobByPin,
  handlePayJob,
  handleExecuteJob
};
