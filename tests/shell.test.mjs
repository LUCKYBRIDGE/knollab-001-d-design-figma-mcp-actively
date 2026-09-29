import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const script = readFileSync(resolve(root, 'shell.js'), 'utf8');

test('D exposes only preserved version 1', () => {
  assert.ok(existsSync(resolve(root, 'versions/v1/index.html')));
  assert.equal(existsSync(resolve(root, 'versions/v2/index.html')), false);
  assert.equal(existsSync(resolve(root, 'versions/v3/index.html')), false);
});

test('invalid version URL is replaced with version 1', () => {
  let replaced = '';
  runInNewContext(script, {
    window: {
      location: { href: 'https://example.test/?version=3&source=compare' },
      history: { replaceState(_state, _title, url) { replaced = url.toString(); } }
    },
    URL
  });
  assert.equal(replaced, 'https://example.test/?version=1&source=compare');
});
