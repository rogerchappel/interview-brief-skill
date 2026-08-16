#!/usr/bin/env node
import { createBrief, renderMarkdown } from '../src/brief.js';
import { InputError } from '../src/parser.js';

const usage = 'Usage: interview-brief <notes.md|json> [--format markdown|json]';

const args = process.argv.slice(2);
const { input, format, error } = parseArgs(args);

if (error) {
  console.error(error);
  console.error(usage);
  process.exit(1);
}

let brief;
try {
  brief = createBrief(input);
} catch (cause) {
  if (!(cause instanceof InputError)) throw cause;
  console.error(cause.message);
  console.error(usage);
  process.exit(1);
}

if (format === 'json') {
  console.log(JSON.stringify(brief, null, 2));
} else if (format === 'markdown') {
  console.log(renderMarkdown(brief));
} else {
  console.error(`Unsupported format: ${format}`);
  console.error(usage);
  process.exit(1);
}

function parseArgs(args) {
  let input;
  let format = 'markdown';
  let hasFormat = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--format') {
      if (hasFormat) return { error: 'Duplicate option: --format.' };
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        return { error: 'Missing value for --format.' };
      }
      format = value;
      hasFormat = true;
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
