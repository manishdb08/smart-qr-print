const PrinterAdapter = require('./printer.interface');
const logger = require('../utils/logger');

class SimulationPrinter extends PrinterAdapter {
  constructor(kiosk) {
    super();
    this.kiosk = kiosk;
    this.isReady = true;
  }

  async connect() {
    logger.info(`[SimulationPrinter] Connected to virtual spooler for Kiosk ${this.kiosk.code}`);
    return true;
  }

  async print(jobPayload, onProgress) {
    logger.info(`[SimulationPrinter] Starting simulated print for Job ${jobPayload.id} (${jobPayload.totalPages} pages)`);
    const totalPages = jobPayload.totalPages;

    for (let page = 1; page <= totalPages; page++) {
      // Simulate physical page spooling delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const progress = Math.min(100, Math.round((page / totalPages) * 100));

      if (typeof onProgress === 'function') {
        onProgress({
          currentPage: page,
          totalPages,
          progress,
          status: page === totalPages ? 'completed' : 'printing'
        });
      }
    }

    logger.info(`[SimulationPrinter] Job ${jobPayload.id} finished physical print simulation.`);
    return {
      success: true,
      jobId: jobPayload.id,
      pagesPrinted: totalPages,
      claimPin: jobPayload.claimPin,
      timestamp: new Date().toISOString()
    };
  }

  async getStatus() {
    return {
      online: true,
      paperLevel: this.kiosk.paper_count,
      tonerBlack: this.kiosk.toner_bw,
      tonerColor: this.kiosk.toner_color,
      state: 'idle'
    };
  }

  async cancel(jobId) {
    logger.info(`[SimulationPrinter] Job ${jobId} canceled on virtual spooler.`);
    return true;
  }
}

module.exports = SimulationPrinter;
