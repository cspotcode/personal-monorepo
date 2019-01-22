#!/usr/bin/env node

// Prepend --transpile-only to args
// We could use the environment variable, but that would leak and isn't strictly necessary.
process.argv.splice(2, 0, '--transpile-only');
require('ts-node/dist/bin.js');
