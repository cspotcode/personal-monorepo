import * as fs from 'fs';
import * as Path from 'path';
import * as JSON5 from 'json5';
import * as shelljs from 'shelljs';
import crossSpawn from 'cross-spawn';
import * as child_process from 'child_process';
import { resolve } from 'path';
import {map, filter, escapeRegExp} from 'lodash';
import {sync as mkdirpSync} from 'mkdirp';
import {sync as globSync, IOptions as GlobOptions} from 'glob';

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
    return writeTextFile(path, JSON.stringify(value, null, indentationLevel) + '\n');
}
export function writeJsonFileMkdirp(path: string, value: any, indentationLevel = 4) {
    return writeTextFileMkdirp(path, JSON.stringify(value, null, indentationLevel) + '\n');
}

export function readTextFile(path: string) {
    return fs.readFileSync(path, 'utf8');
}

export function writeTextFile(path: string, contents: string) {
    return fs.writeFileSync(path, contents);
}
export function writeTextFileMkdirp(path: string, contents: string) {
    mkdirpSync(Path.dirname(path));
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

/**
 * Replace a span of text from a multiline file, delimited by startLine and endLine
 * 
 * Example delimiters:
 * 
 *     ###<NAME>
 *     ###</NAME>
 */
export function replaceDelimitedSpan(source: string, startLine: string, endLine: string, replacement: ((match: {content: string}) => string) | string): string {
    const regexp = new RegExp(
        String.raw `(^[\s\S]*(?:^|\n))(${ escapeRegExp(startLine) })([\r\n](?:[\s\S]*[\r\n])?)(${ escapeRegExp(endLine) })((?:[\r\n]|$)[\s\S]*$)`
    );
    const match = source.match(regexp)!;
    if(typeof replacement === 'function') {
        replacement = replacement({content: match[3]});
    }
    return match[1] + match[2] + replacement + match[4] + match[5];
}

function shelljsExecAsync(command: string, options?: shelljs.ExecOptions) {
    return new Promise<shelljs.ExecOutputReturnValue>((res, rej) => {
        shelljs.exec(command, options || {}, (code, stdout, stderr) => {
            if(code) return rej({code});
            res({code, stdout, stderr});
        });
    });
}
export {exec as shelljsExec} from 'shelljs';

export const filterMap: typeof map = ((iterable: any, callback: any, rejectedValue: any = undefined) => {
    return filter(map(iterable, callback), (v) => {
        return v !== rejectedValue;
    });
}) as any;
/** lodash map(), then filter() the results.  If the callback throws, it is silently filtered out. */
export const tryFilterMap: typeof map = ((iterable: any, callback: any, rejectedValue: any = undefined) => {
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
        (resolve as any)({
            code,
            signal,
        });
    });
}

/**
 * Like glob.sync but returns an array of pairs, mapping each file from a source to a destination.
 * Useful for grunt-like situations where you want to process a bunch of files from a source dir
 * to a destination dir.
 */
export function globFromToSync(pattern: string, options: GlobOptions & {dest: string, extMap: Record<string, string>}) {
    const {cwd = '.', dest, extMap} = options;
    const extMappings = Object.entries(extMap);
    return globSync(pattern, options).map(r => {
        const srcFile = Path.join(cwd, r);
        let destFile = Path.join(dest, r);
        for(const [srcExt, destExt] of extMappings) {
            if(destFile.slice(-srcExt.length) === srcExt) {
                destFile = destFile.slice(0, -srcExt.length) + destExt;
                break;
            }
        }
        return {
            src: srcFile,
            dest: destFile,
        };
    });
}
