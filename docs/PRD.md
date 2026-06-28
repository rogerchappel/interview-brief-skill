# Interview Brief Skill PRD

Status: in-progress
Owner: Roger Chappel
Lane: oss-factory-agent-skills

## Problem

Job-search and company-research agents need a repeatable local skill for turning a role description, company notes, and candidate context into a practical interview prep brief. The skill should keep private notes local, cite the provided inputs, and separate evidence from assumptions.

## Users

- Agents preparing Roger for recruiter screens and technical interviews
- Job-search workflows that need consistent company and role summaries
- Operators drafting follow-up questions from local notes

## MVP

- Parse Markdown or JSON fixtures for role, company, candidate notes, and meeting context.
- Produce Markdown or JSON briefs with role signals, company themes, tailored talking points, questions, risks, and follow-up prompts.
- Mark missing evidence and assumptions explicitly.
- Include a reusable `SKILL.md` explaining use cases, inputs, side-effect boundaries, external approval requirements, examples, and verification workflow.
- Provide fixture-backed tests, smoke command, and release-candidate notes.

## Non-Goals

- No scraping or live enrichment.
- No external CRM/job-board writes.
- No fabricated citations.

## Acceptance

- `npm test`, `npm run check`, `npm run build`, and `npm run smoke` pass locally.
- README includes quickstart, examples, limitations, and safety notes.
- Public repo exists under `rogerchappel/interview-brief-skill`.

