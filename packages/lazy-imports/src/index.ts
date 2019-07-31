/** Create a function that returns lazy proxies which lazily invoke the wrapped function and wrap its return value. */
function createLazyFunction<T extends (...args: any[]) => any>(fn: T): T {
    return function(...args: any[]) {
        return createLazyProxy(() => fn(...args));
    } as unknown as any;
}

/** create a function that delegates to one of 2 implementations depending on if it's toggled on or off */
function createToggledFunction<T extends (...args: any[]) => any>({isToggled, toggledImplementation, untoggledImplementation}: {
    isToggled: () => boolean, 
    toggledImplementation: T,
    untoggledImplementation: T
}): T {
    return function(...args: any[]) {
        return isToggled() ? toggledImplementation(...args) : untoggledImplementation(...args);
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
            return Reflect.ownKeys(value);
        },
        get: (target, property) => {
            if(property === GETTER) return getIt;
            getIt();
            return Reflect.get(value, property);
        },
        apply: (target, thisArgument, argumentsList) => {
            getIt();
            return Reflect.apply(value, thisArgument, argumentsList);
        },
        construct: (target, argumentsList) => {
            getIt();
            return Reflect.construct(value, argumentsList);
        }
    };

    // eslint-disable-next-line prefer-arrow-callback
    return new Proxy(function () {}, handler);
};

let enabled = false;
/** enable / disable lazy importing */
export function setEnabled(_enabled: boolean) {
    enabled = _enabled;
}

/** These modules should never be lazily loaded. */
const eagerLoadExceptions = [
    require.resolve('../enable'),
    require.resolve('../disable'),
];
const Module = require('module');
const eager_load = Module._load.bind(Module);
const lazy_load = createLazyFunction(Module._load);
Module._load = createToggledFunction({
    isToggled: () => enabled,
    toggledImplementation: (request: any, parent: any, isMain: any, ...rest: any[]) => {
        const resolved = Module._resolveFilename(request, parent, isMain);
        return (eagerLoadExceptions.includes(resolved) ? eager_load : lazy_load)(request, parent, isMain, ...rest);
    },
    untoggledImplementation: Module._load
});
const tslib: typeof import('tslib') = require('tslib');
const {__importDefault, __importStar} = tslib;
tslib.__importDefault = createToggledFunction({
    isToggled: () => enabled,
    toggledImplementation: createLazyFunction(__importDefault),
    untoggledImplementation: __importDefault
});
tslib.__importStar = createToggledFunction({
    isToggled: () => enabled,
    toggledImplementation: createLazyFunction(__importStar),
    untoggledImplementation: __importStar
});