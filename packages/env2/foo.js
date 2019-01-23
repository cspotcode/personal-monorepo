const child_process = require('child_process');
const crossSpawn = require('cross-spawn');

// See http://www.robvanderwoude.com/escapechars.php
const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
function escapeMetaChars(arg) {
    return arg.replace(metaCharsRegExp, '^$1');
}

const argsForTargetExe = ['hi &fo[ob%1%r('];

const prepared = argsForTargetExe.map(v => escapeMetaChars(`"${ v }"`)).join(' ');

child_process.spawnSync('cmd.exe', [
    String.raw `/d /s /c ".\foo.bat ${ prepared }"`
], {
    stdio: 'inherit',
    // No quoting or escaping of arguments is done on Windows
    windowsVerbatimArguments: true
});
console.log('-------------------');
crossSpawn.sync('./foo.bat', argsForTargetExe, {
    stdio: 'inherit'
});
