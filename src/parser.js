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
  const sections = { source: path, role: '', company: '', candidate: '', meeting: '' };
  let current = 'role';
  for (const line of raw.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(Role|Company|Candidate|Meeting)/i);
    if (heading) {
      current = heading[1].toLowerCase();
      continue;
    }
    if (line.trim()) sections[current] += `${line.trim()}\n`;
  }
  return sections;
}
