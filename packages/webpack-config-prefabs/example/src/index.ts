#!/usr/bin/env node
import findUp from 'find-up';
import defaultImportFoo from './foo';
import * as wildcardImportFoo from './foo';
export = findUp;
// TODO this was creating a context for *everything* in node_modules and maybe elsewhere; had to comment out.
// Not sure what I was trying to do at the time.
//module.exports.__webpack_config_prefabs_context = require.context('.', true, /^\.\//);
console.dir(process.argv);
console.dir(__dirname);
console.dir(__filename);
console.dir(defaultImportFoo);
console.dir(wildcardImportFoo);
const path = './other';
declare const __node_require__: typeof require;
__node_require__(path);