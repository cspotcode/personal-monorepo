#!/usr/bin/env node

// Bootstrapper to load dependency tracker before any other modules load.

// TODO disabled for now because we're not using it.
// import {dependencyTracker} from 'node-module-hooks';
// dependencyTracker.install();

require('./main').start(require.main === module);
