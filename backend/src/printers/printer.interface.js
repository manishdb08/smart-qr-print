/**
 * PrinterAdapter Interface contract for future hardware drivers (e.g. CUPS, IPP, ESC/POS, Zebra)
 */
class PrinterAdapter {
  async connect() {
    throw new Error('connect() must be implemented by adapter');
  }

  async print(jobPayload, onProgress) {
    throw new Error('print() must be implemented by adapter');
  }

  async getStatus() {
    throw new Error('getStatus() must be implemented by adapter');
  }

  async cancel(jobId) {
    throw new Error('cancel() must be implemented by adapter');
  }
}

module.exports = PrinterAdapter;
