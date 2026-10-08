import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBrief, renderMarkdown } from '../src/brief.js';
import { InputError, loadInterviewInput } from '../src/parser.js';

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
  assert.deepEqual(brief.tailoredTalkingPoints, ['Use candidate evidence: Retail customer experience']);
  assert.ok(brief.risks.includes('No strong keyword overlap found between candidate notes and role/company evidence.'));
  assert.doesNotMatch(brief.tailoredTalkingPoints.join('\n'), /experience experience/);
});

test('specific shared skills produce an evidence-backed talking point', () => {
  const brief = createBrief('fixtures/sample-interview.md');
  assert.ok(brief.tailoredTalkingPoints.includes('Connect your local-first experience to the role evidence.'));
});

test('colon-style recognized headings preserve inline section evidence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-'));
  const input = join(directory, 'inline-headings.md');
  writeFileSync(input, [
    '## Role: Platform engineer', '- Own release automation',
    '## Company: Example Corp', '- Developer tooling',
    '## Candidate: Interview notes', '- Built release pipelines',
    '## Meeting: Tuesday', '- Meet the hiring panel',
  ].join('\n'));
  const brief = createBrief(input);
  assert.deepEqual(brief.roleSignals, ['Platform engineer', 'Own release automation']);
  assert.deepEqual(brief.companyThemes, ['Example Corp', 'Developer tooling']);
  assert.deepEqual(brief.tailoredTalkingPoints, ['Connect your release experience to the role evidence.']);
  assert.deepEqual(brief.followUps.slice(0, 1), ['Confirm meeting context: Tuesday']);
});

test('unknown headings stop evidence collection for recognized sections', () => {
  const brief = createBrief('fixtures/unknown-headings.md');
  assert.ok(brief.roleSignals.length > 0);
  assert.ok(!brief.roleSignals.includes('This is not role evidence'));
});

test('markdown preamble is not attributed to the role section', () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-'));
  const input = join(directory, 'preamble.md');
  writeFileSync(input, 'General notes\nPreamble text\n## Role\n- Platform engineering\n');
  assert.deepEqual(createBrief(input).roleSignals, ['Platform engineering']);
});

test('markdown fenced code does not create headings or evidence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-'));
  const input = join(directory, 'fenced.md');
  writeFileSync(input, '## Role\n- Platform engineering\n```md\n## Company\n- Fake Corp\n```\n## Company\n- Example Corp\n');
  assert.deepEqual(createBrief(input).companyThemes, ['Example Corp']);
});

test('wrapped markdown list items remain complete logical signals', () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-'));
  const input = join(directory, 'wrapped.md');
  writeFileSync(input, '## Role\n- Build dependable systems that support\n  distributed teams\n');
  assert.deepEqual(createBrief(input).roleSignals, ['Build dependable systems that support distributed teams']);
});

test('meeting follow-up normalizes list markers and wrapped text', () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-'));
  const input = join(directory, 'meeting.md');
  writeFileSync(input, '## Meeting\n- Tuesday with the\n  hiring panel\n');
  assert.ok(createBrief(input).followUps.includes('Confirm meeting context: Tuesday with the hiring panel'));
});

test('parser rejects malformed and non-object JSON', () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-'));
  const input = join(directory, 'invalid.json');
  writeFileSync(input, '[');
  assert.throws(() => loadInterviewInput(input), InputError);
  writeFileSync(input, '[]');
  assert.throws(() => loadInterviewInput(input), InputError);
});

test('CLI reports invalid input files without stack traces', () => {
  const result = spawnSync(process.execPath, ['bin/interview-brief.js', 'missing.json'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stderr, /at .*\(.*:\d+:\d+\)/);
});

test('CLI accepts the format option before or after the input', () => {
  for (const args of [['--format', 'markdown', 'fixtures/sample-interview.md'], ['fixtures/sample-interview.md', '--format', 'markdown']]) {
    const output = execFileSync(process.execPath, ['bin/interview-brief.js', ...args], { encoding: 'utf8' });
    assert.match(output, /## Questions To Ask/);
  }
});

test('CLI rejects unsupported formats with usage', () => {
  const result = spawnSync(process.execPath, ['bin/interview-brief.js', 'fixtures/sample-interview.md', '--format', 'xml'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Usage/);
});
