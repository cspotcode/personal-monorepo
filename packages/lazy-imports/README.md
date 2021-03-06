# lazy-imports

Enable lazy-loading of dependencies while using normal `import` syntax, without a bundler.  Supports TypeScript's downlevel compilation.

I created this to boost the performance of a CLI tool.  If the user runs `cli-tool --help` they should see usage info
very quickly without loading, for example, the `aws-sdk`.  If they run `cli-tool upload-report-to-s3` then it should load *only* the 
dependencies used for that subcommand.  I wanted to accomplish this lazy-loading without sprinkling our codebase with
manual, delayed `require()` or `import()` calls.

## Example

For TS support, you *must* have `importHelpers` enabled, since we monkey-patch `'tslib'`.

```typescript
import 'lazy-imports/enable';
import {parseCliArgs} from './cli-parser';
import {foo, bar} from 'some-expensive-module';
require('lazy-imports/disable'); // <-- as a function call so that autogenerated import statements will appear *above* it.
                                 //     Write as an `import` if you do not want this behavior.

const args = parseCliArgs(); // <-- this should be really fast without loading the expensive module

if(args.doExpensiveOperation) {
    foo(); // <-- first usage will trigger require()ing of the expensive module
    bar();
}
```

## Caveats and Gotchas

I don't know what will happen if you leave lazy-imports enabled *after* your
import statements.  I always disable it.

The return value from a lazy `require()` will be a Proxy object pretending to be
a function.  Typically this covers all the bases: if the module is a function or
constructor, you can invoke it, and if it's an object, you can access properties
of it.  This might break if the module does something atypical like
`module.exports = 'a string';`

## How it works

We replace `require('module')._load` with a version that returns lazy Proxy objects.
We also replace `require('tslib').__importStar` and `.__importDefault` since TypeScript
generates code that looks like
`const some_import_1 = __importStar(require('some-expensive-module'));` which would otherwise
immediately trigger eager loading.

`lazy-imports/{enable|disable}` immediately remove themselves from require cache,
so each time you import them, they execute and enable / disable lazy loading.
This is necessary because import statements are hoisted above all other statements,
so our enable / disable logic must be in the form of import statements.
We can't, for example, do `enableLazyLoading()`.

## TODOs

Allow automatically enabling laziness across an entire codebase, without enabling and disabling in each file.
For example, pass a root directory, and any imports performed by files under that directory
will be automatically lazy-imported.  This allows us to apply lazy-loading to our own codebase and skip it
for external codebases.
* could use globs, but that's more runtime weight; potentially slows things down
* trick is enabling at the top of our entry-point file.  We'll still need to use the `import` trick there

```
#!/usr/bin/env node
// entry point file
import 'lazy-imports/enable';
//... imports ...
require('lazy-imports/disable');
require('lazy-imports').enableForPrefix(`${ __dirname }/`);
```

---

Needing to manually enable and disable in every file is annoying and problematic.  If you forget to do this in even one file, it might trigger expensive loading of dependencies that kinda defeats the whole purpose of doing this.

There should be an alternative API so you can configure a glob pattern or subdirectory of code that will have laziness applied automatically.  So you can call `automaticallyLazy(__dirname)` *once* in your entrypoint and then all files in your module's `src` directory will have lazy imports.

The existing `lazy-imports/{enable,disable}` API should be modified for compatibility:

`import 'lazy-imports/enable';` *forces* lazyness, ignoring whatever you may have configured via `automaticallyLazy`
`import 'lazy-imports/disable';` *force* lazyness to be *disabled*, ignoring whatever you may have configured via `automaticallyLazy`
`require('lazy-imports/auto');` goes back to automatic behavior, so that `automaticallyLazy` behavior is followed.
