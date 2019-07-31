#!/usr/bin/env ts-node-to
import {globFromToSync, readTextFile, readJsonFile, writeJsonFileMkdirp, writeTextFileMkdirp} from 'scripting-core';

/*
 * Post-process tsc output to be .mjs
 * Assumes sourcemaps are *not* inline.
 * 
 * Invocation:
 * ./js-to-mjs <src> <dest>
 * ./js-to-mjs ./dest-esm ./dest
 * 
 * Copies all .js and .js.map from source to dest directory
 * Rewrite //# sourceMap references at the bottom of .js to point to .mjs.map
 * Rewrite sourcemaps to refer to <code>.mjs instead of <code>.js
 */

const [_0, _1, from, to] = process.argv;

const sourceMapCommentRe = /(\n\/\/# sourceMappingURL=.*)\.js\.map($|\n$|\r\n$)/;

globFromToSync('**/*.{js,js.map}', {cwd: from, dest: to, extMap: {
    '.js': '.mjs',
    '.js.map': '.mjs.map'
}}).forEach(({src, dest}) => {
    console.log(`${src} -> ${dest}`);
    if(src.match(/\.js$/)) {
        // Copy file to .mjs, rewriting sourcemap reference
        const processed = readTextFile(src).replace(
            sourceMapCommentRe,
            '$1.mjs.map$2'
        );
        writeTextFileMkdirp(dest, processed);
    } else {
        const map = readJsonFile(src);
        map.file = map.file.replace(/\.js$/, '.mjs');
        writeJsonFileMkdirp(dest, map, 0);
    }
});
