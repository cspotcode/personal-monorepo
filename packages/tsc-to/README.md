TypeScript's command-line compiler `tsc` without type-checking.  Benefits:

- a) Still checks and reports syntax errors.
- a) Exit code indicates syntax errors only; is not affected by type errors.
- b) Faster, since it skips typechecking and doesn't need to parse .d.ts files or perform import resolution.

Lots of TypeScript tools have an option to skip typechecking. ([ts-node](https://github.com/TypeStrong/ts-node),
[ts-loader](https://github.com/TypeStrong/ts-loader), [ts-jest](https://kulshekhar.github.io/ts-jest/), etc)  I'm not aware of one that performs command-line
compilation like `tsc`.

*Note: you must manually install typescript as a dependency.  This package does not declare it as a dependency.*

*See also: [ts-node-to](https://github.com/cspotcode/personal-monorepo/tree/master/packages/ts-node-to)*

# Usage

Run in the root of your project.

```
$ tsc-to
```

If you prefer a more explicit name:

```
$ tsc-transpile-only
```

## Limitations & Behavior

At the moment, this tool does not accept any CLI options.

- CWD is used to discover tsconfig.json.
- Will only compile files referenced in tsconfig.json "includes", "files", and "excludes".  Module resolution is skipped,
so transitive dependencies are not compiled.
- Reports "options" and "syntactic" diagnostics in --pretty mode only.  In the future I would like to add non-pretty and JSON outputs.
- Does not generate .d.ts files.  Typechecking is required for that; use `tsc`.
- Logging is diagnostic and subject to change.  I would like to make it more closely match `tsc`'s behavior in the future.

# Questions or Issues?

File a [Github issue](https://github.com/cspotcode/personal-monorepo/issues?labels=P:tsc-to).
