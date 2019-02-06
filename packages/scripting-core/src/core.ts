import * as fs from 'fs';
import * as JSON5 from 'json5';
import * as shelljs from 'shelljs';
import * as crossSpawn from 'cross-spawn';
import * as child_process from 'child_process';
import { resolve } from 'path';
import {map, filter, escapeRegExp} from 'lodash';

export function patchTextFile(path: string, cb: (v: string) => string) {
    const result = cb(readTextFile(path));
    return writeTextFile(path, result);
}

export function patchJsonFile(path: string, cb: (v: any) => any, {
        parser = 'JSON5', 
        indentationLevel = 4
    }: {
        parser?: JsonParserName,
        indentationLevel?: number
    } = {}
) {
    return patchTextFile(path, (text) => {
        const v = JSON5.parse(text);
        const response = cb(v);
        return JSON.stringify(response === undefined ? v : response, null, indentationLevel) + '\n';
    });
}

export type JsonParserName = 'JSON5';
export function readJsonFile(path: string, parser: JsonParserName = 'JSON5') {
    return JSON5.parse(readTextFile(path));
}
export function writeJsonFile(path: string, value: any, indentationLevel = 4) {
    return writeTextFile(path, JSON.stringify(value, null, 4) + '\n');
}

export function readTextFile(path: string) {
    return fs.readFileSync(path, 'utf8');
}

export function writeTextFile(path: string, contents: string) {
    return fs.writeFileSync(path, contents);
}

/**
 * Extract a span of text from a multiline file, delimited by startLine and endLine
 * 
 * Example delimiters:
 * 
 *     ###<NAME>
 *     ###</NAME>
 */
export function extractDelimitedSpan(source: string, startLine: string, endLine: string) {
    const regexp = new RegExp(
        String.raw `(?:^|\n)${ escapeRegExp(startLine) }([\r\n](?:[\s\S]*[\r\n])?)${ escapeRegExp(endLine) }(?:[\r\n]|$)`
    );
    return source.match(regexp)![1];
}

function shelljsExecAsync(command: string, options?: shelljs.ExecOptions) {
    return new Promise<shelljs.ExecOutputReturnValue>((res, rej) => {
        shelljs.exec(command, options, (code, stdout, stderr) => {
            if(code) return rej({code});
            res({code, stdout, stderr});
        });
    });
}
export {exec as shelljsExec} from 'shelljs';

export const filterMap: typeof map = ((iterable: any, callback: any, rejectedValue = undefined) => {
    return filter(map(iterable, callback), (v) => {
        return v !== rejectedValue;
    });
}) as any;
/** lodash map(), then filter() the results.  If the callback throws, it is silently filtered out. */
export const tryFilterMap: typeof map = ((iterable: any, callback: any, rejectedValue = undefined) => {
    const throwRejection = {};
    return filter(
        map(
            iterable,
            (...args) => {
                try {
                    return callback(...args);
                } catch(e) {
                    return throwRejection;
                }
            }
        ),
        (v) => {
            return v !== rejectedValue && v !== throwRejection;
        }
    );
}) as any;

export function spawn(args: string[], options: child_process.SpawnOptions & {
    input?: string;
    stdin?: 'ignore' | 'inherit' | 'pipe';
    output?: 'ignore' | 'inherit' | 'capture' | 'tee';
    stdout?: 'ignore' | 'inherit' | 'capture' | 'tee';
    stderr?: 'ignore' | 'inherit' | 'capture' | 'tee';
}) {
    const {input, output = 'pipe'} = options
    const {
        stdin = typeof input === 'string' ? 'pipe' : 'ignore',
        stdout = output,
        stderr = output
    } = options;
    const nodeOptions = {
        stdout: options.stdout || options.output || 'pipe',
        stderr: options.stderr || options.output || 'pipe',
        stdin: typeof options.input === 'string' ? 'pipe' : options.stdin || 'ignore',
    };

    const childProcess = crossSpawn(args[0], args.slice(1), {
        ...options
    });
    childProcess.on('exit', (code, signal) => {
        resolve({
            code,
            signal,

        });
    });
}
