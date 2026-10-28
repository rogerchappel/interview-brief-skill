import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const minimum = packageJson.engines?.node?.match(/^>=(\d+)$/)?.[1];
if (!minimum) fail('package.json engines.node must be a simple >=<major> range');

const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
const matrix = workflow.match(/^\s+node-version:[ \t]*\n((?:[ \t]+-[ \t]+\d+[ \t]*\n?)+)/m);
if (!matrix) fail('.github/workflows/ci.yml must declare a numeric node-version matrix');
const versions = [...matrix[1].matchAll(/^[ \t]+-[ \t]+(\d+)[ \t]*$/gm)].map(([, version]) => Number(version));
if (versions.length === 0) fail('CI Node.js matrix must not be empty');
if (!versions.includes(Number(minimum))) fail(`CI Node.js matrix must include package minimum ${minimum}`);
if (!versions.includes(24)) fail('CI Node.js matrix must include current Node.js 24 runtime');
if (Math.min(...versions) !== Number(minimum)) fail(`CI Node.js matrix minimum ${Math.min(...versions)} does not match package minimum ${minimum}`);
console.log(`Node.js engine ${packageJson.engines.node} matches CI matrix ${versions.join(', ')}`);

function fail(message) { console.error(message); process.exit(1); }
