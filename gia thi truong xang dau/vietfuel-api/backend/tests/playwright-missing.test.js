'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createMissingBrowserError,
  isMissingPlaywrightBrowserError,
} = require('../services/scrapers/utils');
const { runJob } = require('../workers/jobs');

test('createMissingBrowserError returns a concise actionable error', () => {
  const err = createMissingBrowserError();

  assert.equal(err.code, 'PLAYWRIGHT_BROWSER_MISSING');
  assert.match(err.message, /npx playwright install chromium/);
  assert.doesNotMatch(err.message, /Looks like Playwright was just installed/i);
  assert.doesNotMatch(err.message, /╔/);
});

test('isMissingPlaywrightBrowserError recognizes Playwright launch output', () => {
  const err = new Error(
    'browserType.launch: Executable doesn\'t exist at C:\\Users\\Admin\\AppData\\Local\\ms-playwright\\chromium\\chrome.exe\n' +
    'Looks like Playwright was just installed or updated.'
  );

  assert.equal(isMissingPlaywrightBrowserError(err), true);
});

test('runJob logs missing Playwright browser as one short warning and keeps cache', async () => {
  const messages = { info: [], warn: [], error: [] };
  const logger = {
    info: (message) => messages.info.push(message),
    warn: (message) => messages.warn.push(message),
    error: (message) => messages.error.push(message),
  };

  await runJob('petrolimex', async () => {
    throw createMissingBrowserError();
  }, logger);

  assert.equal(messages.error.length, 0);
  assert.equal(messages.warn.length, 1);
  assert.match(messages.warn[0], /petrolimex/);
  assert.match(messages.warn[0], /cache cũ/);
  assert.match(messages.warn[0], /npx playwright install chromium/);
  assert.doesNotMatch(messages.warn[0], /╔/);
});
