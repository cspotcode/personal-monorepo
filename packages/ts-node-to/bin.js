#!/usr/bin/env node

var tsNodeBin = require('ts-node/dist/bin.js');

// Prepend --transpile-only to args
// We could use the environment variable, but that would leak and isn't strictly necessary.
tsNodeBin.main(['--transpile-only'].concat(process.argv.slice(2)));
