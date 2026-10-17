# Orchestration

1. Confirm the input file is local and safe to inspect.
2. Run `node bin/interview-brief.js fixtures/sample-interview.md --format markdown` or call the library API from an agent workflow.
3. Review generated Markdown or JSON before using it in a PR, message, or handoff.
4. Treat any external send, CRM write, calendar update, or job-board action as out of scope until a human approves it.

## Agent Contract

Inputs are local files. Outputs are draft artifacts. Side effects are limited to terminal output unless a caller redirects stdout.

## Versioned JSON schema

`node bin/interview-brief.js --schema` writes the optional JSON Schema Draft 2020-12 contract to stdout. It is a standalone export; it does not change the default Markdown output or `--format json` output. The exported schema has the stable identifier ending in `schemas/brief-v1.json`; changing the output field contract requires a new versioned identifier. It requires `source` (string) and the seven signal collections (`roleSignals`, `companyThemes`, `tailoredTalkingPoints`, `interviewQuestions`, `risks`, `followUps`, and `assumptions`) as arrays of strings, and disallows undeclared fields.
