# Interview Brief Skill

Local-first interview preparation brief skill for job and company notes. It is designed for agents that need a repeatable, fixture-backed workflow before sharing summaries or acting on external systems.

## Quickstart

```bash
npm install
npm run smoke
```

Run the CLI directly:

```bash
node bin/interview-brief.js fixtures/sample-interview.md --format markdown
node bin/interview-brief.js fixtures/sample-interview.md --format json
```

## What It Does

- Reads local fixtures only.
- Produces deterministic Markdown or JSON.
- Keeps evidence and assumptions visible.
- Fails fast on missing input files or unsupported formats.

## Safety Notes

This package performs no network requests and writes no external accounts. Review generated text before sending it to another system. Redaction and classification are best-effort aids, not compliance guarantees.

## Limitations

The MVP uses deterministic heuristics so results are easy to test and inspect.
Evidence matching requires an exact, non-generic keyword shared by the
role/company text and candidate notes. Broad terms such as `experience`,
`skills`, and `background` do not count as grounded overlap; synonyms and
semantic similarity are not inferred. The package does not scrape, enrich from
live services, or call an LLM.

## Development

```bash
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

## Release Readiness

Run `npm run release:check` before publishing or tagging. The package smoke
step verifies that the CLI, library modules, skill instructions, fixtures,
license, changelog, contribution guide, and security policy are included in the
dry-run tarball.

## Security

See [SECURITY.md](SECURITY.md) for supported versions and vulnerability
reporting guidance. Use synthetic interview notes in bug reports and fixtures.
