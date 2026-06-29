# Security Policy

## Supported Versions

`interview-brief-skill` is pre-1.0. Security fixes are applied to the latest
published package and the `main` branch.

## Reporting a Vulnerability

Please report vulnerabilities through GitHub security advisories or another
private maintainer contact path before sharing details publicly.

Helpful reports include:

- the affected version or commit
- the interview note or fixture shape that triggers the issue
- whether sensitive candidate, company, or contact details can leak in output
- a minimal reproduction that uses synthetic data

Do not include real candidate data, private company notes, credentials,
customer details, or unreleased interview materials in public issues or
fixtures.

## Scope

This tool reads local interview notes and writes deterministic reports to
stdout. Security reports are most useful when they involve unintended file
access, disclosure of sensitive notes, unsafe package contents, or output that
could misrepresent heuristic summaries as verified facts.
