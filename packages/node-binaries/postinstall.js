const Path = require('path');
require('./index').replaceWithSymlink(Path.join(__dirname, './node-binary'));
