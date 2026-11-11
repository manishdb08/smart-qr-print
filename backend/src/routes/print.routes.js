const express = require('express');
const router = express.Router();
const { handleCreateJob, handleExecuteJob } = require('../controllers/print.controller');
const sessionMiddleware = require('../middleware/session');
const validate = require('../middleware/validate');
const { createJobSchema, executeJobSchema } = require('../validators/print.validator');

router.post(
  '/',
  sessionMiddleware({ required: true }),
  validate(createJobSchema),
  handleCreateJob
);

router.post(
  '/:id/execute',
  validate(executeJobSchema),
  handleExecuteJob
);

module.exports = router;
