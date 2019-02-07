#!/usr/bin/env ts-node-to
import fs from 'fs';
import glob from 'glob';
import process from 'process';
import Path from 'path';
import outdent from 'outdent';
import {assign, template, mapValues, each, fromPairs, defaults} from 'lodash';
import * as __core from '../packages/scripting-core/src/core';
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
 */

export const workspaceFilename = 'personal-monorepo.code-workspace';

function main() {

    process.chdir(Path.join(__dirname, '..'));

    const packageNames = glob.sync('*', {cwd: 'packages'}).filter(v => v !== '__template__');

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
            {
                name: "__ROOT__",
                path: ".",
            },
            ...['__template__', ...packageNames].filter(n => !v._folders.some(v => v.name === n)).map(v => ({
                name: `${ v }`,
                path: `packages/${ v }`,
            }))
        ];
        v.folders = folders.filter(n => !_folders.some(v => v.name === n.name));
        v._folders = folders.filter(n => _folders.some(v => v.name === n.name));
    });

    patchJsonFile('tsconfig.json', (v) => {
        v.references = [
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

    patchJsonFile('lerna.json', (v) => {
        v.packages = packageNames.map(v => `packages/${ v }`);
    });

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
                main: 'dist/index.js',
                types: 'dist/index.d.ts',
                files: [
                    "dist",
                    "src",
                    "tsconfig.json",
                ],
                npmignore: [
                    ".yarnrc",
                    "yarn.lock",
                    "yarn-error.log"
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

    }

    const npmScriptsPath = './scripts/npm-scripts.sh';
    const script = `# || echo - && echo ----- && echo NPM SCRIPTS MUST BE RUN FROM BASH! && echo ----- && echo - && exit 1\n${ npmScriptsPath }`;
    const npmScriptsSh = readTextFile(npmScriptsPath);
    const npmScripts = tryFilterMap(
        extractDelimitedSpan(npmScriptsSh, '###<NAMES>', '###</NAMES>').split('\n'),
        v => v.match(/^(\S+)\)$/)![1]
    );
    patchJsonFile('package.json', (pkg) => {
        // Add missing scripts
        each(npmScripts, s => {
            if(!pkg.scripts[s])
                pkg.scripts[s] = script;
        });
        // remove old scripts that where removed from npm-scripts.sh
        each(pkg.scripts, (v, k) => {
            if(v === script && !npmScripts.includes(k)) {
                delete pkg.scripts[k];
            }
        });
    }, {indentationLevel: 2});

    // TODO enforce LICENSE files and package.json props
    // TODO enforce CONTRIBUTING file?
}

if(require.main === module) {
    main();
}
