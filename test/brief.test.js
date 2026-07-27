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

test('generic shared language is not treated as grounded role overlap', () => {
  const brief = createBrief('fixtures/generic-overlap.json');

  assert.deepEqual(brief.tailoredTalkingPoints, [
    'Use candidate evidence: Retail customer experience',
  ]);
  assert.ok(brief.risks.includes(
    'No strong keyword overlap found between candidate notes and role/company evidence.',
  ));
  assert.doesNotMatch(brief.tailoredTalkingPoints.join('\n'), /experience experience/);
});

test('specific shared skills produce an evidence-backed talking point', () => {
  const brief = createBrief('fixtures/sample-interview.md');

  assert.ok(brief.tailoredTalkingPoints.includes(
    'Connect your local-first experience to the role evidence.',
  ));
  assert.ok(!brief.risks.includes(
    'No strong keyword overlap found between candidate notes and role/company evidence.',
  ));
});
