import {sync as glob} from 'glob';
import {sync as mkdirp} from 'mkdirp';
import {identity, escapeRegExp, uniq, flatten, map} from 'lodash';
import Path from 'path';
import fs from 'fs';
import assert from 'assert';
import __tsNode from 'ts-node';

export class CodeGenApi {
    constructor(opts: {
        configuration: InternalConfiguration;
        absFilename: string;
        renderer: TODO;
        inputExtension: string;
        outputExtension: string;
    }) {
        const {configuration, absFilename, renderer, inputExtension, outputExtension} = opts;
        this.configuration = configuration;
        this.templateFilenameAbs = opts.absFilename;
        this.templateDirnameAbs = Path.dirname(this.templateFilenameAbs);
        this.templateDirname = Path.relative(configuration.rootDir, this.templateDirnameAbs);
        this.templateFilename = Path.relative(configuration.rootDir, this.templateFilenameAbs);
        this.emitFilenameAbs = this.templateFilenameAbs.replace(new RegExp(`${ escapeRegExp(inputExtension) }$`), outputExtension);
        this.emitFilename = Path.relative(configuration.outDir, this.emitFilenameAbs);
        this.templateExtension = inputExtension;
        this.emitExtension = outputExtension;
    }
    private configuration: InternalConfiguration;
    readonly templateFilenameAbs: string;
    /** TODO are these relative to cwd or to rootDir??? */
    readonly templateFilename: string;
    readonly templateDirnameAbs: string;
    readonly templateDirname: string;
    readonly templateExtension: string;
    private _templateSourceText: string | undefined;
    get templateSourceText() {
        if(!this._templateSourceText) {
            this._templateSourceText = fs.readFileSync(this.templateFilenameAbs, 'utf8');
        }
        return this._templateSourceText;
    }
    readonly emitFilename: string;
    readonly emitFilenameAbs: string;
    readonly emitExtension: string;
    emit(filename: string | null, content: string | Buffer) {
        if(filename == null) {
            filename = this.emitFilenameAbs;
        }
        if(!Path.isAbsolute(filename)) {
            filename = Path.join(this.templateDirnameAbs, filename);
        }
        console.log(`Emitting: ${ Path.relative(this.configuration.cwdAbs, filename) }`);
        mkdirp(Path.dirname(filename));
        fs.writeFileSync(filename, content);
    }
}

/**
 * The default export from your template .ts or .js files
 * should be a function that 
 */
export type TemplateDefaultExport = (api: CodeGenApi) => string | void;

export type Renderer = (api: CodeGenApi) => void;

/** TODO turn this into an interface */
export type Configuration = typeof defaultConfiguration;
interface InternalConfiguration extends Configuration {
    rootDirAbs: string;
    outDirAbs: string;
    cwdAbs: string;
}

const defaultConfiguration = {
    cwd: process.cwd(),
    rootDir: 'src',
    outDir: 'src',
    include: ["src/**"],
    exclude: new Array<string>(),
    /** Modules to preload TODO implement */
    require: [] as string | Array<string>,
    extensions: {
        '.generate.ts': ['typescript', '.ts']
    } as Record<string, [string, string]>,
    renderers: {
        typescript: (api: CodeGenApi) => {

            // TODO Load ts-node on-demand
            // TODO read settings from tsconfig
            (require('ts-node') as typeof __tsNode).register({
                transpileOnly: true
            });

            const exports = require(api.templateFilenameAbs);
            let fn;
            if(exports && typeof exports.default === 'function') {
                fn = (...args: any[]) => exports.default(...args);
            } else {
                fn = exports;
                assert(typeof fn === 'function');
            }
            const returnValue = fn(api);
            if(typeof returnValue === 'string') {
                api.emit(api.emitFilenameAbs, returnValue);
            }
        }
    } as Record<string, Renderer>
};

function main(): number {
    // TODO this should be the path of the config file
    const cwdAbs = Path.resolve(process.cwd(), defaultConfiguration.cwd);
    const {rootDir, outDir} = defaultConfiguration;
    const configuration: InternalConfiguration = {
        ...defaultConfiguration,
        cwdAbs,
        rootDirAbs: Path.resolve(cwdAbs, rootDir),
        outDirAbs: Path.resolve(cwdAbs, outDir),
    };

    const inputExtensions = Object.keys(configuration.extensions);

    const matches = uniq(flatten(map(configuration.include, i => {
        return glob(i, {
            absolute: true,
            cwd: cwdAbs,
            dot: true,
            ignore: configuration.exclude,
            nodir: true
        });
    }))).map(v => {
        // Filter by files that match an extension we care about
        for(const ext of inputExtensions) {
            if(v.slice(-ext.length) === ext) {
                return {
                    file: v,
                    extension: ext
                };
            }
        }
        return undefined;
    }).filter(identity);

    for(const match of matches) {
        const {extension, file} = match!;
        const [rendererName, outputExtension] = configuration.extensions[extension];
        const renderer = configuration.renderers[rendererName];
        const api = new CodeGenApi({
            absFilename: file,
            inputExtension: extension,
            configuration,
            outputExtension: outputExtension,
            renderer,
        });
        console.log(`Rendering: ${ Path.relative(configuration.cwdAbs, api.templateFilenameAbs) }`);
        renderer(api);
    }

    return 0;
}

export function start(isCliInvocation: boolean) {
    if(isCliInvocation) {
        process.exit(main());
    }
}
