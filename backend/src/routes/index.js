const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const sessionRoutes = require('./session.routes');
const documentRoutes = require('./document.routes');
const uploadRoutes = require('./upload.routes');
const assistantRoutes = require('./assistant.routes');
const aiRoutes = require('./ai.routes');
const pricingRoutes = require('./pricing.routes');
const printRoutes = require('./print.routes');
const jobRoutes = require('./job.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');

router.use('/health', healthRoutes);
router.use('/sessions', sessionRoutes);
router.use('/documents', documentRoutes);
router.use('/upload', uploadRoutes);
router.use('/assistant', assistantRoutes);
router.use('/ai', aiRoutes);
router.use('/pricing', pricingRoutes);
router.use('/print', printRoutes);
router.use('/jobs', jobRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
