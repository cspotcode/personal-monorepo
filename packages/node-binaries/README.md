Experiment to publish node CLI tools via npm, but without worrying about supporting a range of node versions.
We do this by bundling a copy of the node binary for each platform.
Even if a user is running node 10, we bundle node 12, so your CLI tool is free to use node 12 features.

A postinstall script sets up a symlink to the correct node binary.  This is on the path as `node-binary`, not to be
confused with `node` which will still be the host system's node binary.

If you want your own binaries to also use this bundled node binary, we offer a function to generate a bootstrapper.

*NOTE does not support Windows.  This is theoretically easy to add, but I don't have an immediate need for it.*

## API

- When loaded as a node module, exposes functions to get node binary path, create symlinks, and create bootstrappers.
- `node-binary` executable: symlink to the bundled `node` binary.
- `node-binary-path` executable: outputs the path to bundled `node` executable for your platform.

## Example

You want to publish a node CLI tool, `my-cli`, that uses the bundled node binary, avoiding the system node binary.

In your `package.json`:

```
  "bin": {
      "my-cli" "./my-cli"
  }
```

`my-cli`
```
#!/usr/bin/env node
require('node-binaries').replaceWithBootstrapperAndInvoke(__filename, './my-cli.js');
```

`my-cli.js` is the entry-point for your CLI tool.

The first time a user runs `my-cli`, it will be replaced with a bootstrapper `.sh` that contains
hardcoded 

*NOTE: this will fail if the module was installed as root and then invoked as a regular user.
If that's the case, you'll need to create the bootstrapper in a `postinstall` script.*
