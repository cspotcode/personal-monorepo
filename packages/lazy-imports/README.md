Enable lazy-loading of dependencies while still using normal `import` syntax.  Supports TypeScript's downlevel compilation.

I created this to boost the performance of a CLI tool.  If the user runs `cli-tool --help` they should see usage info
very quickly without loading the `aws-sdk`.  If they `cli-tool upload-report-to-s3` then it should load *only* the 
dependencies used for that subcommand, not others.  I wanted to accomplish this without sprinkling our functions with
manual, delayed `require()` or `import()` calls.

## Example

For TS support, you *must* be using `importHelpers`.

```typescript
import 'lazy-imports/enable';
import {parseCliArgs} from './cli-parser';
import {foo, bar} from 'some-expensive-module';
import 'lazy-imports/disable';

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
