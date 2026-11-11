const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
require('./setup-env');
const { setupTestDb, teardownTestDb } = require('./helpers');
const { createSession, getSessionById } = require('../src/services/session.service');

describe('Session Service Tests', () => {
  before(() => {
    setupTestDb();
  });

  after(() => {
    teardownTestDb();
  });

  test('createSession: creates active session with valid kiosk code', async () => {
    const session = await createSession('LIB-4091');
    assert.ok(session.id.startsWith('ses_'));
    assert.equal(session.kiosk_code, 'LIB-4091');
    assert.equal(session.status, 'active');
  });

  test('getSessionById: retrieves session metadata and kiosk details', async () => {
    const created = await createSession('ENG-2044');
    const fetched = await getSessionById(created.id);
    assert.equal(fetched.id, created.id);
    assert.equal(fetched.kiosk.code, 'ENG-2044');
  });

  test('createSession: throws error on invalid kiosk code', async () => {
    await assert.rejects(async () => {
      await createSession('INVALID-CODE-999');
    }, /No kiosk found/);
  });
});
