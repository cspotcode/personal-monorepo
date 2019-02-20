import Path from "path";
import * as TJS from "typescript-json-schema";
import * as ts from 'typescript';
import {sync as globSync} from "glob";

///////////////////////////////

// USAGE: add @emitJsonSchema to an interface, and a schema will be extracted.

/**
 * This is a Foo.  DESCRIPTION GOES HERE
 * @emitJsonSchema
 */
export interface Foo {
    /** @errorMessage You must specify a `bar` value!! */
    bar: string;
}

/**
 * @emitJsonSchema
 */
export interface Bar {
    bar: string;
}

/**
 * Do *not* emit a schema for this one.
 */
export interface Baz {
    bar: string;
}

///////////////////////////////

/* SAMPLE OUTPUT OF THIS SCRIPT

Found type: "/c/Users/abradley/Documents/Personal-dev/@cspotcode/personal-monorepo/packages/typescript-json-schema-extractor/src/index".Foo                               
Found type: "/c/Users/abradley/Documents/Personal-dev/@cspotcode/personal-monorepo/packages/typescript-json-schema-extractor/src/index".Bar                               
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "Foo": {
            "description": "This is a Foo.  DESCRIPTION GOES HERE",
            "type": "object",
            "properties": {
                "bar": {
                    "errorMessage": "You must specify a `bar` value!!",
                    "type": "string"
                }
            },
            "required": [
                "bar"
            ]
        },
        "Bar": {
            "type": "object",
            "properties": {
                "bar": {
                    "type": "string"
                }
            },
            "required": [
                "bar"
            ]
        }
    }
}
*/

///////////////////////////////

// Extraction script, using the API of typescript-json-schema

// optionally pass argument to schema generator
const settings: TJS.PartialArgs = {
    required: true,
    validationKeywords: ["errorMessage", "$comment"],
    ignoreErrors: true
};

// optionally pass ts compiler options
const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true
};

// optionally pass a base path
const basePath = "./src";

const files = globSync('**/*.{d.ts,ts}', {cwd: basePath}).map(v => Path.resolve(basePath, v));

const program = TJS.getProgramFromFiles(files, compilerOptions, basePath);

const generator = TJS.buildGenerator(program, settings)!;

// all symbols
// const symbols = generator.getUserSymbols();
// for(const symbol of symbols) {
//     console.log(symbol);
// }
const jsonSchemaSymbols = [];
for(const symbol of generator.getSymbols()) {
    const fileName = symbol.symbol.getDeclarations()![0].getSourceFile().fileName;
    if(fileName.startsWith(Path.resolve(basePath))) {
        // console.dir(symbol.name);
        // console.dir(ts.getJSDocTags(symbol.symbol.getDeclarations()![0]).map(t => t.tagName.escapedText));
        if(ts.getJSDocTags(symbol.symbol.getDeclarations()![0]).some(t => t.tagName.escapedText === 'emitJsonSchema')) {
            console.log(`Found type: ${ symbol.fullyQualifiedName }`);
            jsonSchemaSymbols.push(symbol);
        }
    }
}

// Get symbols for different types from generator.
console.log(
    JSON.stringify(
        generator.getSchemaForSymbols(jsonSchemaSymbols.map(j => j.name)),
        null,
        4
    )
);
