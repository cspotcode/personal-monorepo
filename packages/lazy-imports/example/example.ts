import 'lazy-imports/enable';
import foo from './foo';
import 'lazy-imports/disable';
console.dir(Object.keys(require.cache));
console.dir(module.id);

import bar from './bar';

import 'lazy-imports/enable';
import baz from './baz';
import 'lazy-imports/disable';

console.log('foo has not been used yet');
foo();
console.log('foo has been used');
console.log('bar has not been used yet');
bar();
console.log('bar has been used');
console.log('baz has not been used yet');
baz();
console.log('baz has been used');
