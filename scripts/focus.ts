#!/usr/bin/env ts-node-to
import { patchJsonFile } from "../packages/scripting-core/src/core";
import {sortBy, difference, pick} from 'lodash';
import Path from 'path';
import { workspaceFilename } from './fixup';
import assert from 'assert';

const [action, ..._focusOn] = process.argv.slice(2) as ['add' | 'rm' | 'reset', ...string[]];
const targets = _focusOn.map(v => Path.basename(v));

assert(['add', 'rm', 'reset'].includes(action));

const always = ['__ROOT__', '__template__'];

type Named = {name: string}
patchJsonFile(workspaceFilename, (pkg: {folders: Named[], _folders: Named[]}) => {
    const {folders = [], _folders = []} = pkg;
    const allFolders = sortBy([...folders, ..._folders], v => v.name);
    function shouldInclude(folder: string) {
        const isTarget = targets.includes(folder);
        if(action === 'rm' && isTarget) return false;
        return always.includes(folder) || targets.includes(folder) || (action === 'add' && folders.some(v => v.name === folder));
    }
    if(targets.length) {
        pkg.folders = allFolders.filter(v => shouldInclude(v.name));
        pkg._folders = difference(allFolders, pkg.folders);
    } else {
        pkg.folders = allFolders;
        pkg._folders = [];
    }
    console.dir({shown: pkg.folders.map(v => v.name), hidden: pkg._folders.map(v => v.name)});
});
