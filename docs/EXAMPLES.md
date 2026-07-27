# Examples

```bash
node bin/interview-brief.js fixtures/sample-interview.md --format markdown
node bin/interview-brief.js fixtures/sample-interview.json --format json
node bin/interview-brief.js fixtures/generic-overlap.json --format json
```

Use generated questions and talking points as drafts. Do not treat assumptions as facts.

The generic-overlap fixture demonstrates the matching boundary: broad terms such
as `experience`, `skills`, and `background` do not establish evidence overlap.
Its candidate note remains available as candidate evidence, while the output
also reports the no-overlap risk. Specific shared terms such as `local-first`
can produce a role-connected talking point.
