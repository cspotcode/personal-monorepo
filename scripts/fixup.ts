#!/usr/bin/env ts-node-transpile-only
import fs from 'fs';
import glob from 'glob';
import process from 'process';
import Path from 'path';
import outdent from 'outdent';
import {assign, template, mapValues, each, fromPairs, defaults} from 'lodash';
import * as __core from '../packages/scripting-core/src/core';
import assert from 'assert';
import { writeTextFileMkdirp } from '../packages/scripting-core/src/core';
let core: typeof __core;
try {
    core = require('../packages/scripting-core/src/core');
} catch {
    core = require('../../packages/scripting-core/src/core');
}
const {patchJsonFile, writeTextFile, readTextFile, tryFilterMap, readJsonFile, extractDelimitedSpan, writeJsonFile} = core;

/**
 * TODO Extra stuff to emit:
 * package.json
 *   main
 *   types
 *   dependency on tslib
 * tsconfig.json
 *   target
 *   module
 *   lib
 *   outDir
 *   rootDir
 *   downlevelIteration
 *   importHelpers
 *   sourceMap
 *   declaration
 *   declarationMap
 *   stripInternal
 *   newline
 * 
 * EMIT JSON WITH TRAILING NEWLINE
 * 
 * tsc --showConfig for everything; log JSON diffs from the core config
 * 
 * TODO enforce LICENSE files and package.json props
 * TODO enforce CONTRIBUTING file?
 * 
 * TODO extract deps from `require()` and `import` statements.
 * TODO update tsconfig references based on declared deps on peer projects.
 */

export const workspaceFilename = 'personal-monorepo.template.code-workspace';

function main() {

    process.chdir(Path.join(__dirname, '..'));

    const packageNames = glob.sync('*', {cwd: 'packages'}).filter(v => v !== '__template__' && fs.existsSync(`packages/${ v }/package.json`));

    each(packageNames, (pkgName) => {
        const isGit = fs.existsSync(`packages/${pkgName}/.git`);
        const _defaults = {
            personalMonoRepoMeta: {
                livesIn: isGit ? 'external' : 'mono'
            }
        };
        try {
            patchJsonFile(`packages/${ pkgName }/package.json`, (v) => {
                defaults(v, _defaults);
            }, {indentationLevel: 2});
        } catch(e) {
            writeJsonFile(`packages/${ pkgName }/package.json`, _defaults, 2);
        }
    });

    patchJsonFile(workspaceFilename, (v) => {
        const {_folders} = v;
        const folders = [
            ...['__template__', ...packageNames].map(v => ({
                name: `${ v }`,
                path: `packages/${ v }`,
            })),
            // comes last because of vscode bug
            {
                name: "__ROOT__",
                path: ".",
            }
        ];
        v.folders = folders.filter(n => !_folders.some(v => v.name === n.name));
        v._folders = folders.filter(n => _folders.some(v => v.name === n.name));
    });

    core.patchTextFile('.gitignore', (content) => {
        const delimStart = '### <FIXUP>';
        const delimEnd = '### </FIXUP>';
        const replacement = outdent `

            # Ignore package subdirectories that don't have a package.json.
            # They are likely left-over from switching branches, where build
            # artifacts exist on disk.
            packages/*
            ${ packageNames.map(v => `!packages/${v}`).join('\n') }

        `;
        try {
            return core.replaceDelimitedSpan(content, delimStart, delimEnd, replacement);
        } catch {
            return outdent`
                ${content}


                ${delimStart}${replacement}${delimEnd}
            `;
        }
    });

    patchJsonFile('tsconfig.json', (v) => {
        v._references = [
            ...packageNames.map(v => ({
                path: `packages/${ v }`,
            }))
        ];
    });

    const packages: Record<string, {
        personalMonoRepoMeta?: {
            livesIn: 'mono' | 'external';
        }
    }> = fromPairs(packageNames.map(name => {
        return [name, readJsonFile(`packages/${ name }/package.json`)];
    }));
    each(packages, (pkg, name) => {
        if(pkg.personalMonoRepoMeta!.livesIn == 'TODO' as any) throw new Error(`Fix ${name}'s package.json`);
    });

    // Not needed now that lerna handles globs correctly (https://github.com/lerna/lerna/issues/1786)
    // patchJsonFile('lerna.json', (v) => {
    //     v.packages = packageNames.map(v => `packages/${ v }`);
    // });

    (() => {
        const pkg = readJsonFile('./package.json');
        assert(!pkg.dependencies, 'root package.json not allowed to have dependencies; only devDependencies');
    })();

    const issueTemplates = mapValues({
        'bug-report': true,
        'feature-request': true
    }, (_1, k) => template(readTextFile(`.github/ISSUE_TEMPLATE/__template__--${ k }.md`)));

    for(const packageName of packageNames) {
        // TODO assert that livesIn matches presence of a .git directory
        if(packages[packageName].personalMonoRepoMeta!.livesIn === 'external') continue;

        each(issueTemplates, (templateFn, templateName) => {
            writeTextFile(`.github/ISSUE_TEMPLATE/${ packageName }--${ templateName }.md`, templateFn({
                name: packageName
            }));
        });

        patchJsonFile(`packages/${ packageName }/package.json`, (pkg) => {
            defaults(pkg, {
                name: packageName,
                version: '0.0.0',
                license: "MIT",
                // For Node to load either .js or .mjs
                // Bundlers that support .mjs should also pick it up.
                main: 'dist/index',
                files: [
                    "dist",
                    "src",
                    "tsconfig.json",
                ],
                npmignore: [
                    ".yarnrc",
                    "example",
                    "scripts",
                    "test",
                    "yarn.lock",
                    "yarn-error.log",
                ]
            });
            assign(pkg, {
                homepage: `https://github.com/cspotcode/personal-monorepo/tree/master/packages/${ packageName }`,
                bugs: `https://github.com/cspotcode/personal-monorepo/issues?labels=P:${ packageName }`,
                repository: {
                    type: "git",
                    url: "https://github.com/cspotcode/personal-monorepo.git"
                },
                author: {
                    name: "Andrew Bradley",
                    url: "https://cspotcode.com"
                },
            });
        }, {indentationLevel: 2});

        // Might include a scope, which we want to have in the git tag: @foo/whatever
        const name = readJsonFile(`./packages/${ packageName }/package.json`).name;
        writeTextFile(`packages/${ packageName }/.yarnrc`, outdent `
            version-tag-prefix "${ name }@"
            version-git-message "${ name }@%s"
        `);

        // writeTextFileMkdirp(`src_node_modules/${ name }.d.ts`, outdent `
        //     export * from './packages/${ packageName }/src/index';
        // `);

    }

    updateNpmScripts('.', './scripts/root-scripts.sh');
    for(const packageName of packageNames) {
        try {
            updateNpmScripts(`./packages/${ packageName }`, `./package-scripts.sh`);
        } catch(e) {
            console.log(`Error updating package scripts setup for ${ packageName }: ${ e }`);
        }
    }
    function updateNpmScripts(root: string, npmScriptsRelativePath: string) {
        const npmScriptsPath = Path.join(root, npmScriptsRelativePath);
        // const script = `# || echo - && echo ----- && echo NPM SCRIPTS MUST BE RUN FROM BASH! && echo ----- && echo - && exit 1\n${ npmScriptsRelativePath }`;
        const script = `${ npmScriptsRelativePath }`;
        const npmScriptsSh = readTextFile(npmScriptsPath);
        const npmScripts = tryFilterMap(
            extractDelimitedSpan(npmScriptsSh, '###<NAMES>', '###</NAMES>').split('\n'),
            v => v.match(/^(\S+)\)$/)![1]
        );
        patchJsonFile(Path.join(root, 'package.json'), (pkg) => {
            defaults(pkg, {scripts: {}});
            // Add missing scripts
            each(npmScripts, s => {
                if(!pkg.scripts[s])
                    pkg.scripts[s] = script;
            });
            // remove old scripts that where removed from root-scripts.sh
            each(pkg.scripts, (v, k) => {
                if(v === script && !npmScripts.includes(k)) {
                    delete pkg.scripts[k];
                }
            });
        }, {indentationLevel: 2});
    }

}

if(require.main === module) {
    main();
}
