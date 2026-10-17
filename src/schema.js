export const BRIEF_SCHEMA = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://rogerchappel.github.io/interview-brief-skill/schemas/brief-v1.json',
  title: 'Interview Brief', type: 'object', additionalProperties: false,
  required: ['source', 'roleSignals', 'companyThemes', 'tailoredTalkingPoints', 'interviewQuestions', 'risks', 'followUps', 'assumptions'],
  properties: Object.fromEntries(['source', 'roleSignals', 'companyThemes', 'tailoredTalkingPoints', 'interviewQuestions', 'risks', 'followUps', 'assumptions'].map((name, i) => [name, i === 0 ? { type: 'string' } : { type: 'array', items: { type: 'string' } }])) ,
});
