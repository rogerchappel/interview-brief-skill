import { execFileSync } from "node:child_process";

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8"
});
const [pack] = JSON.parse(output);
const files = new Set(pack.files.map((file) => file.path));
const required = [
  "bin/interview-brief.js",
  "src/brief.js",
  "src/parser.js",
  "fixtures/sample-interview.md",
  "fixtures/sample-interview.json",
  "SKILL.md",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "CONTRIBUTING.md"
];
const missing = required.filter((file) => !files.has(file));

if (missing.length > 0) {
  console.error(`Package smoke failed; missing: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`package smoke ok: ${pack.filename} includes ${pack.files.length} files`);
