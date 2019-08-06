#!/usr/bin/env node

'use strict';

import Liftoff from 'liftoff';
// import args = process.argv.slice(2);
import minimist from 'minimist';
// import argv = plopRequire('minimist')(args);
import v8flags from 'v8flags';
import interpret from 'interpret';
import chalk from 'chalk';
import ora from 'ora';
import Path from 'path';

import nodePlop from 'node-plop';
import out from './console-out';
import {combineBypassData} from './bypass';
import {getBypassAndGenerator, handleArgFlags} from './input-processing';
import findup from 'find-up';
import yargs from 'yargs';
import assert from 'assert';

export type TODO = any;

/** Subset of our options that can come straight from minimist or yargs parsing an argv array */
export interface ArgvOptions {
	/** Path to the plopfile to run */
	config: string;
	/** root output path to emit plopped stuff */
	destBasePath?: string;
	/**
	 * Array of remaining positional arguments passed to the plopfile (anything not specified by other properties here)
	 * Usage is something like: my-plop-driven-tool --force -- --name foo --value bar
	 * Value would be ['--name', 'foo', '--value', 'bar']
	 */
	_?: string[];
	force?: boolean;
	help?: boolean;
	require?: string[],
	completion?: boolean;
	version?: boolean;
	init?: boolean;
	'show-type-names'?: boolean;
}

export interface Options extends ArgvOptions {
	cwd?: string;
	/** If specified, fill findup for a file or directory of the given name, and use parent directory as the destBasePath */
	findDestBasePath?: string | undefined;
	logAndExitOnFailure?: boolean;
}

export type FullOptions = Required<Pick<Options, Exclude<keyof Options, 'findDestBasePath'>>> & Pick<Options, 'findDestBasePath'>;

/** @internal */
export function getArgv(args: string[]) {
	return minimist(args);
}

/** Option declarations for yargs */
export const yargsOptionDefinitions = {
	force: T<yargs.Options>({type: 'boolean', alias: 'f'}),
	completion: T<yargs.Options>({type: 'boolean'}),
	require: T<yargs.Options>({type: 'array'}),
	// args: T<yargs.Options>({type: 'array'},
	destBasePath: T<yargs.Options>({type: 'string'}),
	version: T<yargs.Options>({type: 'boolean'}),
	'show-type-names': T<yargs.Options>({type: 'boolean', alias: 't'}),
	help: T<yargs.Options>({type: 'boolean', alias: 'h'}),
	init: T<yargs.Options>({type: 'boolean', alias: 'i'}),
};
export function declareYargsOptions(yargs: yargs.Argv, optionNames: Array<keyof typeof yargsOptionDefinitions>) {
	for(const option of optionNames) {
		yargs.options({[option]: yargsOptionDefinitions[option]});
	}
}
function T<T>(a: T): T {return a}

export function executePlopFile(_opts: Options) {
    const {
		findDestBasePath = undefined,
		cwd = process.cwd(),
		config,
		destBasePath = findDestBasePath ? Path.dirname(findup.sync(findDestBasePath)!) : cwd,
		_ = [],
		force = false,
		require = [],
		completion = false,
		"show-type-names": showTypeNames = false,
		help = false,
		version = false, 
		init = false,
		logAndExitOnFailure = false
	} = _opts;
	const opts: FullOptions = {findDestBasePath, cwd, config, destBasePath, _, force, require, completion, 'show-type-names': showTypeNames, help, version, init, logAndExitOnFailure};
	const argv = opts;
	const Plop = new Liftoff({
		name: 'plop',
		extensions: interpret.jsVariants,
		v8flags
	});
	// TODO prevent this from launching an external process.  We want this to return async
	Plop.launch({
		cwd,
		configPath: config,
		require,
		completion: completion as unknown as string, // liftoff's declarations are wrong
	}, async (env) => {
		try {
			const plopfilePath = env.configPath;

			// handle basic argument flags like --help, --version, etc
			handleArgFlags(env, {argv});

			assert(plopfilePath);

			// set the default base path to the plopfile directory
			const plop = nodePlop(plopfilePath!, {
				force
			} as TODO);

			const generators = plop.getGeneratorList();
			const generatorNames = generators.map(v => v.name);
			const {generatorName, bypassArr, plopArgV} = getBypassAndGenerator(plop, {argv});

			// look up a generator and run it with calculated bypass data
			const runGeneratorByName = async (name: string) => {
				const generator = plop.getGenerator(name);
				const bypassData = combineBypassData(generator, bypassArr, plopArgV);
				return await doThePlop(generator, bypassData);
			};

			// hmmmm, couldn't identify a generator in the user's input
			if (!generators.length) {
				// no generators?! there's clearly something wrong here
				throw new FailProcessError('No generator found in plopfile');
			} else if (!generatorName && generators.length === 1) {
				// only one generator in this plopfile... let's assume they
				// want to run that one!
				await runGeneratorByName(generatorNames[0]);
			} else if (!generatorName && generators.length > 1 && !bypassArr.length) {
				// more than one generator? we'll have to ask the user which
				// one they want to run.
				try {
					const a = await out.chooseOptionFromList(generators, plop.getWelcomeMessage());
					await runGeneratorByName(a);
				} catch (err) {
					throw new FailProcessError('Something went wrong with selecting a generator\n' + err);
				}
			} else if (generatorNames.includes(generatorName)) {
				// we have found the generator, run it!
				await runGeneratorByName(generatorName);
			} else {
				// we just can't make sense of your input... sorry :-(
				const fuzyGenName = (generatorName + ' ' + argv._.join(' ')).trim();
				throw new FailProcessError('Could not find a generator for "' + fuzyGenName + '"');
			}
		} catch(e) {
			if(logAndExitOnFailure && e instanceof FailProcessError) {
				e.logAndTerminate();
			} else if(!(e instanceof SuccessfulEarlyTermination)) {
				throw e;
			}
		}
	});

	/////
	// everybody to the plop!
	//
	async function doThePlop(generator: TODO, bypassArr: Array<string>) {
		try {
			const answers = await generator.runPrompts(bypassArr);
			const noMap = (argv['show-type-names']);
			const progress = ora();
			const onComment = (msg: string) => {
				progress.info(msg); progress.start();
			};
			const onSuccess = (change: {path: TODO, type: TODO}) => {
				let line = '';
				if (change.type) { line += ` ${out.typeMap(change.type, noMap)}`; }
				if (change.path) { line += ` ${change.path}`; }
				progress.succeed(line); progress.start();
			};
			const onFailure = (fail: {type: TODO, path: TODO, error: TODO, message: TODO}) => {
				let line = '';
				if (fail.type) { line += ` ${out.typeMap(fail.type, noMap)}`; }
				if (fail.path) { line += ` ${fail.path}`; }
				const errMsg = fail.error || fail.message;
				if (errMsg) { line += ` ${errMsg}` };
				progress.fail(line); progress.start();
			};
			progress.start();
			await generator.runActions(answers, {onSuccess, onFailure, onComment});
			return progress.stop();
		} catch (err) {
			throw new FailProcessError(err.message, 'ERROR');
		}
	}
}

interface CustomErrorCtor {
	new (message?: string): CustomError;
}
interface CustomError extends Error {}
const CustomError = function(this: CustomError, message: string) {
	Error.call(this, message);
	Error.captureStackTrace(this);
  
	this.message = message;
	Object.defineProperty(this, 'name', {
		value: this.constructor.name
	});
} as any as CustomErrorCtor;
CustomError.prototype = Object.create(Error.prototype);
/**
 * Thrown when the process would have been terminated with an error message.
 * You can catch these, log the message to stderr, and then process.exit(1)
 */
export class FailProcessError extends CustomError {
	constructor(message: string, public readonly type: string = 'PLOP') {
		super(message);
	}
	log() {
		console.error(this.getLogString());
	}
	getLogString() {
		return chalk.red(`[${this.type}]`), this.message;
	}
	/** Logs the error message and terminates the process with exit code 1 */
	logAndTerminate() {
		this.log();
		process.exit(1);
	}
}
export class FailProcessAggregatedErrors extends FailProcessError {
	constructor(public readonly errors: ReadonlyArray<FailProcessError>, public readonly suffixMessage: string | undefined = undefined) {
		super('Multiple errors');
	}
	getLogString() {
		return [...this.errors.map(e => e.getLogString()), this.suffixMessage].filter(v => v != null).join('\n');
	}
	get message() {return this.getLogString();}
}
export class SuccessfulEarlyTermination extends CustomError {}
