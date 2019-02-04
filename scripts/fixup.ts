#!/usr/bin/env ts-node-to
import fs from 'fs';
import glob from 'glob';
import minimatch from 'minimatch';
import process from 'process';
import Path from 'path';
import outdent from 'outdent';
import {assign, template, mapValues, each, fromPairs, defaults} from 'lodash';
import {patchJsonFile, writeTextFile, readTextFile, tryFilterMap, readJsonFile, extractDelimitedSpan, writeJsonFile} from '../packages/scripting-core/src/core';
import { AssertionError } from 'assert';

export const workspaceFilename = 'personal-monorepo.code-workspace';

function main() {

    process.chdir(Path.join(__dirname, '..'));

    const packageNames = glob.sync('*', {cwd: 'packages'}).filter(v => v !== '__template__');

    each(packageNames, (pkgName) => {
        const _defaults = {
            personalMonoRepoMeta: {
                livesIn: 'TODO'
            }
        }
        try {
            patchJsonFile(`packages/${ pkgName }/package.json`, (v) => {
                defaults(v, _defaults);
            }, {indentationLevel: 2});
        } catch(e) {
            writeJsonFile(`packages/${ pkgName }/package.json`, _defaults, 2);
        }
    });

    patchJsonFile(workspaceFilename, (v) => {
        v.folders = [
            {
                name: "__ROOT__",
                path: ".",
            },
            ...packageNames.filter(n => !v._folders.some(v => v.name === n)).map(v => ({
                name: `${ v }`,
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
        if(packages[packageName].personalMonoRepoMeta!.livesIn === 'external') continue;

        // writeTextFile(`packages/${ packageName }/.npmrc`, outdent `
        //     version-tag-prefix="${ readJsonFile(`./packages/${ packageName }/package.json`).name }@"
        // `);

        each(issueTemplates, (templateFn, templateName) => {
            writeTextFile(`.github/ISSUE_TEMPLATE/${ packageName }--${ templateName }.md`, templateFn({
                name: packageName
            }));
        });

        patchJsonFile(`packages/${ packageName }/package.json`, (pkg) => {
            defaults(pkg, {
                license: "MIT",
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
    }

    const npmScriptsPath = './scripts/npm-scripts.sh';
    const npmScriptsSh = readTextFile(npmScriptsPath);
    const npmScripts = tryFilterMap(
        extractDelimitedSpan(npmScriptsSh, '###<NAMES>', '###</NAMES>').split('\n'),
        v => v.match(/^(\S+)\)$/)![1]
    );
    patchJsonFile('package.json', (pkg) => {
        // Add missing scripts
        each(npmScripts, s => {
            if(!pkg.scripts[s])
                pkg.scripts[s] = `# || echo - && echo ----- && echo NPM SCRIPTS MUST BE RUN FROM BASH! && echo ----- && echo - && exit 1\n${ npmScriptsPath }`;
        });
        // remove old scripts that where removed from npm-scripts.sh
        each(pkg.scripts, (v, k) => {
            if(v === npmScriptsPath && !npmScripts.includes(k)) {
                delete pkg.scripts[k];
            }
        });
    });

    // TODO enforce LICENSE files and package.json props
    // TODO enforce CONTRIBUTING file?
}

if(require.main === module) {
    main();
}
