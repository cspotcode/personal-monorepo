import { SuccessfulEarlyTermination, FailProcessError, ArgvOptions, FullOptions } from './plop';

const chalk = require('chalk');
const minimist = require('minimist');
import out from './console-out';
const globalPkg = require('../package.json');
// const args = process.argv.slice(2);
// const argv = minimist(args);

/**
 * Parses the user input to identify the generator to run and any bypass data
 * @param plop - The plop context
 */
export function getBypassAndGenerator(plop, {argv}: {argv: FullOptions}) {
	// See if there are args to pass to generator

	// const args = argv._;
	const args = argv._;

	// We assume *all* of the args came *after* a double-hyphen, handled externally to this function.
	const argsBeforeDoubleHyphen = [];
	const argsAfterDoubleHyphen = args;

	// If we were *not* assuming, we'd using the following 3 lines
	// const doubleHyphenIndex = args.indexOf('--');
	// const argsBeforeDoubleHyphen = doubleHyphenIndex >= 0 ? args.slice(0, doubleHyphenIndex) : args;
	// const argsAfterDoubleHyphen =  doubleHyphenIndex >= 0 ? args.slice(doubleHyphenIndex + 1) : [];

	const plopArgV = minimist(argsAfterDoubleHyphen);
	const positionalArgs = [...argsBeforeDoubleHyphen, ...plopArgV._];

	// TODO we should be passing args to the API, extracted by yargs, so this check should not be necessary.

	// TODO what is this used for?  Should it really be parsed object of everything after `--`

  // locate the generator name based on input and take the rest of the
	// user's input as prompt bypass data to be passed into the generator
	let generatorName = '';
	let bypassArr: Array<string | undefined> = [];

	const generatorNames = plop.getGeneratorList().map(v => v.name);
	for (let i=0; i < positionalArgs.length; i++) {
		const arg = positionalArgs[i];
		const nameTest = (generatorName.length ? generatorName + ' ' : '') + arg;
		if (listHasOptionThatStartsWith(generatorNames, nameTest)) {
			generatorName = nameTest;
		} else {
			// Force `'_'` to become undefined in nameless bypassArr
			bypassArr = positionalArgs.slice(i).map(arg => (/^_+$/).test(arg) ? undefined : arg);
			break;
		}
	}

  return {generatorName, bypassArr, plopArgV};
}

function listHasOptionThatStartsWith(list, prefix) {
	return list.some(function (txt) {
		return txt.indexOf(prefix) === 0;
	});
}

/**
 * Handles all basic argument flags
 * @param env - Values parsed by Liftoff
 */
export function handleArgFlags(env, {argv}: {argv: FullOptions}) {
	// Make sure that we're not overwritting `help`, `init,` or `version` args in generators
	if (argv._.length === 0) {
		// handle request for usage and options
		if (argv.help) {
			out.displayHelpScreen();
			throw new SuccessfulEarlyTermination();
		}

		// handle request for initializing a new plopfile
		if (argv.init) {
			return out.createInitPlopfile(env.cwd, function (err) {
				if (err) {
					throw new FailProcessError(err);
				}
				throw new SuccessfulEarlyTermination();
			});
		}

		// handle request for version number
		if (argv.version) {

			const localVersion = env.modulePackage.version;
			if (localVersion !== globalPkg.version && localVersion != null) {
				console.log(chalk.yellow('CLI version'), globalPkg.version);
				console.log(chalk.yellow('Local version'), localVersion);
			} else {
				console.log(globalPkg.version);
			}
			throw new SuccessfulEarlyTermination();
		}
	}

	// abort if there's no plopfile found
	if (env.configPath == null) {
		throw new FailProcessError('No plopfile found\n' + out.getHelpScreen());
	}
}
