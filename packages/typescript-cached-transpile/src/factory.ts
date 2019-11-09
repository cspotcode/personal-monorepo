import * as Ts from 'typescript';
import Path from 'path';
import { computeSha1 } from './sha1';
import { DiskCache } from './cache';
import { debug } from './debug-log';
const pkg = require('../package');

export interface Options {
    compiler?: typeof Ts;
    cachePath?: string;
}

export function create(opts: Options = {}): typeof Ts {
    let {
        compiler = require('typescript') as typeof Ts,
        cachePath = Path.resolve(__dirname, '../.cache')
    } = opts;

    const diskCache = new DiskCache(cachePath);
    const transpileModule: typeof Ts['transpileModule'] = (input: string, transpileOptions: Ts.TranspileOptions): Ts.TranspileOutput => {
        let canCache = true;

        // Decide if we cannot cache for various reasons
        if(transpileOptions.renamedDependencies) {
            canCache = false;
        } else if(
            transpileOptions.transformers?.after?.length ||
            transpileOptions.transformers?.before?.length ||
            transpileOptions.transformers?.afterDeclarations?.length
        ) {
            canCache = false;
        }

        let outputTextCacheKey: string;
        let sourceMapCacheKey: string;
        if(canCache) {
            // compute cache keys
            const config = {
                selfVersion: pkg.version,
                typescriptVersion: compiler.version,
                ...transpileOptions.compilerOptions
            };
            const configSha1 = computeSha1(Buffer.from(JSON.stringify(config), 'utf8'));
            const codeSha1 = computeSha1(Buffer.from(transpileOptions.fileName || '', 'utf8'), Buffer.from(input, 'utf8'));
            const key = configSha1 + codeSha1;
            outputTextCacheKey = key + '-outputText';
            sourceMapCacheKey = key + '-outputSourceMap';

            // try loading from cache
            const cachedOutputText = diskCache.get(outputTextCacheKey);
            const cachedSourceMapText = cachedOutputText ? diskCache.get(sourceMapCacheKey) : null;
            debug({
                message: 'attempted to load from cache',
                canCache, fileName: transpileOptions.fileName, outputTextCacheKey, sourceMapCacheKey
            });

            // if found in cache, return cached results
            if(cachedOutputText && cachedSourceMapText) {
                return {
                    outputText: cachedOutputText.toString('utf8'),
                    sourceMapText: cachedSourceMapText.toString('utf8'),
                    diagnostics: []
                };
            }
        }

        // not found in cache; call compiler
        const {outputText, diagnostics, sourceMapText} = compiler.transpileModule(input, transpileOptions);

        debug({
            message: 'called the compiler',
            canCache, fileName: transpileOptions.fileName, outputTextLength: outputText.length, diagnostics, sourceMapTextLength: sourceMapText?.length
        });

        // if results can be cached
        if(canCache && outputText && sourceMapText && !(diagnostics?.length)) {
            // save to cache
            debug('saving to cache');
            diskCache.set(outputTextCacheKey!, outputText);
            diskCache.set(sourceMapCacheKey!, sourceMapText);
        } else {
            debug('cannot save cache');
        }

        // return result from compiler
        return {outputText, diagnostics, sourceMapText};
    };
    const ret: typeof Ts = {
        ...compiler,
        transpileModule
    };
    return ret;
}
