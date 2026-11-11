const express = require('express');
const router = express.Router();
const { handleInterpretAiPrompt } = require('../controllers/ai.controller');
const { assistantLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const { interpretPromptSchema } = require('../validators/ai.validator');

router.post(
  '/',
  assistantLimiter,
  validate(interpretPromptSchema),
  handleInterpretAiPrompt
);

module.exports = router;
