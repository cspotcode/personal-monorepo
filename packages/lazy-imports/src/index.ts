/** Create a function that returns lazy proxies which lazily invoke the wrapped function and wrap its return value. */
function createLazyFunction<T extends (...args: any[]) => any>(fn: T): T {
    return function(...args: any[]) {
        return createLazyProxy(() => fn(...args));
    } as unknown as any;
}

/** create a function that delegates to one of 2 implementations depending on if it's toggled on or off */
function createToggledFunction<
    T extends (...args: Args) => Ret,
    Args extends any[],
    Ret
>({isToggled, toggledImplementation, untoggledImplementation}: {
    isToggled: (...args: Args) => boolean, 
    toggledImplementation: T,
    untoggledImplementation: T
}): T {
    return function(...args: Args) {
        return isToggled(...args) ? toggledImplementation(...args) : untoggledImplementation(...args);
    } as unknown as T;
}

/**
 * Special symbol used to extract getter function from lazy proxies without
 * triggering a require()
 */
const GETTER = Symbol();

function createLazyProxy<T>(getter: () => T): T {
    let value: any;
    let gotIt = false;
    function getIt() {
        if(!gotIt) {
            gotIt = true;
            value = getter();
        }
        return value;
    }
    const handler: ProxyHandler<any> = {
        ownKeys: (target) => {
            getIt();
            const keys = Reflect.ownKeys(value);
            // These 3 keys *must* be included since we are pretending to be a function.
            // This is an invariant enforced by the JS spec and will throw if we do the wrong thing.
            for(const add of ['prototype', 'arguments', 'caller']) {
                if(!keys.includes(add)) {
                    keys.push(add);
                }
            }
            return keys;
        },
        get: (target, property) => {
            if(property === GETTER) return getIt;
            getIt();
            return Reflect.get(value, property);
        },
        apply: (target, thisArgument, argumentsList) => {
            getIt();
            switch(fnCallMode) {
                case FnCallMode.DotCall:
                    return Function.prototype.apply.call(value, thisArgument, argumentsList);
                case FnCallMode.Reflect:
                    return Reflect.apply(value, thisArgument, argumentsList);
            }
        },
        construct: (target, argumentsList) => {
            getIt();
            switch(fnCallMode) {
                case FnCallMode.DotCall:
                    // TODO
                case FnCallMode.Reflect:
                    return Reflect.construct(value, argumentsList);
            }
        }
    };

    // eslint-disable-next-line prefer-arrow-callback
    return new Proxy(function () {}, handler);
};

/** Source files starting with or exactly matching any of these path prefixes will have all their imports be lazy in "auto" mode */
export const lazyPathPrefixes: string[] = [];

/**
 * Typical usage:
 *   enableForPrefix(__dirname + '/')
 */
export function enableForPrefix(prefix: string) {
    lazyPathPrefixes.push(prefix);
}

enum FnCallMode {
    Reflect = 'reflect',
    DotCall = 'dotcall'
}
let fnCallMode = FnCallMode.DotCall;

export enum LazyMode {
    /** Laziness enabled only for modules matched by prefixes */
    auto,
    /** Laziness enabled for *all* imports */
    enabled,
    disabled
}

let mode: LazyMode = LazyMode.disabled;
/** If true, laziness is permanently disabled.  Used for debugging. */
let permanentlyDisabled = false;
/** enable / disable lazy importing */
export function setMode(_enabled: keyof typeof LazyMode) {
    mode = LazyMode[_enabled];
}

/** Use for debugging but calling once at the top of your program: `require('lazy-imports').permanentlyDisable();` */
export function permanentlyDisable() {
    permanentlyDisabled = true;
}

/** These *target* modules should never be lazily loaded. */
const eagerLoadExceptions = [
    require.resolve('../enable'),
    require.resolve('../disable'),
    require.resolve('../auto'),
];

const Path = require('path');
const Module = require('module');
const eager_load = Module._load.bind(Module);
const lazy_load = createLazyFunction(Module._load);
Module._load = createToggledFunction({
    isToggled: (request, parent, isMain) => {
        /*
         * We pay the performance hit for running this logic for *every single*
         * module loaded.  Keep it fast!
         */
        if(permanentlyDisabled) return false;
        switch(mode) {
            case LazyMode.enabled:
                return true;
            case LazyMode.disabled:
                return false;
            case LazyMode.auto:
                if(Path.isAbsolute(parent.path)) {
                    for(const pathPrefix of lazyPathPrefixes) {
                        if(parent.path.slice(0, pathPrefix.length) === pathPrefix) {
                            return true;
                        }
                    }
                }
                return false;
        }
    },
    toggledImplementation: (request: any, parent: any, isMain: any, ...rest: any[]) => {
        /*
         * Note: we pay the hit for _resolveFilename twice in this code path.
         * However, this only runs when lazy-loading is enabled, which should
         * only be on modules in our own codebase, not for all of node_modules.
         * Hopefully the performance hit is OK.
         */
        const resolved = Module._resolveFilename(request, parent, isMain);
        return (eagerLoadExceptions.includes(resolved) ? eager_load : lazy_load)(request, parent, isMain, ...rest);
    },
    untoggledImplementation: Module._load
});

let tslib: typeof import('tslib') | undefined = undefined;
try {
    tslib = require('tslib');
} catch(e) {}
if(tslib) {
    const {__importDefault, __importStar} = tslib;
    tslib.__importDefault = createToggledFunction({
        isToggled: (m) => !!m[GETTER],
        toggledImplementation: createLazyFunction(__importDefault),
        untoggledImplementation: __importDefault
    });
    tslib.__importStar = createToggledFunction({
        isToggled: (m) => !!m[GETTER],
        toggledImplementation: createLazyFunction(__importStar),
        untoggledImplementation: __importStar
    });
}

/*
Module._load(require, parent, isMain) {}
tslib.__importDefault(exportsObj) {}
tslib.__importStar(exportsObj) {}
*/
