import {transformFileSync, Options} from 'swc';

export function register() {
    const tsConfig = config({tsx: false});
    require.extensions['.ts'] = compiler(tsConfig);

    const tsxConfig = config({tsx: true});
    require.extensions['.tsx'] = compiler(tsxConfig);
}

function compiler(config: Options) {
    return function(_module: NodeModule, filename: string) {
        const module = _module as NodeModuleInternal;
        const result = transformFileSync(filename, config);
        // TODO strip BOM?
        module._compile(result.code, filename);
    }
}

interface NodeModuleInternal extends NodeModule {
    _compile: (code: string, filename: string) => void;
}

function config({tsx}: {tsx: boolean}): Options {
    return {
        sourceMaps: 'inline',
        jsc: {
            parser: {
                syntax: 'typescript',
                tsx,
                decorators: true
            },
            transform: {
                optimizer: undefined,
            }
        },
        module: {
            type: 'commonjs'
        }
    };
}
