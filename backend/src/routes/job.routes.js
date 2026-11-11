const express = require('express');
const router = express.Router();
const { handleGetJob, handleLookupJobByPin } = require('../controllers/print.controller');

router.get('/:id', handleGetJob);
router.get('/pin/:pin', handleLookupJobByPin);

module.exports = router;
