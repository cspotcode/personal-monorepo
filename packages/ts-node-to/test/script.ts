#!/usr/bin/env ts-node-to

/*
Quick, manual test:
ts-node ./test/script.ts should fail
./bin.js ./test/script.ts should succeed and log `123`
*/

let a: boolean = 'hello';
a = 123;

console.log(a);
