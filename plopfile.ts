export = factory;
import * as _ from 'lodash';
import Path from 'path';
import fs from 'fs';
import * as nodePlop from 'node-plop';
type PlopApi = ReturnType<typeof nodePlop['default']>;
function factory(plop: PlopApi) {
    const workspacePath = Path.join(__dirname, 'personal-monorepo.code-workspace');
    const focusedWorkspacePath = Path.join(__dirname, 'personal-monorepo-focused.code-workspace');
    const workspace = JSON.parse(fs.readFileSync(workspacePath, 'utf8'));
    let focusedWorkspace: any = {folders: []};
    try {
        focusedWorkspace = JSON.parse(fs.readFileSync(focusedWorkspacePath, 'utf8'));
    } catch {}
    type Folder = {name: string, path: string};
    const allFolders: Folder[] = [...workspace.folders, ...workspace._folders];
    const focusedFolders: Folder[] = focusedWorkspace.folders;
    const allChoices = allFolders.map(v => {
        return {
            name: v.name,
            value: v
        };
    });
    const defaultChoices = focusedFolders.map(value => _.find(allFolders, {path: value.path}));
    plop.setGenerator('focus', {
        description: 'Create focused workspace.',
        prompts: [{
            type: 'checkbox',
            name: 'packages',
            choices: allChoices,
            default: defaultChoices,
            pageSize: 30
        }],
        actions: [(_answers, config, plopfileApi) => {
            const answers = _answers as {packages: Folder[]};
            fs.writeFileSync(focusedWorkspacePath, JSON.stringify(
                {
                    ...workspace, 
                    folders: answers.packages
                }
            ));
            return `Updated ${ focusedWorkspacePath }`;
        }]
    });
}

// import { patchJsonFile } from "../packages/scripting-core/src/core";
// import {sortBy, difference, pick} from 'lodash';
// import Path from 'path';
// import { workspaceFilename } from './fixup';
// import assert from 'assert';

// const [action, ..._focusOn] = process.argv.slice(2) as ['add' | 'rm' | 'reset', ...string[]];
// const targets = _focusOn.map(v => Path.basename(v));

// assert(['add', 'rm', 'reset'].includes(action));

// const always = ['__ROOT__', '__template__'];

// type Named = {name: string}
// patchJsonFile(workspaceFilename, (pkg: {folders: Named[], _folders: Named[]}) => {
//     const {folders = [], _folders = []} = pkg;
//     const allFolders = sortBy([...folders, ..._folders], v => v.name);
//     function shouldInclude(folder: string) {
//         const isTarget = targets.includes(folder);
//         if(action === 'rm' && isTarget) return false;
//         return always.includes(folder) || targets.includes(folder) || (action === 'add' && folders.some(v => v.name === folder));
//     }
//     if(targets.length) {
//         pkg.folders = allFolders.filter(v => shouldInclude(v.name));
//         pkg._folders = difference(allFolders, pkg.folders);
//     } else {
//         pkg.folders = allFolders;
//         pkg._folders = [];
//     }
//     console.dir({shown: pkg.folders.map(v => v.name), hidden: pkg._folders.map(v => v.name)});
// });
