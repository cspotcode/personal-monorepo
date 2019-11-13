Write shebangs that pass flags and environment variables.

*Note: the current implementation is in Posix shell, so it works on Mac, Linux, and Windows Subsystem for Linux.  I have tentative plans to rewrite in Rust to support Windows natively.*

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

# env2rc: convention-based shebangs

`env2rc` is also provided by this package.  Instead of reading the shebang from line 2 of the script, it reads it
from one or more `.env2rc` files in any containing directory.  `.env2rc` maps from glob patterns to shebang
commands.  You can set complex shebang commands in your project's root `.env2rc` and use a relatively simple
shebang line in your scripts.

For example, to use `ts-node` with a custom compiler and in transpile-only mode, your `.env2rc` looks like this:

```
# Comments are allowed
**.ts=$root/node_modules/.bin/ts-node --transpile-only --compiler=typescript-cached-transpile
```

Everything before the equals sign is a glob pattern.  (uses bash's default globbing behavior, since env2rc is a bash script)
Everything after the equals sign is the shebang command to run.

`$root` refers to the directory containing the `.env2rc` file and can be used to run project-local executables,
for example anything installed in `node_modules` or stored in a local `bin` directory.

The glob pattern is matched against either:
a) the script's path relative to the `.env2rc` file's parent directory.
b) the second shebang line, if the script specifies a shebang line like for `env2`

For example, the following files will be matched as described in the comments:

### `/home/my-project/.env2rc`
```
# Run python utilities using python3
/utils/**.py=python3
# Run appropriately tagged scripts via ts-node
tsrun=$root/node_modules/.bin/ts-node --transpile-only --compiler=typescript-cached-transpile
```

### `/home/my-project/utils/my-python-script`
```
#!/usr/bin/env env2rc
# this is python code
# Globs in .env2rc will be matched against the string `/utils/my-python-script`
```

### `/home/my-project/utils/my-typescript-script`
```
#!/usr/bin/env env2rc
//#!tsrun
// This is typescript code
// Globs in .env2rc will be matched against the string `tsrun`
```

If you have multiple `.env2rc` files they will be checked in ascending order.  You can keep an `.env2rc` in the root of a project's git repository and another in `$HOME` for personal conventions.  (remember shebangs can't use shell aliases)  The first matching glob is used.
