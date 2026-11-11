const express = require('express');
const router = express.Router();
const { successResponse } = require('../utils/apiResponse');

router.get('/', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'SMART QR PRINT Backend',
    team: 'VisionX Debug (Gufran, Kunal, Nirmiti, Mahek)'
  });
});

module.exports = router;
