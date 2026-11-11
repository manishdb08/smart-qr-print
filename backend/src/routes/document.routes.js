const express = require('express');
const router = express.Router();
const { handleGetDocument } = require('../controllers/upload.controller');

router.get('/:id', handleGetDocument);

module.exports = router;
