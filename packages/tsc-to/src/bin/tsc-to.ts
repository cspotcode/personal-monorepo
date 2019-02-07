#!/usr/bin/env node

// byots is no longer required; leaving this for convenience
// import __ts from 'typescript';
// const ts = __ts as any as typeof __byots;
// import __byots from 'byots';

import ts from 'typescript';
import { TypeScriptService } from '@ts-tools/service';
import fs from 'fs';
import Path from 'path';

export function main() {
    const service = new TypeScriptService();
    // HACK: trigger tsconfig discovery and parsing
    const result = service.transpileFile(`DOES NOT EXIST${ Math.random() }.ts`, {

        getCompilerOptions(baseHost, tsconfigOptions) {
            // Hacky type assertions because byots compilerOptions and normal compilerOptions are incompatible.
            return neuterCompilerOptions({ ...tsconfigOptions as ts.CompilerOptions }) as any;
        }
    });
    const runningService = service.runningServices.get('tsconfig.json')!;
    const baseHost = runningService.baseHost;
    const languageService = runningService.languageService as any as ts.LanguageService;
    const program = languageService.getProgram()!;
    const compilerOptions = program.getCompilerOptions();

    // Simple memoized mechanism to create directories that don't exist.
    const createdDirectories = new Set<string>();
    function ensureDirectoryExists(path: string) {
        if(createdDirectories.has(path)) return true;
        const parent = Path.dirname(path);
        if(parent !== path) ensureDirectoryExists(parent);
        try {
            fs.mkdirSync(path);
        } catch(e) {
            if(!(e.code === 'EEXIST') || !fs.statSync(path).isDirectory()) {
                throw e;
            }
        }
        createdDirectories.add(path);
    }

    const diagnostics = [
        ...program.getSyntacticDiagnostics(),
        ...program.getOptionsDiagnostics()
    ];
    console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, baseHost));
    program.emit(undefined, (path, content) => {
        console.log('Emitting', path);
        ensureDirectoryExists(Path.dirname(path));
        fs.writeFileSync(path, content);
    });
    return diagnostics.length ? 1: 0;
}

/**
 * Copied from the source of ts.transpileModule
 * https://github.com/Microsoft/TypeScript/blob/master/src/services/transpile.ts#L31-L58
 * 
 * These modifications to compiler options preserve transpilation behavior but
 * prevent wasted time on typechecking and loading other source files.
 */
export function neuterCompilerOptions(options: ts.CompilerOptions) {
    options.isolatedModules = true;

    // transpileModule does not write anything to disk so there is no need to verify that there are no conflicts between input and output paths.
    options.suppressOutputPathCheck = true;

    // Filename can be non-ts file.
    options.allowNonTsExtensions = true;

    // We are not returning a sourceFile for lib file when asked by the program,
    // so pass --noLib to avoid reporting a file not found error.
    options.noLib = true;

    // Clear out other settings that would not be used in transpiling this module
    options.lib = undefined;
    options.types = undefined;
    options.noEmit = undefined;
    options.noEmitOnError = undefined;
    options.paths = undefined;
    options.rootDirs = undefined;
    options.declaration = undefined;
    options.composite = undefined;
    options.declarationDir = undefined;
    options.out = undefined;
    options.outFile = undefined;

    // We are not doing a full typecheck, we are not resolving the whole context,
    // so pass --noResolve to avoid reporting missing file errors.
    options.noResolve = true;

    // I added these 2 to prevent the language service from loading any @types:
    options.typeRoots = [];
    options.types = [];
    // Adding this because declaration is nulled above
    options.declarationMap = undefined;

    return options;
}

// copied from https://github.com/Microsoft/TypeScript/blob/865b3e786277233585e1586edba52bf837b61b71/src/services/transpile.ts
// function transpileModules(sourceFiles: ReadonlyArray<ts.SourceFile>, options: ts.CompilerOptions) {
//     if(true) {
//         options.isolatedModules = true;

//         // transpileModule does not write anything to disk so there is no need to verify that there are no conflicts between input and output paths.
//         options.suppressOutputPathCheck = true;

//         // Filename can be non-ts file.
//         options.allowNonTsExtensions = true;

//         // We are not returning a sourceFile for lib file when asked by the program,
//         // so pass --noLib to avoid reporting a file not found error.
//         options.noLib = true;

//         // Clear out other settings that would not be used in transpiling this module
//         options.lib = undefined;
//         options.types = undefined;
//         options.noEmit = undefined;
//         options.noEmitOnError = undefined;
//         options.paths = undefined;
//         options.rootDirs = undefined;
//         options.declaration = undefined;
//         options.composite = undefined;
//         options.declarationDir = undefined;
//         options.out = undefined;
//         options.outFile = undefined;

//         // We are not doing a full typecheck, we are not resolving the whole context,
//         // so pass --noResolve to avoid reporting missing file errors.
//         options.noResolve = true;
//     }

//     const inputFileNames: Array<string> = [];
//     const inputs: Record<string, ts.SourceFile> = Object.create(null);
//     for(const sourceFile of sourceFiles) {
//         const normalized = ts.normalizePath(sourceFile.fileName);
//         inputFileNames.push(normalized);
//         inputs[normalized] = sourceFile;
//     }
//     const outputs: Record<string, string> = Object.create(null);
//     const compilerHost: ts.CompilerHost = {
//         getSourceFile: (fileName) => inputs[fileName],
//         writeFile: (name, text) => {
//             outputs[name] = text;
//             // if (fileExtensionIs(name, ".map")) {
//             //     Debug.assertEqual(sourceMapText, undefined, "Unexpected multiple source map outputs, file:", name);
//             //     sourceMapText = text;
//             // }
//             // else {
//             //     Debug.assertEqual(outputText, undefined, "Unexpected multiple outputs, file:", name);
//             //     outputText = text;
//             // }
//         },
//         getDefaultLibFileName: () => "lib.d.ts",
//         useCaseSensitiveFileNames: () => false,
//         getCanonicalFileName: fileName => fileName,
//         getCurrentDirectory: () => process.cwd(),
//         getNewLine: () => '\n',
//         fileExists: (fileName): boolean => true,/*fileName === inputFileName,*/
//         readFile: () => "",
//         directoryExists: () => true,
//         getDirectories: () => []
//     };

//     const program = ts.createProgram(inputFileNames, options, compilerHost);

//     const diagnostics = program.getSyntacticDiagnostics().concat(program.getOptionsDiagnostics());

//     program.emit(/*targetSourceFile*/ undefined, /*writeFile*/ undefined, /*cancellationToken*/ undefined, /*emitOnlyDtsFiles*/ undefined, undefined/*transpileOptions.transformers*/);

//     return { outputs, program, diagnostics };
// }

if(require.main === module) {
    process.exit(main());
}
