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
node bin/interview-brief.js --format json fixtures/sample-interview.md
```

The CLI accepts exactly one input path and at most one optional `--format`
option in either order. The format defaults to `markdown` and must be `markdown` or
`json`. The input path must name a readable regular file. Files ending in
`.json` must contain a top-level object; supported fields are `role` (or
`job`), `company`, `candidate` (or `notes`), and `meeting`. Other files are
parsed as Markdown. Every supported field that is present must contain a
string; arrays, objects, numbers, booleans, and `null` are rejected. Missing
and empty fields normalize to empty strings, with a non-empty `job` or `notes`
alias used when its corresponding primary field is missing or empty.

Missing or unreadable files, directories, malformed JSON, non-object JSON,
non-string supported fields, invalid options, and unsupported formats print a
concise diagnostic plus usage guidance and exit nonzero. Expected input errors
do not print Node stack traces.

## What It Does

- Reads local fixtures only.
- Produces deterministic Markdown or JSON.
- Keeps evidence and assumptions visible.
- Fails fast with user-facing diagnostics for invalid input files or formats.

## Safety Notes

This package performs no network requests and writes no external accounts. Review generated text before sending it to another system. Redaction and classification are best-effort aids, not compliance guarantees.

## Limitations

The MVP uses deterministic heuristics so results are easy to test and inspect.
Evidence matching requires an exact, non-generic keyword shared by the
role/company text and candidate notes. Broad terms such as `experience`,
`skills`, and `background` do not count as grounded overlap; synonyms and
semantic similarity are not inferred. The package does not scrape, enrich from
live services, or call an LLM.

Evidence is split at newlines, semicolons, and periods followed by whitespace
(or the end of the input). Periods inside dotted identifiers such as `Node.js`
remain part of the same signal. Sentence periods must therefore be followed by
whitespace to act as delimiters.

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
