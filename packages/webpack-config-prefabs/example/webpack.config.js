/// <reference types="node" />
const {nodeLibrary} = require('../dist');

module.exports = nodeLibrary(module, {
    outputFilepath: './bundle.js',
    minimize: false
});
