const test = require('node:test');
const assert = require('node:assert/strict');
const { readConfig } = require('../config/runtime');
const env = { MYSQLHOST: 'localhost', MYSQLDATABASE: 'demo', MYSQLUSER: 'demo' };
test('safe defaults and provider network configuration', () => {
  const c = readConfig({ ...env, IP: 'fd00::1', HOST: 'localhost', PORT: '8100' });
  assert.equal(c.demoMode, true); assert.equal(c.admin.enabled, false);
  assert.equal(c.host, 'fd00::1'); assert.equal(c.port, 8100);
});
test('invalid configuration fails without printing secrets', () => {
  assert.throws(() => readConfig({ MYSQLPASSWORD: 'hidden' }), err => !err.message.includes('hidden') && err.message.includes('MYSQLDATABASE'));
  for (const port of ['0','65536','x','2.5']) assert.throws(() => readConfig({ ...env, PORT: port }), /puerto/);
  assert.throws(() => readConfig({ ...env, DEMO_MODE: 'FALSE' }), /true o false/);
  assert.throws(() => readConfig({ ...env, ADMIN_ENABLED: 'true' }), /ADMIN_USERNAME/);
  assert.throws(() => readConfig({ ...env, NODE_ENV: 'production', DEMO_MODE: 'false' }), /ADMIN_ENABLED/);
});
