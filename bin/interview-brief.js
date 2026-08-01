#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { createBrief, renderMarkdown } from '../src/brief.js';

const args = process.argv.slice(2);
const { input, format, error } = parseArgs(args);

if (error) {
  console.error(error);
  console.error('Usage: interview-brief <notes.md|json> [--format markdown|json]');
  process.exit(1);
}

if (!existsSync(input)) {
  console.error(`Input file not found: ${input}`);
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

function parseArgs(args) {
  let input;
  let format = 'markdown';

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--format') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        return { error: 'Missing value for --format.' };
      }
      format = value;
      index += 1;
    } else if (arg.startsWith('--')) {
      return { error: `Unexpected option: ${arg}` };
    } else if (input) {
      return { error: `Unexpected positional argument: ${arg}` };
    } else {
      input = arg;
    }
  }

  if (!input) return { error: 'Missing input file.' };
  return { input, format };
}
