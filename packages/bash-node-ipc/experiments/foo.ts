#!/usr/bin/env ts-node-to

import { passThrough } from "..";

async function *stringSender() {
    try {
        let i = 0;
        while(true) {
            i++;
            console.dir(yield '3');
            console.dir(yield 'hello');
            console.dir(yield 'world');
            console.dir(yield `${ i }`);
        }
    } catch(e) {
        console.log(`Error in stringSender: ${ e }`);
    }
}

async function *getMessages(chunkReader: AsyncIterableIterator<string>): AsyncIterableIterator<Array<string>> {
    while(true) {
        const next = await chunkReader.next();
        if(next.done) return;
        const messageLength = parseInt(next.value);
        const message: string[] = [];
        if(messageLength !== 0) {
            for await(const chunk of passThrough(chunkReader)) {
                message.push(chunk.toString());
                if(message.length === messageLength) {
                    yield message;
                    break;
                }
            }
        }
    }
}

async function main() {
    // for await (const message of getMessages(stringSender())) {
    //     console.dir(message);
    // }

    // let i = 0;
    // for await (const message of stringSender()) {
    //     i++;
    //     if(i > 5) {
    //         break;
    //     }
    //     console.dir(message);
    // }

    function* foo() {
        try {
            console.dir({yield1: yield 1});
            console.dir({yield2: yield 2});
            console.dir({yield3: yield 3});
        } catch(e) {
            console.log('Error in foo: ' + e);
        } finally {
            console.log('cleanup logic here');
        }
    }

    const iter = foo();
    const n = iter.next('first call');
    console.dir({n});
    const n2 = iter.next('second call');
    console.dir({n2});
    const n3 = iter.return!('return call');
    console.dir({n3});
}

main();
