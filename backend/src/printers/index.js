const SimulationPrinter = require('./simulationPrinter');

const printerCache = new Map();

function getPrinter(kiosk) {
  if (!kiosk || !kiosk.id) {
    throw new Error('Valid kiosk object is required to initialize printer adapter');
  }

  if (printerCache.has(kiosk.id)) {
    return printerCache.get(kiosk.id);
  }

  // Currently defaults to SimulationPrinter as hardware integration is simulated
  const printer = new SimulationPrinter(kiosk);
  printerCache.set(kiosk.id, printer);
  return printer;
}

module.exports = {
  getPrinter
};
