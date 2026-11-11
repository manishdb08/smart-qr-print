const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
require('./setup-env');
const { setupTestDb, teardownTestDb } = require('./helpers');
const { getAdminSummary, refillKiosk } = require('../src/services/admin.service');

describe('Admin Fleet Service Tests', () => {
  before(() => {
    setupTestDb();
  });

  after(() => {
    teardownTestDb();
  });

  test('getAdminSummary: returns fleet health and metrics', async () => {
    const summary = await getAdminSummary();
    assert.ok(summary.kiosksCount >= 4);
    assert.ok(Array.isArray(summary.kiosks));
    assert.ok(Array.isArray(summary.recentJobs));
  });

  test('refillKiosk: replenishes paper and toner levels to 100%', async () => {
    const result = await refillKiosk('kiosk-01', 500, 100, 100);
    assert.equal(result.success, true);
    assert.equal(result.paperCount, 500);
    assert.equal(result.tonerBw, 100);
  });
});
