Write shebangs that pass flags and environment variables.

# Quick example

```
#!/usr/bin/env env2
//#!ts-node --transpile-only

// This is a TypeScript file
const a = 123;
// ...
```

The first line is always the same.  The second line reads like a
bash command.  You can pass flags and set environment variables.

```
#!/usr/bin/env env2
//#!ts-node --transpile-only

```

Two styles of shebang are supported for the second line: `#!` and `//#!`.
The latter is meant to support languages that don't use `#` as a comment delimiter.
For example, node will strip a shebang from the first line but not the second, so
the second line must be a valid JavaScript comment.
Please open an issue if you need support for a third comment syntax.

# Why is this necessary?

Shebangs need to use `/usr/bin/env` to locate the target executable on your `$PATH`.
Shebangs can only pass a single argument to the target executable.  This is a Linux kernel limitation.

If we try to do the following:

```
#!/usr/bin/env foo --bar
```

...the Linux kernel invokes `/usr/bin/env "foo --bar"`
`env` tries and fails to find an executable named `foo --bar`.

## Can't I just write a wrapper bash script?

You can't reference your wrapper script from a shebang unless it's on your `$PATH`.
Depending on your project, it might not be convenient to modify your PATH.

# The solution

This package implements an executable called `env2` which is like `env` but
runs a fancier shebang from line 2.

For example, if we write a script "hello":

```
#!/usr/bin/env env2
#!FEATURE_FLAG=enable interpreter --another-flag
```

When we run the following script named `./hello`:

```
#!/usr/bin/env env2
#!FEATURE_FLAG=enable interpreter --another-flag
```

* A. Linux runs `/usr/bin/env env2 ./hello`
* B. `env2` parses the second line of "./hello"
* C. `env2` runs `interpreter --another-flag ./hello` and passes it environment variable `FEATURE_FLAG` set to `enable`

