const { getAdminSummary, refillKiosk } = require('../services/admin.service');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const handleGetAdminDashboard = asyncHandler(async (req, res) => {
  const summary = await getAdminSummary();
  return successResponse(res, summary, 'Admin summary metrics retrieved');
});

const handleRefillKiosk = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paper, tonerBw, tonerColor } = req.body;
  const result = await refillKiosk(id, paper, tonerBw, tonerColor);
  return successResponse(res, result, 'Kiosk supplies replenished');
});

module.exports = {
  handleGetAdminDashboard,
  handleRefillKiosk
};
