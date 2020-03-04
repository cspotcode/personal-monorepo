import yargs = require('yargs');

export type Ctor<T> = {new (): T};
export function declareCommand<T>(yargs: yargs.Argv, command: Ctor<T>) {
    return yargs.command({
        ...(command as any)[META_ROOT_OPTIONS].commandConfig,
        builder(yargs: yargs.Argv) {
            return yargs.options((command as any).prototype[META_OPTIONS]);
        },
    });

}

function metaRootSetter<T>(rootProp: symbol, fieldProp: string, defaultValue?: T) {
    return function(value: T | undefined = defaultValue) {
        return function(target: object) {
            let rootMetaObj = (target as any)[rootProp];
            if(!rootMetaObj) rootMetaObj = (target as any)[rootProp] = {};
            rootMetaObj[fieldProp] = value;
        }
    }
}
function metaSetter<T>(rootProp: symbol, fieldProp: string, defaultValue?: T) {
    return function(value: T | undefined = defaultValue) {
        return function(target: object, prop: string) {
            let rootMetaObj = (target as any)[rootProp];
            if(!rootMetaObj) rootMetaObj = (target as any)[rootProp] = {};
            let propMetaObj = rootMetaObj[prop];
            if(!propMetaObj) propMetaObj = rootMetaObj[prop] = {};
            propMetaObj[fieldProp] = value;
        }
    }
}
export const META_ROOT_OPTIONS = Symbol();
export const META_OPTIONS = Symbol();
export const string = metaSetter(META_OPTIONS, 'type', 'string');
export const boolean = metaSetter(META_OPTIONS, 'type', 'boolean');
export const required = metaSetter(META_OPTIONS, 'demand', true);
export const describe = metaSetter<string>(META_OPTIONS, 'describe');
export const command = metaRootSetter<{command: string, describe?: string, handler: any}>(META_ROOT_OPTIONS, 'commandConfig');
