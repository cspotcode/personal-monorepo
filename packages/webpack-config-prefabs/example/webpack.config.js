const {nodeLibrary} = require('./dist');

module.exports = nodeLibrary(module, {
    entry: './findupExample.js',
    outputFilepath: './findupExampleBundle.js',
});
