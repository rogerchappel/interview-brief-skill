# Interview Brief Skill

## When To Use

Use this skill when an agent has local role, company, candidate, or meeting notes and needs a grounded interview preparation brief with assumptions separated from evidence.

## Required Inputs

- A local fixture file in the supported format.
- Permission to read the file contents.
- A target output format: `markdown` or `json`.

## Side-Effect Boundaries

The skill reads local files and writes to stdout only. It must not send messages, update CRMs, create issues, push commits, or call live APIs without a separate explicit approval.

## Approval Requirements

Human approval is required before sharing generated briefs outside the workspace, using them as final public claims, or taking any external account action based on the output.

## Examples

```bash
npm run smoke
node bin/interview-brief.js fixtures/sample-interview.md --format json
```

## Validation Workflow

1. Run `npm test`.
2. Run `npm run check`.
3. Run `npm run build`.
4. Run `npm run smoke`.
5. Inspect the output for unsupported assumptions before use.
