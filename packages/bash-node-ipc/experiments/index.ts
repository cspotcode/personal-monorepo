#!/usr/bin/env ts-node-to
import {start} from '../src';

const commands = {
  foo() {
    return 'bar:' + [...arguments].join(' ');
  }
};

start(commands);


// decorate({args: ['string', 'dictionary', 'array'], ret: 'string', fn: foo})
function foo(
    a: string
): string {
    return 'yup';
}
