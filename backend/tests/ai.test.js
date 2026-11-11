const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
require('./setup-env');
const { processAssistantRequest } = require('../src/services/assistant.service');

describe('AI & Assistant Service Tests', () => {
  test('Translates natural language to structured settings', async () => {
    const result = await processAssistantRequest('Print pages 2 to 5, two copies in black and white');
    assert.ok(result.extractedSettings);
    assert.equal(result.extractedSettings.copies, 2);
    assert.equal(result.extractedSettings.customRange, '2-5');
    assert.equal(result.extractedSettings.colorMode, 'bw');
    assert.ok(result.naturalReply.length > 0);
  });

  test('Generates smart recommendations for document color optimization', async () => {
    const docMeta = { totalPages: 6, colorPages: [3] };
    const result = await processAssistantRequest('Print in full color double-sided', docMeta);
    assert.equal(result.extractedSettings.colorMode, 'color');
    assert.equal(result.extractedSettings.duplex, 'duplex');
    assert.ok(result.recommendations.some(r => r.includes('Smart Mixed') || r.includes('Optimization')));
  });
});
