# Verification Results

Run on 2026-08-22 (Australia/Brisbane).

- `npm run release:check` - pass on Node.js 18, 20, and 22 in CI
- `npm run check` - pass: static package checks completed
- `npm test` - pass: 20 tests passed
- `npm run build` - pass: build verification completed
- `npm run smoke` - pass: generated a Markdown brief from `fixtures/sample-interview.md`
- `npm run package:smoke` - pass: packed artifact contents and installed CLI/library behavior verified

The release gate runs every command above and must pass on every supported CI
runtime before the release candidate is classified as ready to ship.
