import { readFileSync, statSync } from 'node:fs';

export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
  }
}

export function loadInterviewInput(path) {
  let stats;
  try {
    stats = statSync(path);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new InputError(`Input file not found: ${path}`);
    throw new InputError(`Cannot read input file: ${path}`);
  }
  if (!stats.isFile()) throw new InputError(`Input path is not a regular file: ${path}`);

  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    throw new InputError(`Cannot read input file: ${path}`);
  }

  if (path.endsWith('.json')) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new InputError(`Invalid JSON in input file: ${path}`);
    }
    if (data === null || Array.isArray(data) || typeof data !== 'object') {
      throw new InputError(`JSON input must be an object: ${path}`);
    }
    return normalizeJson(data, path);
  }
  return normalizeMarkdown(raw, path);
}

function normalizeJson(data, path) {
  return {
    source: path,
    role: String(data.role || data.job || ''),
    company: String(data.company || ''),
    candidate: String(data.candidate || data.notes || ''),
    meeting: String(data.meeting || ''),
  };
}

function normalizeMarkdown(raw, path) {
  const items = { role: [], company: [], candidate: [], meeting: [] };
  let current = 'role';
  let wrappingListItem = false;
  for (const line of raw.split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const recognized = heading[1].match(/^(Role|Company|Candidate|Meeting)$/i);
      current = recognized ? recognized[1].toLowerCase() : null;
      wrappingListItem = false;
      continue;
    }
    if (!current || !line.trim()) {
      wrappingListItem = false;
      continue;
    }

    const listItem = line.match(/^\s*[-*+]\s+(.*)$/);
    if (listItem) {
      items[current].push(listItem[1].trim());
      wrappingListItem = true;
    } else if (wrappingListItem && /^\s+/.test(line)) {
      const last = items[current].length - 1;
      items[current][last] += ` ${line.trim()}`;
    } else {
      items[current].push(line.trim());
      wrappingListItem = false;
    }
  }
  return {
    source: path,
    ...Object.fromEntries(Object.entries(items).map(([name, values]) => [name, values.join('\n')])),
  };
}
