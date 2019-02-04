#!/usr/bin/env ts-node-to
import { patchJsonFile } from "../packages/scripting-core/src/core";
import {sortBy} from 'lodash';
import Path from 'path';
import { workspaceFilename } from './fixup';

const focusOn = process.argv.slice(2).map(v => Path.basename(v));

patchJsonFile(workspaceFilename, (pkg) => {
    const {folders = [], _folders = []} = pkg;
    const allFolders = sortBy([...folders, ..._folders], v => v.name);
    if(focusOn.length) {
        pkg.folders = allFolders.filter(v => focusOn.includes(v.name) || v.name === '__ROOT__');
        pkg._folders = allFolders.filter(v => !pkg.folders.includes(v));
    } else {
        pkg.folders = allFolders;
        pkg._folders = [];
    }
});
