const { getStatements } = require('../config/database');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

async function getAdminSummary() {
  const { listKiosks, listRecentJobs, getAllJobsStats } = getStatements();

  const kiosks = listKiosks.all();
  const recentJobsRaw = listRecentJobs.all(50);
  const stats = getAllJobsStats.get();

  let totalRevenue = 0;
  let paperSavedDuplex = 0;

  const formattedJobs = recentJobsRaw.map(j => {
    let pricing = {};
    let settings = {};
    try { pricing = JSON.parse(j.pricing_json || '{}'); } catch {}
    try { settings = JSON.parse(j.settings_json || '{}'); } catch {}

    if (j.payment_status === 'paid') {
      totalRevenue += pricing.netTotal || 0;
    }

    if (settings.duplex === 'duplex') {
      paperSavedDuplex += Math.floor((j.total_pages || 1) / 2);
    }

    return {
      id: j.id,
      sessionId: j.session_id,
      kioskId: j.kiosk_id,
      documentId: j.document_id,
      claimPin: j.claim_pin,
      status: j.status,
      settings,
      pricing,
      progress: j.progress,
      currentPage: j.current_page,
      totalPages: j.total_pages,
      paymentMethod: j.payment_method,
      paymentStatus: j.payment_status,
      paymentReference: j.payment_reference,
      createdAt: j.created_at,
      completedAt: j.completed_at
    };
  });

  return {
    kiosksCount: kiosks.length,
    onlineKiosksCount: kiosks.filter(k => k.status === 'online').length,
    totalJobsCount: stats.total_jobs || 0,
    completedJobsCount: stats.completed_jobs || 0,
    totalPagesPrinted: stats.total_pages_printed || 0,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    paperSavedDuplex,
    kiosks,
    recentJobs: formattedJobs
  };
}

async function refillKiosk(kioskId, paper = 500, tonerBw = 100, tonerColor = 100) {
  const { getKioskById, updateKioskSupplies } = getStatements();
  const kiosk = getKioskById.get(kioskId);

  if (!kiosk) {
    throw new NotFoundError(`Kiosk not found: ${kioskId}`);
  }

  const now = new Date().toISOString();
  updateKioskSupplies.run({
    id: kioskId,
    paper_count: paper,
    toner_bw: tonerBw,
    toner_color: tonerColor,
    status: 'online',
    updated_at: now
  });

  logger.info(`Refilled supplies for Kiosk #${kiosk.code} (${paper} sheets, ${tonerBw}% BW, ${tonerColor}% Color)`);

  return {
    success: true,
    kioskId,
    code: kiosk.code,
    paperCount: paper,
    tonerBw,
    tonerColor,
    status: 'online',
    refilledAt: now
  };
}

module.exports = {
  getAdminSummary,
  refillKiosk
};
