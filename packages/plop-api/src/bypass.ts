const chalk = require('chalk');
import out from './console-out';
import {FailProcessError, FailProcessAggregatedErrors} from './plop';

/**
 * Combine different types of bypass data
 * @param generator - The generator object involved
 * @param {string[]} bypassArr - The array of overwritten properties
 * @param plopArgV - The original args passed to plop without using names
 */
export function combineBypassData(generator, bypassArr, plopArgV) {
	// Get named prompts that are passed to the command line
	const promptNames = generator.prompts.map((prompt) => prompt.name);
	// Check if bypassArr is too long for promptNames
	if (bypassArr.length > promptNames.length) {
		throw new FailProcessError('Too many bypass arguments passed for "' + generator.name + '"\n' + out.getHelpMessage(generator));
	}

	let namedBypassArr = [];
	if (Object.keys(plopArgV).length > 0) {
		// Let's make sure we made no whoopsy-poos (AKA passing incorrect inputs)
		let errors: FailProcessError[] = [];
		Object.keys(plopArgV).forEach((arg) => {
			if (!(promptNames.find((name) => name === arg)) && arg !== '_') {
				errors.push(new FailProcessError('"' + arg + '"' + ' is an invalid argument for "' + generator.name + '"'));
			}
		});
		if (errors.length) {
			throw new FailProcessAggregatedErrors(errors, out.getHelpMessage(generator));
		}
		namedBypassArr = promptNames.map((name) => plopArgV[name] ? plopArgV[name] : undefined);
	}

	// merge the bypass data with named bypass values
	const mergedBypass = mergeArrays(bypassArr, namedBypassArr);
	// clean up `undefined` values
	return mergedBypass.map(v => v === undefined ? '_' : v);
}

function mergeArrays(baseArr, overlay) {
	const length = Math.max(baseArr.length, overlay.length);
	return (new Array(length)).fill(undefined).map(
		(v, i) => overlay[i] !== undefined ? overlay[i] : baseArr[i]
	);
}
