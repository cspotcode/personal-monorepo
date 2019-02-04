Advanced hooks into Node's module loading behavior.  These are *not* the same as `require.extensions` hooks.

At the moment, the only hook is a dependency tracker.  I may add more in the future.

See also: This helpful blog post. https://tech.wayfair.com/2018/06/custom-module-loading-in-a-node-js-environment/

# Usage

For now, this library is bundled with type declarations.  Use a modern editor and follow the tooltips, or read the source.

In general, a given hook must be installed before use.  It will probably incur a small performance penalty while
installed.

# Components

## Dependency tracker

This intercepts all requests from any module to resolve the location of another, building a dependency
graph of modules.  This can be used, for example, to intelligently reload or re-execute a command
based on when its code -- including transitively-require()d files -- changes.
