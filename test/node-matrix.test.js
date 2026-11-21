import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('CI Node.js matrix covers the package engine minimum without a pinned current major', async () => {
  const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  const workflow = await readFile(new URL('.github/workflows/ci.yml', root), 'utf8');
  const minimum = pkg.engines?.node?.match(/^>=(\d+)$/)?.[1];
  assert.ok(minimum, 'package engines.node is a simple >=<major> range');

  const block = workflow.match(/^\s+node-version:[ \t]*\n((?:[ \t]+-[ \t]+\d+[ \t]*\n?)+)/m)?.[1];
  assert.ok(block, 'CI declares a numeric node-version matrix');
  const versions = [...block.matchAll(/^[ \t]+-[ \t]+(\d+)[ \t]*$/gm)].map(([, n]) => Number(n));
  assert.ok(versions.length, 'CI Node.js matrix is not empty');
  assert.ok(versions.includes(Number(minimum)), `matrix includes package minimum ${minimum}`);
  assert.equal(Math.min(...versions), Number(minimum), 'matrix minimum matches package minimum');
  assert.deepEqual(versions, [...new Set(versions)], 'matrix contains no duplicates');
});
