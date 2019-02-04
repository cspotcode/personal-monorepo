import assert from 'assert';

const Module = require('module');

export interface InstalledHook {
    fn: Function;
    delegateTo: InstalledHook | undefined;
}

/**
 * Hooking a function means replacing it with our own implementation that (optionally)
 * delegates to the original.
 * 
 * Multiple hooks should be allowed, delegating in a chain.
 * 
 * If we install hook A, then install hook B, then uninstall A, hopefully this should not break.
 * However it requires that hook B appropriately skips over the now-uninstalled A.
 * 
 * This manager wraps up that behavior.
 */
abstract class HookManager {

    constructor() {
        const self = this;
        this._handler = function() {
            return self._hooks[0].fn.apply(this, arguments);
        }
    }

    /** Is our handler installed? */
    private _installed = false;
    /** backup of original function being hooked */
    private _original: Function | undefined;
    /** our replacement, handles hook invocation */
    private _handler: () => any;

    // First item in this array delegates to the next.
    // last item delegates to the original implementation.
    private _hooks: Array<InstalledHook> = [];

    abstract getFunction(): Function;
    abstract setFunction(fn: Function): void;

    /**
     * Install a hook.
     * Returns a function the hook can call to delegate to the next in the chain,
     * like a `super.foo()` call.
     */
    installHook(hookFn: Function): Function {
        if(!this._installed) {
            this._installed = true;
            this._original = this.getFunction();
            this.setFunction(this._handler);

            // For simplicity, the original implementation is wrapped up as a hook
            const original: InstalledHook = {
                fn: this._original,
                delegateTo: undefined
            };
            this._hooks.push(original);
        }

        const thisHook: InstalledHook = {
            fn: hookFn,
            delegateTo: this._hooks[0]
        };

        this._hooks.unshift(thisHook);

        // will invoke the next hook
        return function delegator(this: any) {
            return thisHook.delegateTo!.fn.apply(this, arguments);
        }
    }

    /**
     * Uninstall a previously installed hook.
     */
    uninstallHook(hookFn: Function) {
        assert(this._installed, 'Must be installed before uninstalling');
        assert(hookFn !== this._original);
        const hookIndex = this._hooks.findIndex(h => h.fn === hookFn);
        assert(hookIndex >= 0);

        // splice out of the array
        this._hooks.splice(hookIndex, 1);
        // fix the preceding item's delegate to point to the next hook
        for(let i = 1; i < this._hooks.length; i++) {
            this._hooks[i - 1].delegateTo = this._hooks[i];
        }

        // If the only remaining hook fn is the one that represents `original`, then uninstall ourselves.
        if(this._hooks.length === 1) {
            this._installed = false;
            this.setFunction(this._original!);
            this._hooks = [];
        }
    }
}

class ResolveFilenameHookManager extends HookManager {
    getFunction() {
        return Module._resolveFilename;
    }
    setFunction(fn: Function) {
        Module._resolveFilename = fn;
    }
}

export const _resolveFilenameHookManager = new ResolveFilenameHookManager();
