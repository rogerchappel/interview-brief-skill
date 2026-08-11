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

test('wrapped markdown list items remain complete logical signals', () => {
  const brief = createBrief('fixtures/wrapped-interview.md');

  assert.deepEqual(brief.roleSignals, [
    'Build reliable release automation for users',
    'Lead incident reviews',
  ]);
  assert.deepEqual(brief.companyThemes, [
    'Developer tooling for distributed teams',
  ]);
  assert.deepEqual(brief.tailoredTalkingPoints, [
    'Use candidate evidence: Shipped local-first collaboration features',
  ]);
  assert.equal(
    brief.interviewQuestions[0],
    'What would success look like for Build reliable release automation for users?',
  );
});

test('meeting follow-up normalizes list markers and wrapped text', () => {
  const brief = createBrief('fixtures/wrapped-interview.md');

  assert.ok(brief.followUps.includes(
    'Confirm meeting context: Friday at 10am with the hiring manager',
  ));
  assert.doesNotMatch(brief.followUps.join('\n'), /:\s*[-*]\s/);
});

test('dotted identifiers stay intact while sentence boundaries split signals', () => {
  const brief = createBrief('fixtures/dotted-identifiers.json');

  assert.deepEqual(brief.roleSignals, [
    'Build Node.js services',
    'Improve release automation',
  ]);
  assert.deepEqual(brief.companyThemes, [
    'Uses Node.js across its developer platform',
    'Ships weekly',
  ]);
  assert.deepEqual(brief.tailoredTalkingPoints, [
    'Connect your node experience to the role evidence.',
  ]);
  assert.equal(
    brief.interviewQuestions[0],
    'What would success look like for Build Node.js services?',
  );
});

test('dotted identifiers stay intact in candidate evidence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-dotted-'));
  const input = join(directory, 'candidate.json');
  writeFileSync(input, JSON.stringify({
    role: 'Platform engineer.',
    company: 'Developer tools.',
    candidate: 'Built Node.js APIs. Led reliable releases.',
  }));

  assert.deepEqual(createBrief(input).tailoredTalkingPoints, [
    'Use candidate evidence: Built Node.js APIs',
    'Use candidate evidence: Led reliable releases',
  ]);
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

test('CLI preserves dotted identifiers in signals and questions', () => {
  const output = execFileSync(process.execPath, [
    'bin/interview-brief.js', 'fixtures/dotted-identifiers.json', '--format', 'json',
  ], { encoding: 'utf8' });
  const brief = JSON.parse(output);

  assert.deepEqual(brief.roleSignals, [
    'Build Node.js services',
    'Improve release automation',
  ]);
  assert.equal(
    brief.interviewQuestions[0],
    'What would success look like for Build Node.js services?',
  );
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

test('CLI reports invalid input files without stack traces', () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-input-'));
  const cases = [
    { name: 'directory', path: directory, message: /not a regular file/ },
    { name: 'missing', path: join(directory, 'missing.md'), message: /Input file not found/ },
    { name: 'malformed JSON', path: join(directory, 'malformed.json'), content: '{bad', message: /Invalid JSON/ },
    { name: 'null JSON', path: join(directory, 'null.json'), content: 'null', message: /JSON input must be an object/ },
    { name: 'array JSON', path: join(directory, 'array.json'), content: '[]', message: /JSON input must be an object/ },
    { name: 'primitive JSON', path: join(directory, 'primitive.json'), content: '42', message: /JSON input must be an object/ },
  ];

  for (const testCase of cases) {
    if (testCase.content !== undefined) writeFileSync(testCase.path, testCase.content);
    const result = spawnSync(process.execPath, ['bin/interview-brief.js', testCase.path], {
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0, testCase.name);
    assert.match(result.stderr, testCase.message, testCase.name);
    assert.match(result.stderr, /Usage: interview-brief/, testCase.name);
    assert.doesNotMatch(result.stderr, /\n\s+at\s/, testCase.name);
  }
});

test('parser rejects non-files, malformed JSON, and non-object JSON', () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-parser-'));
  const inputs = [
    { path: directory, message: /not a regular file/ },
    { path: join(directory, 'missing.md'), message: /Input file not found/ },
    { path: join(directory, 'bad.json'), content: '{bad', message: /Invalid JSON/ },
    { path: join(directory, 'null.json'), content: 'null', message: /must be an object/ },
    { path: join(directory, 'array.json'), content: '[]', message: /must be an object/ },
    { path: join(directory, 'string.json'), content: '"notes"', message: /must be an object/ },
  ];

  for (const input of inputs) {
    if (input.content !== undefined) writeFileSync(input.path, input.content);
    assert.throws(() => loadInterviewInput(input.path), error => (
      error instanceof InputError && input.message.test(error.message)
    ));
  }
});

test('CLI reports unreadable input without a stack trace', { skip: process.platform === 'win32' }, () => {
  const directory = mkdtempSync(join(tmpdir(), 'interview-brief-unreadable-'));
  const input = join(directory, 'notes.md');
  writeFileSync(input, '# Role\nEngineer');
  chmodSync(input, 0o000);

  const result = spawnSync(process.execPath, ['bin/interview-brief.js', input], {
    encoding: 'utf8',
  });
  chmodSync(input, 0o600);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Cannot read input file/);
  assert.match(result.stderr, /Usage: interview-brief/);
  assert.doesNotMatch(result.stderr, /\n\s+at\s/);
});
