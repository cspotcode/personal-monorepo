// @ts-nocheck
const p = createLazyProxy(() => {
    return {};
    return function foo() {
        throw new Error('error from foo');
    };
});

new p(1, 2, 3);

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
