import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrief, renderMarkdown } from '../src/brief.js';

test('creates grounded interview brief from markdown', () => {
  const brief = createBrief('fixtures/sample-interview.md');
  assert.ok(brief.roleSignals.length >= 3);
  assert.ok(brief.companyThemes.length >= 3);
  assert.equal(brief.assumptions.length, 0);
});

test('renders markdown questions and risks', () => {
  const markdown = renderMarkdown(createBrief('fixtures/sample-interview.json'));
  assert.match(markdown, /## Questions To Ask/);
  assert.match(markdown, /thank-you note/);
});
