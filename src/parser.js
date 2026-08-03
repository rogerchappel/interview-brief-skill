import { readFileSync } from 'node:fs';

export function loadInterviewInput(path) {
  const raw = readFileSync(path, 'utf8');
  if (path.endsWith('.json')) return normalizeJson(JSON.parse(raw), path);
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
