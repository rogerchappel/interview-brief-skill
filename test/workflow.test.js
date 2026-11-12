import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('release-check job has a bounded timeout', async () => {
  const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const job = workflow.match(/^  release-check:\n((?:    .*\n|\n)*)/m)?.[1];
  assert.ok(job, 'release-check job exists');
  assert.match(job, /^    timeout-minutes: [1-9]\d*$/m, 'job declares a positive timeout-minutes value');
});
