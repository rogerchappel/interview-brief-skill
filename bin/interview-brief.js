#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { createBrief, renderMarkdown } from '../src/brief.js';

const args = process.argv.slice(2);
const input = args.find(arg => !arg.startsWith('--'));
const format = readOption(args, '--format') || 'markdown';

if (!input || !existsSync(input)) {
  console.error('Usage: interview-brief <notes.md|json> [--format markdown|json]');
  process.exit(1);
}

const brief = createBrief(input);
if (format === 'json') {
  console.log(JSON.stringify(brief, null, 2));
} else if (format === 'markdown') {
  console.log(renderMarkdown(brief));
} else {
  console.error(`Unsupported format: ${format}`);
  process.exit(1);
}

function readOption(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}
