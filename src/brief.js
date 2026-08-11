import { loadInterviewInput } from './parser.js';

const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'role', 'company',
  'your', 'you', 'are', 'will', 'into', 'about',
  'ability', 'background', 'experience', 'experienced', 'knowledge', 'skills',
  'teams', 'working', 'years',
]);

export function createBrief(path) {
  const input = loadInterviewInput(path);
  const roleSignals = bullets(input.role, 6);
  const companyThemes = bullets(input.company, 6);
  const candidateSignals = bullets(input.candidate, 6);
  const overlap = keywords(`${input.role}\n${input.company}`).filter(word => keywords(input.candidate).includes(word));
  const assumptions = missingSections(input).map(name => `${name} evidence was not provided.`);
  return {
    source: input.source,
    roleSignals,
    companyThemes,
    tailoredTalkingPoints: makeTalkingPoints(overlap, candidateSignals),
    interviewQuestions: makeQuestions(roleSignals, companyThemes),
    risks: makeRisks(input, overlap),
    followUps: makeFollowUps(input),
    assumptions,
  };
}

export function renderMarkdown(brief) {
  return [
    '# Interview Brief', '', `Source: ${brief.source}`,
    section('Role Signals', brief.roleSignals),
    section('Company Themes', brief.companyThemes),
    section('Tailored Talking Points', brief.tailoredTalkingPoints),
    section('Questions To Ask', brief.interviewQuestions),
    section('Risks To Clarify', brief.risks),
    section('Follow-Up Prompts', brief.followUps),
    section('Assumptions And Gaps', brief.assumptions),
  ].join('\n');
}

function bullets(text, limit) {
  return text.split(/\n|;|\.(?=\s|$)/).map(s => s.replace(/^[-*]\s*/, '').trim()).filter(Boolean).slice(0, limit);
}

function keywords(text) {
  return [...new Set(String(text).toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) || [])].filter(word => !STOP.has(word));
}

function makeTalkingPoints(overlap, candidateSignals) {
  const points = overlap.slice(0, 5).map(word => `Connect your ${word} experience to the role evidence.`);
  return points.length ? points : candidateSignals.slice(0, 3).map(signal => `Use candidate evidence: ${signal}`);
}

function makeQuestions(roleSignals, companyThemes) {
  const role = roleSignals[0] || 'the highest-priority outcomes';
  const company = companyThemes[0] || 'current company priorities';
  return [`What would success look like for ${role}?`, `How does this team support ${company}?`, 'Which risks should a new hire understand in the first 90 days?'];
}

function makeRisks(input, overlap) {
  const risks = [];
  if (!input.company.trim()) risks.push('Company evidence is missing; do not infer strategy.');
  if (!input.role.trim()) risks.push('Role evidence is missing; keep prep generic.');
  if (!overlap.length) risks.push('No strong keyword overlap found between candidate notes and role/company evidence.');
  return risks;
}

function makeFollowUps(input) {
  const prompts = ['Draft a concise thank-you note using only confirmed interview details.'];
  if (input.meeting.trim()) prompts.unshift(`Confirm meeting context: ${input.meeting.trim().split(/\n/)[0]}`);
  return prompts;
}

function missingSections(input) {
  return ['role','company','candidate','meeting'].filter(name => !input[name].trim());
}

function section(title, values) {
  const rows = values.length ? values.map(value => `- ${value}`) : ['- None provided'];
  return [``, `## ${title}`, ``, ...rows].join('\n');
}
