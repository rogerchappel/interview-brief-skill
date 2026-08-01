import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
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

test('unknown headings stop evidence collection for recognized sections', () => {
  const brief = createBrief('fixtures/unknown-headings.md');

  assert.deepEqual(brief.roleSignals, ['Platform engineer']);
  assert.deepEqual(brief.companyThemes, ['Developer tools']);
  assert.doesNotMatch(JSON.stringify(brief), /Free lunch|Office trivia/);
});

test('CLI accepts the format option before or after the input', () => {
  for (const args of [
    ['--format', 'json', 'fixtures/sample-interview.md'],
    ['fixtures/sample-interview.md', '--format', 'json'],
  ]) {
    const output = execFileSync(process.execPath, ['bin/interview-brief.js', ...args], {
      encoding: 'utf8',
    });
    assert.doesNotThrow(() => JSON.parse(output));
  }

  const markdown = execFileSync(process.execPath, [
    'bin/interview-brief.js', '--format', 'markdown', 'fixtures/sample-interview.md',
  ], { encoding: 'utf8' });
  assert.match(markdown, /# Interview Brief/);
});

test('CLI rejects incomplete or unexpected arguments', () => {
  for (const args of [
    ['fixtures/sample-interview.md', '--format'],
    ['--format', '--unknown', 'fixtures/sample-interview.md'],
    ['fixtures/sample-interview.md', '--unknown'],
    ['fixtures/sample-interview.md', 'fixtures/sample-interview.json'],
  ]) {
    const result = spawnSync(process.execPath, ['bin/interview-brief.js', ...args], {
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /Usage: interview-brief/);
  }
});
