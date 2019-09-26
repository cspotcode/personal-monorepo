const Path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const shellQuote = require('shell-quote');

exports.getNodeBinaryPath = getNodeBinaryPath;
exports.getExtension = getExtension;
exports.invoke = invoke;
exports.replaceWithSymlinkAndInvoke = replaceWithSymlinkAndInvoke;
exports.replaceWithSymlink = replaceWithSymlink;
exports.replaceWithBootstrapperAndInvoke = replaceWithBootstrapperAndInvoke;
exports.replaceWithBootstrapper = replaceWithBootstrapper;

function getNodeBinaryPath() {
    return Path.join(__dirname, 'binaries', `node-${ process.platform }-${ process.arch }${ getExtension() }`);
}

function getExtension() {
    if(process.platform === 'win32') return '.exe';
    return '';
}

function invoke(path) {
    const r = child_process.spawnSync(path, process.execArgv, {
        stdio: 'inherit',
    });
    if(typeof r.status === 'number') process.exit(r.status);
}

function replaceWithSymlinkAndInvoke(path) {
    replaceWithSymlink(path);
    invoke(path);
}

function replaceWithSymlink(path) {
    const target = getNodeBinaryPath();
    const targetRelative = Path.relative(Path.dirname(path), target);
    fs.unlinkSync(path);
    fs.symlinkSync(targetRelative, path, 'file');
}

function replaceWithBootstrapperAndInvoke(bootstrapper, target) {
    replaceWithBootstrapper(bootstrapper, target);
    invoke(bootstrapper);
}

function replaceWithBootstrapper(bootstrapperPath, targetPath) {
    const absNodePath = Path.normalize(Path.resolve(getNodeBinaryPath()));
    const absTargetPath = Path.normalize(Path.resolve(Path.join(bootstrapperPath, '..', targetPath)));
    const bootstrapperSrc =
        `#!/usr/bin/env sh` +
        `${ shellQuote.quote([absNodePath, absTargetPath]) } "$@"` +
        `exit $?` +
        ``;
    fs.writeFileSync(bootstrapperPath, bootstrapperSrc);
    // chmod +x
    const stat = fs.statSync(bootstrapperPath);
    fs.chmodSync(bootstrapperPath, stat.mode | 0o111);
}
