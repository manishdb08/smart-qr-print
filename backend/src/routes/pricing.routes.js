const express = require('express');
const router = express.Router();
const { handleCalculatePricing } = require('../controllers/print.controller');
const validate = require('../middleware/validate');
const { calculatePricingSchema } = require('../validators/print.validator');

router.post(
  '/calculate',
  validate(calculatePricingSchema),
  handleCalculatePricing
);

module.exports = router;
