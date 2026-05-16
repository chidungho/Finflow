'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const { createApp, getFrontendIndexPath } = require('../server');

test('getFrontendIndexPath points to the root index.html page', () => {
  const frontendPath = getFrontendIndexPath();

  assert.equal(frontendPath.endsWith('index.html'), true);
  assert.equal(fs.existsSync(frontendPath), true);
});

test('Express serves the frontend page from /', async (t) => {
  const app = createApp();
  const server = app.listen(0);

  t.after(() => {
    server.close();
  });

  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const res = await fetch(`http://127.0.0.1:${port}/`);
  const body = await res.text();

  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.match(body, /<!DOCTYPE html>/i);
  assert.match(body, /Vietnam Fuel API/);
});
