#!/usr/bin/env ts-node-to
import fs from 'fs';
import glob from 'glob';
import minimatch from 'minimatch';
import process from 'process';
import Path from 'path';
import outdent from 'outdent';
import {template, mapValues, each, fromPairs, defaults} from 'lodash';
import {patchJsonFile, writeTextFile, readTextFile, tryFilterMap, readJsonFile} from '../packages/scripting-core/src/core';
import { AssertionError } from 'assert';

function main() {

    process.chdir(Path.join(__dirname, '..'));

    const packageNames = glob.sync('*', {cwd: 'packages'}).filter(v => v !== '__template__');

    each(packageNames, (pkgName) => {
        patchJsonFile(`packages/${ pkgName }/package.json`, (v) => {
            defaults(v, {
                personalMonoRepoMeta: {
                    livesIn: 'TODO'
                }
            });
        });
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

    patchJsonFile('workspace.code-workspace', (v) => {
        v.folders = [
            {
                name: "__ROOT__",
                path: ".",
            },
            ...packageNames.map(v => ({
                name: `${ v }`,
                path: `packages/${ v }`,
            }))
        ];
    });

    patchJsonFile('lerna.json', (v) => {
        v.packages = packageNames.map(v => `packages/${ v }`);
    });

    const issueTemplates = mapValues({
        'bug-report': true,
        'feature-request': true
    }, (_1, k) => template(readTextFile(`.github/ISSUE_TEMPLATE/__template__--${ k }.md`)));

    for(const packageName of packageNames) {
        if(packages[packageName].personalMonoRepoMeta!.livesIn === 'external') continue;

        writeTextFile(`packages/${ packageName }/.npmrc`, outdent `
            version-tag-prefix="${ readJsonFile(`./packages/${ packageName }/package.json`).name }@"
        `);

        each(issueTemplates, (templateFn, templateName) => {
            writeTextFile(`.github/ISSUE_TEMPLATE/${ packageName }--${ templateName }.md`, templateFn({
                name: packageName
            }));
        });
    }

    const npmScriptsPath = './scripts/npm-scripts.sh';
    const npmScriptsSh = readTextFile(npmScriptsPath);
    const npmScripts = tryFilterMap(
        npmScriptsSh.match(/###<NAMES>\n([\s\S]*)###<\/NAMES>/)![1].split('\n'),
        v => v.match(/^(\S+)\)$/)![1]
    );
    patchJsonFile('package.json', (pkg) => {
        // Add missing scripts
        each(npmScripts, s => {
            if(!pkg.scripts[s])
                pkg.scripts[s] = npmScriptsPath;
        });
        // remove old scripts that where removed from npm-scripts.sh
        each(pkg.scripts, (v, k) => {
            if(v === npmScriptsPath && !npmScripts.includes(k)) {
                delete pkg.scripts[k];
            }
        });
    });
}

if(require.main === module) {
    main();
}
