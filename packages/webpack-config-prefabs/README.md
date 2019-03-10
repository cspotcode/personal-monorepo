# webpack-config-prefabs

Using webpack shouldn't require fiddling with configuration flags for every project.  This
library exposes factory functions that create sensible, default webpack configurations
for different situations.

They have a few built-in options to tweak the configuration.  If
you have more advanced needs, you can modify the returned configuration.
It is, after all, just an object.

## Example

To bundle a node module or CLI tool, perhaps to reduce download size or increase startup speed,
write a `webpack.config.js` that looks like this:

```javascript
const {nodeLibrary} = require('webpack-config-prefabs');
module.exports = nodeLibrary(module, {
    entry: './src/index.js',
    outputFilepath: './dist/index.js',
});
```

*`module` is passed so that we can discover the root directory of your project, which
allows us to generate more defaults automatically.*
