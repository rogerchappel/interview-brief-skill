import { readFileSync, existsSync } from 'node:fs';

const required = ['README.md', 'SKILL.md', 'docs/PRD.md', 'docs/TASKS.md', 'docs/ORCHESTRATION.md', 'docs/RELEASE_CANDIDATE.md'];
const missing = required.filter(path => !existsSync(path));
if (missing.length) fail(`Missing required files: ${missing.join(', ')}`);
const readme = readFileSync('README.md', 'utf8');
for (const phrase of ['Quickstart', 'Safety Notes', 'Limitations']) {
  if (!readme.includes(phrase)) fail(`README.md missing ${phrase}`);
}
console.log('check ok');
function fail(message) { console.error(message); process.exit(1); }
