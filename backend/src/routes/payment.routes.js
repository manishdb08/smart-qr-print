const express = require('express');
const router = express.Router();
const { handlePayJob } = require('../controllers/print.controller');
const validate = require('../middleware/validate');
const { payJobSchema } = require('../validators/print.validator');

router.post(
  '/:id/pay',
  validate(payJobSchema),
  handlePayJob
);

module.exports = router;
