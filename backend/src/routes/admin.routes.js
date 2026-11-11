const express = require('express');
const router = express.Router();
const { handleGetAdminDashboard, handleRefillKiosk } = require('../controllers/admin.controller');
const { adminAuthMiddleware } = require('../middleware/auth.middleware');

router.use(adminAuthMiddleware);

router.get('/dashboard', handleGetAdminDashboard);
router.post('/kiosk/:id/refill', handleRefillKiosk);

module.exports = router;
