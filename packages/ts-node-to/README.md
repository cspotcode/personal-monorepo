This is a binary that behaves like `ts-node` with `--transpile-only` enabled by default.

*Note: you must manually install ts-node as a dependency.  This package does not declare it as a dependency.*

Shebangs don't let you specify environment variables or CLI parameters, which means there's no
easy way to write executable scripts for `ts-node --transpile-only` without requiring the caller
to set an environment variable.

On some projects, it's desirable to write some files as .ts.  This pairs well with ts-node.  However,
prevent code from running when there are compiler errors is often annoying, which is why I always
use `--transpile-only`.  I think it's also a bit faster.

This is a 2-line JS wrapper around ts-node's CLI entrypoint.  Add it as a (dev) dependency of your project
and use this shebang in your scripts:

```
#!/usr/bin/env ts-node-to
```

# Questions?  Bugs?

Please open a GitHub issue: https://github.com/cspotcode/personal-monorepo/issues
