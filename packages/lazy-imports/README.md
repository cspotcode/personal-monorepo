Enable lazy-loading of dependencies while still using normal `import` syntax.  Supports TypeScript's downlevel compilation.

I created this to enable lazy-loading of dependencies in a CLI tool.  The benefits are really fast start-up and
responsiveness of simple commands like `--help`, while other dependencies are loaded only on-demand when a user runs a
command that needs them.

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

The return value from a lazy `require()` will be a 

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
