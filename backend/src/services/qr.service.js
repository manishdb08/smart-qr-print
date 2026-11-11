const QRCode = require('qrcode');

function createKioskQrPayload(kioskCode, baseUrl = 'https://smartqrprint.visionx.internal') {
  return `${baseUrl}/kiosk/${encodeURIComponent(kioskCode)}`;
}

async function generateQrDataUrl(payload, options = {}) {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: options.width || 300,
    color: {
      dark: options.dark || '#8B5CF6',
      light: options.light || '#070B18'
    }
  });
}

async function generateQrSvg(payload, options = {}) {
  return QRCode.toString(payload, {
    type: 'svg',
    margin: 1,
    width: options.width || 300,
    color: {
      dark: options.dark || '#8B5CF6',
      light: options.light || '#070B18'
    }
  });
}

async function generateQrPngBuffer(payload, options = {}) {
  return QRCode.toBuffer(payload, {
    margin: 1,
    width: options.width || 300,
    color: {
      dark: options.dark || '#000000',
      light: options.light || '#FFFFFF'
    }
  });
}

module.exports = {
  createKioskQrPayload,
  generateQrDataUrl,
  generateQrSvg,
  generateQrPngBuffer
};
