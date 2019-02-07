#!/usr/bin/env node
const {sync: globSync} = require('glob-gitignore');
const fs = require('fs');
const Path = require('path');
const assert = require('assert');

function main() {
    try {
        validate();
        console.log('PASS: All files are explicitly included or excluded for npm publication.');
        return 0;
    } catch(e) {
        console.error(`FAIL: ${ e.message }`);
        return 1;
    }
}

const npmAlwaysIncludes = [
        // Always included by npm, per https://docs.npmjs.com/misc/developers#keeping-files-out-of-your-package
        'package.json',
        'README',
        'README.md',
        'README.txt',
        'CHANGELOG',
        'CHANGELOG.md',
        'CHANGELOG.txt',
        'LICENSE',
        'LICENCE'
];
const npmAlwaysIgnores = [
    // Automatically excluded, per https://docs.npmjs.com/misc/developers#keeping-files-out-of-your-package
    '.*.swp',
    '._*',
    '.DS_Store',
    '.git',
    '.hg',
    '.npmrc',
    '.lock-wscript',
    '.svn',
    '.wafpickle-*',
    'config.gypi',
    'CVS',
    'npm-debug.log',
    'node_modules'
];

exports.validate = validate;
function validate(projectRootPath = process.cwd()) {
    const pkg = JSON.parse(fs.readFileSync(Path.join(projectRootPath, 'package.json'), 'utf8'));

    assert(Array.isArray(pkg.files), 'you must specify a files array in package.json');
    const files = [
        ...pkg.files,
        ...npmAlwaysIncludes,
    ];

    const npmIgnoreRules = (() => {
        let npmignorefile;
        try {
            npmignorefile = fs.readFileSync(Path.join(projectRootPath, '.npmignore'), 'utf8').split('\n').filter(v => v);
        } catch(e) {}
        if(pkg.npmignore && npmignorefile) {
            throw new Error('There can be only one source of npmignore rules: either an .npmignore file or an "npmignore" array in package.json');
        }
        if(!pkg.npmignore && !npmignorefile) {
            throw new Error('You must specify npmignore rules either via .npmignore file or an "npmignore" array in package.json');
        }
        return npmignorefile || pkg.npmignore;
    })();

    const ambiguousFiles = globSync(['**'], {
        dot: true,
        ignore: [
            ...npmIgnoreRules,
            ...npmAlwaysIgnores,
        ]
    }).filter(v => {
        const published = files.includes(v) || files.some(f => (v.indexOf(`${f}/`) === 0));
        return !published;
    });

    if(ambiguousFiles.length) {
        throw Object.assign(new Error(
`The following files are neither included by package.json files array nor excluded by npmignore rules:
${ambiguousFiles.join('\n')}`
        ), {files: ambiguousFiles});
    }
}

if(require.main === module) {
    process.exit(main());
}
