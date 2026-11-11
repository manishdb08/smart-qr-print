const { getStatements } = require('../config/database');
const { getJobById } = require('./job.service');
const { getPrinter } = require('../printers');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

async function executePrintJob(jobId) {
  const job = await getJobById(jobId);

  if (job.status === 'completed') {
    return {
      success: true,
      jobId,
      status: 'completed',
      message: 'Job is already printed'
    };
  }

  const { getKioskById, updateJobStatus, updateKioskSupplies } = getStatements();
  const kiosk = getKioskById.get(job.kioskId);

  if (!kiosk) {
    throw new ValidationError(`Associated kiosk not found: ${job.kioskId}`);
  }

  if (kiosk.paper_count < job.totalPages) {
    updateJobStatus.run({
      id: jobId,
      status: 'failed',
      progress: 0,
      current_page: 0,
      updated_at: new Date().toISOString(),
      completed_at: null,
      error_message: 'Kiosk out of paper sheets'
    });
    throw new ValidationError(`Kiosk #${kiosk.code} has insufficient paper (${kiosk.paper_count} sheets available, ${job.totalPages} required)`);
  }

  const printer = getPrinter(kiosk);

  // Mark as spooling
  updateJobStatus.run({
    id: jobId,
    status: 'spooling',
    progress: 10,
    current_page: 0,
    updated_at: new Date().toISOString(),
    completed_at: null,
    error_message: null
  });

  try {
    // Execute simulated or physical print
    await printer.print(
      {
        id: job.id,
        totalPages: job.totalPages,
        claimPin: job.claimPin,
        settings: job.settings
      },
      (progressEvent) => {
        updateJobStatus.run({
          id: jobId,
          status: progressEvent.status,
          progress: progressEvent.progress,
          current_page: progressEvent.currentPage,
          updated_at: new Date().toISOString(),
          completed_at: progressEvent.status === 'completed' ? new Date().toISOString() : null,
          error_message: null
        });
      }
    );

    // Deduct supplies from kiosk
    const newPaper = Math.max(0, kiosk.paper_count - job.totalPages);
    const newTonerBw = Math.max(0, kiosk.toner_bw - job.totalPages * 0.15);
    const newTonerColor = job.settings.colorMode !== 'bw' ? Math.max(0, kiosk.toner_color - job.totalPages * 0.3) : kiosk.toner_color;

    updateKioskSupplies.run({
      id: kiosk.id,
      paper_count: newPaper,
      toner_bw: Math.round(newTonerBw * 10) / 10,
      toner_color: Math.round(newTonerColor * 10) / 10,
      status: newPaper < 20 ? 'paper_low' : kiosk.status,
      updated_at: new Date().toISOString()
    });

    logger.info(`Print Job ${jobId} successfully finished execution on Kiosk #${kiosk.code}`);

    return {
      success: true,
      jobId,
      status: 'completed',
      claimPin: job.claimPin,
      pagesPrinted: job.totalPages,
      kioskCode: kiosk.code
    };
  } catch (err) {
    logger.error(`Print job execution failed for ${jobId}`, err);
    updateJobStatus.run({
      id: jobId,
      status: 'failed',
      progress: 0,
      current_page: 0,
      updated_at: new Date().toISOString(),
      completed_at: null,
      error_message: err.message
    });
    throw err;
  }
}

module.exports = {
  executePrintJob
};
