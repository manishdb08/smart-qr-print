const express = require('express');
const router = express.Router();
const { handleCreateSession, handleGetSession, handleGetKioskQr } = require('../controllers/session.controller');
const validate = require('../middleware/validate');
const { createSessionSchema, getSessionSchema } = require('../validators/session.validator');

router.post('/', validate(createSessionSchema), handleCreateSession);
router.get('/:id', validate(getSessionSchema), handleGetSession);
router.get('/kiosk/:code/qr', handleGetKioskQr);

module.exports = router;
