# typescript-cached-transpile

[![npm version](https://badge.fury.io/js/typescript-cached-transpile.svg)](https://badge.fury.io/js/typescript-cached-transpile)

Monkey-patches the TypeScript compiler to use a disk cache for `transpileModule`.

Intended for use solely with ts-node in `transpileOnly` mode.  It'll make things
faster.

```bash
TS_NODE_TRANSPILE_ONLY=true TS_NODE_COMPILER=typescript-cached-transpile ts-node ./src/index.ts
```

When required, it returns a monkey-patched version of the peer `typescript` module.
The only change is the `transpileModule` function.  It will cache results on disk,
so subsequent invocations should be much faster.

Caching requires, and will *only* work, when the following requirements are met.
If these requirements are not met, caching will be silently skipped.  If you
wonder why your builds aren't getting faster, you might be violating these
requirements.

* no transformers
* no diagnostics returned by the compiler
* compiler version is the same
* filename is the same
* source code is the same
* sourcemaps are enabled
* config object is the same, as determined by serializing to JSON and sha1 hashing
* using `transpileModule`.  Won't work if you're type-checking.  (do that separately, e.g. `tsc --noEmit`)

If you need to programmatically customize the behavior, put your customizations
in a JS file:

```javascript
./my-cached-compiler.js
const {create} = require('typescript-cached-transpile');
module.exports = create({
    /* options here */
});
```

...and pass the absolute path to that file as ts-node's `compiler` option.

```bash
TS_NODE_TRANSPILE_ONLY=true TS_NODE_COMPILER=$PWD/my-cached-compiler.js ts-node ./src/index.ts
```

The cache directory can be set via environment variable `TS_CACHED_TRANSPILE_CACHE`.
It should be an absolute path to avoid gotchas.

```bash
TS_NODE_TRANSPILE_ONLY=true TS_CACHED_TRANSPILE_CACHE=$PWD/.cache ts-node ./src/index.ts
```

## Portable / pre-compiled cache

Filenames are included in the cache keys.  Normally these are absolute.  If you want
to bundle a pre-generated cache with your code, the cache will need to use relative
paths instead.  Set env var `TS_CACHED_TRANSPILE_PORTABLE` to `true` to enable this
behavior.
