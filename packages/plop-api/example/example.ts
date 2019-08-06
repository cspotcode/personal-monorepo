import {executePlopFile} from '..';
import Path from 'path';

async function main() {
    await executePlopFile({
        config: require.resolve('./my-bundled-plopfile.js'),
        destBasePath: Path.join(__dirname, 'output'),
        // Use an argument parser to extract _.
        // If you're using yargs, just pass the _ array or specify a positional
        // argument to capture all trailing positionals.
        _: require('minimist')(process.argv.slice(2))._,
        logAndExitOnFailure: true
    });
}
main();