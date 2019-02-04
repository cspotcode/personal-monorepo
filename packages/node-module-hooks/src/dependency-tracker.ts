const Module = require('module');

class MapOfSets extends Map<string, Set<string>> {
    getOrCreate(key: string) {
        let s = this.get(key);
        if(!s) {
            this.set(key, s = new Set());
        } 
        return s;
    }
}

import {_resolveFilenameHookManager} from './core';

function getInstance() {
    /** Call this to delegate to native _resolveFilename implementation */
    let super_resolveFilename: typeof Module['_resolveFilename'];
    let installed = false;

    /** our hook implementation of _resolveFilename */
    const hook_ResolveFilename = function(this: any, filename: string, module: NodeModule, ...rest: any[]) {
        const result = super_resolveFilename.call(this, filename, module, ...rest);
        moduleDependencies.getOrCreate(module.filename)!.add(result);
        moduleDependents.getOrCreate(result).add(module.filename);
        return result;
    }

    /** Install dependency tracker *before* libraries have been loaded */
    function install() {
        if(installed) return;
        installed = true;
        super_resolveFilename = _resolveFilenameHookManager.installHook(hook_ResolveFilename);
    }


    /** Uninstall dependency tracker */
    function uninstall() {
        if(!installed) return;
        installed = false;
        _resolveFilenameHookManager.uninstallHook(super_resolveFilename);
    }

    function isInstalled() {
        return installed;
    }

    /**
     * Get full set of all direct and transitive dependencies of module.
     * @param module `require.resolve()`d module path.
     * `module` is always omitted from the return Set, even though it may circularly depend
     * on itself.
     */
    function getTransitiveDependencies(module: string) {
        return _getTransitive(moduleDependencies, module);
    }

    /**
     * Get full set of all direct and transitive dependents of module.
     * @param module `require.resolve()`d module path.
     * `module` is always omitted from the return Set, even though it may circularly be a dependent
     * of itself.
     */
    function getTransitiveDependents(module: string) {
        return _getTransitive(moduleDependents, module);
    }

    function _getTransitive(mapOfSets: Map<string, Set<string>>, module: string): Set<string> {
        const acc = new Set();
        worker(module);
        acc.delete(module);
        return acc;

        function worker(module: string) {
            acc.add(module);
            const deps = mapOfSets.get(module);
            if(!deps) return;
            for(const m of deps!) {
                if(!acc.has(m)) worker(m);
            }
        }
    }

    const moduleDependencies = new MapOfSets();
    const moduleDependents = new MapOfSets();

    return {
        install,
        uninstall,
        isInstalled,
        /** Mapping from modules to *direct* (not transitive) dependencies. */
        moduleDependencies,
        /** Mapping from modules to *direct* (not transitive) dependents. */
        moduleDependents,
        getInstance,
        getTransitiveDependencies,
        getTransitiveDependents
    };
}

const instance = getInstance();
export = instance;
