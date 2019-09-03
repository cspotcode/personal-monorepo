#!/usr/bin/env ts-node-to

import * as shellQuote from './shell-quote';
import binarySplit from 'binary-split';
import { Duplex, Readable, Writable } from 'stream';
import fs from 'fs';
import { EventEmitter } from 'events';
import assert from 'assert';

require('source-map-support').install();

/**
 * Read a binary stream, split into chunks on a delimiter, as a 
 */
class ChunkReader {
    constructor(public readonly readable: Readable, public readonly delimeter: Buffer = Buffer.from([0])) { }

    splitStream!: Duplex;
    start() {
        this.splitStream = binarySplit(this.delimeter);
        this.readable.pipe(this.splitStream);
    }

    /** TODO implement returning when the stream is closed */
    async *getChunks() {
        const stream = this.splitStream;
        const DONE = {} as { __DONE__: any };
        let resFns: { res: ((a: string | typeof DONE) => void), rej: (err: Error) => void }[] = [];
        let promises: Promise<string | typeof DONE>[] = [];
        promises.unshift(new Promise<string | typeof DONE>((res, rej) => { resFns.unshift({ res, rej }) }));
        const subscriptions = new DisposableEventListener(stream);
        subscriptions.on('data', (line) => {
            resFns[0].res(line);
            promises.unshift(new Promise((res, rej) => { resFns.unshift({ res, rej }) }));
        });
        subscriptions.on('end', () => {
            resFns[0].res(DONE);
        });
        subscriptions.on('error', (error) => {
            resFns[0].rej(error);
        });
        try {
            while(true) {
                const line = await promises[promises.length - 1];
                if(line === DONE) {
                    return;
                } else if(line instanceof Buffer) {
                    yield line.toString('utf8');
                } else {
                    throw 'This should never happen';
                }
                promises.pop();
                resFns.pop();
            }
        } finally {
            subscriptions.dispose();
        }
    }
}

interface Disposable {
    dispose(): void;
}
/** Register multiple event listeners on a target, then unregister them all at once via dispose() */
class DisposableEventListener<T extends EventEmitter> implements Disposable {
    constructor(public readonly emitter: T) {
        this.on = ((evt: string, fn: any) => {
            this.emitter.on(evt, fn);
            this.events.push({ evt, fn });
        }) as any;
    }
    readonly events: { evt: string, fn: any }[] = [];
    on: T['on'];
    dispose() {
        for(const { evt, fn } of this.events) {
            this.emitter.off(evt, fn);
        }
        this.events.length = 0;
    }
}

/**
 * NOTE: does *not* dispose of the chunkReader iterator.
 */
async function* getMessages(chunkReader: AsyncIterableIterator<string>): AsyncIterableIterator<Array<string>> {
    while(true) {
        const next = await chunkReader.next();
        if(next.done) return;
        const messageLength = parseInt(next.value);
        const message: string[] = [];
        if(messageLength !== 0) {
            for await(const chunk of noReturn(chunkReader)) {
                message.push(chunk.toString());
                if(message.length === messageLength) {
                    yield message;
                    break;
                }
            }
        }
    }
}

/**
 * Wrap an async iterator so that .return() is not passed to the wrapped `iter`.
 * This means you can `for await (const foo of noReturn(iter))`, `break;` out of
 * the loop, and it won't tell `iter` to stop early.
 */
export async function* noReturn<T>(iter: AsyncIterableIterator<T>): AsyncIterableIterator<T> {
    // TODO propagate the value of `yield` into the wrapped iterator?
    while(true) {
        const next = await iter.next();
        if(next.done) { return; }
        try {
            yield next.value;
        } catch(e) {
            await iter.throw!(e);
        }
    }
}

/**
 * Encode an array of strings into a line of bash that does not contain any
 * newlines
 */
function bashEncodeStringArray(arr: string[]) {
    return shellQuote.quote(arr);
}

export async function start(opts: {
    commands: any,
    input: Readable,
    output: Writable,
}) {
    const {
        input = fs.createReadStream('', { fd: 3 }) as Readable,
        output = fs.createWriteStream('', { fd: 4 }) as Writable,
        commands
    } = opts;
    const lineReader = new ChunkReader(input);
    const messageStream = getMessages(lineReader.getChunks());
    // TODO is this messy .resume() and .pause() stuff really necessary to avoid
    // early data being lost?
    lineReader.start();
    input.resume();
    // Read commands line-by-line from input pipe
    for await(const message of messageStream) {
        // parse command into array
        const [command, ...args] = message;

        const commandFn = commands[command];
        assert(typeof commandFn === 'function', `"${command}" is not the name of an exported function.`);

        let response: [number, string, string] = [0, '', ''];
        try {
            const result = await commandFn(...args);
            assert(typeof result === 'string' || typeof result === 'number' || typeof result === 'boolean' || result == null, `Return value of "${command}" is not one of the supported return types.`);
            if(typeof result === 'boolean') {
                response = [result ? 0 : 1, '', ''];
            } else {
                response = [0, `${ result }`, ''];
            }
        } catch(e) {
            response = [1, '', `${ e }`];
        }
        const encoded = bashEncodeStringArray(response.map(v => `${ v }`));

        // write encoded + trailing newline to output stream
        output.write(encoded + '\n');
    }
}

export async function getBashStubs(bashCoprocName: string, commands: any) {
    let a = `
        function __node_ipc_${bashCoprocName }__() {
            # Send to node as null-delimited sequence of messages
            # first one is the number of following strings in the message
            # next is a sequence of strings which will be parsed into an array
            printf "%s\\000" "\${#@}" "$@" >&"$\{${bashCoprocName }[1]}"
            local returnValueRaw
            local returnValues
            IFS='' read -r -d $'\n' returnValueRaw <&"$\{${bashCoprocName }[0]}"
    
            # Parse returnValueRaw into array
            eval "returnValues=($returnValueRaw)"

            # first item in array is exit code (JS can send 1 for any exception, 0 for success)
            # second item is return value for stdout
            # third value is error message for stderr

            # Write return value to stdout
            printf '%s' "\${returnValues[1]}"
            # write error message to stderr
            printf '%s' "\${returnValues[2]}" >&2
            # Return exit code
            return "\${returnValues[0]}"
        }
    `;
    for(const [name, fn] of Object.entries(commands)) {
        a += `
            function ${ name }() {
                __node_ipc_${bashCoprocName }__ ${ name } "$@"
            }
        `;
    }
    a += STUBS_EOF_MARKER;
    return a;
}

export const STUBS_EOF_MARKER = '\nEOF\n';
