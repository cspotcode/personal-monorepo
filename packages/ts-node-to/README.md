This is a binary that behaves like `ts-node` with `--transpile-only` enabled by default.  Use it in shebangs:

```
#!/usr/bin/env ts-node-to
```
or the more explicit alias:
```
#!/usr/bin/env ts-node-transpile-only
```

*Note: you must manually install ts-node as a dependency.  This package does not declare it as a dependency.*

# Why?

Shebangs don't let you specify environment variables or CLI parameters, which means there's no
easy way to write executable scripts for `ts-node --transpile-only` without requiring the caller
to set an environment variable.  (`#!/usr/bin/env ts-node --transpile-only` does not work on Linux; only Mac)

On some projects, it's desirable to write some files as .ts.  This pairs well with ts-node.  However,
it's annoying when it prevents code from running with compiler errors, which is why I always
use `--transpile-only`.  It's also faster to skip the typechecker.

This is a 2-line JS wrapper around ts-node's CLI entrypoint.  Add it as a (dev) dependency of your project
and use this shebang in your scripts:

```
#!/usr/bin/env ts-node-to
```

Or, if you prefer a more explicit name:

```
#!/usr/bin/env ts-node-transpile-only
```

# Questions?  Bugs?

Please open a GitHub issue: https://github.com/cspotcode/personal-monorepo/issues
