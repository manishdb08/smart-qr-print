const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
require('./setup-env');
const app = require('../src/app');
const { setupTestDb, teardownTestDb } = require('./helpers');

let server = null;
let baseUrl = '';

describe('API Route Integration Tests', () => {
  before(async () => {
    setupTestDb();
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(() => {
    teardownTestDb();
    if (server) server.close();
  });

  test('GET /: returns API root greeting and meta', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.project, 'SMART QR PRINT API');
  });

  test('GET /api/health: returns healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.data.status, 'healthy');
  });

  test('POST /api/sessions: initiates new session for valid kiosk', async () => {
    const res = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kioskCode: 'LIB-4091' })
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.status, 'success');
    assert.ok(json.data.id.startsWith('ses_'));
  });

  test('POST /api/assistant: responds to natural language prompt', async () => {
    const res = await fetch(`${baseUrl}/api/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '2 copies black and white pages 2 to 5' })
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.data.extractedSettings.copies, 2);
    assert.equal(json.data.extractedSettings.customRange, '2-5');
  });

  test('GET /api/admin/dashboard: rejects unauthorized access without key', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert.equal(res.status, 401);
  });

  test('GET /api/admin/dashboard: succeeds with valid constant-time admin key', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { 'X-Admin-Key': 'test-secret-admin-key' }
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.kiosksCount >= 4);
  });
});
