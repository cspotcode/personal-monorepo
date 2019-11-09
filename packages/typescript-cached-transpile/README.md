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

Caching requires, and will *only* work, when the following requirements are met:

* no transformers
* no diagnostics returned by the compiler
* compiler version is the same
* filename is the same
* source code is the same
* config object is the same, as determined by serializing to JSON and sha1 hashing
* using `transpileModule`.  Won't work if you're type-checking.  (do that separately, e.g. `tsc --noEmit`)
