const { createSession, getSessionById } = require('../services/session.service');
const { createKioskQrPayload, generateQrDataUrl, generateQrSvg } = require('../services/qr.service');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const handleCreateSession = asyncHandler(async (req, res) => {
  const { kioskCode } = req.body;
  const session = await createSession(kioskCode);
  return successResponse(res, session, 'Session initiated successfully', 201);
});

const handleGetSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await getSessionById(id);
  return successResponse(res, session, 'Session retrieved successfully');
});

const handleGetKioskQr = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const format = req.query.format || 'dataurl'; // dataurl or svg
  const payload = createKioskQrPayload(code);

  if (format === 'svg') {
    const svg = await generateQrSvg(payload);
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svg);
  }

  const dataUrl = await generateQrDataUrl(payload);
  return successResponse(res, { payload, dataUrl, kioskCode: code });
});

module.exports = {
  handleCreateSession,
  handleGetSession,
  handleGetKioskQr
};
