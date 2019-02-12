import {transformFileSync, transformSync} from 'swc';
import Path from 'path';
import { Struct } from './other';
export {register} from './hook';

/**
 * @public
 */
export function structTaker(struct: Struct): Struct {
    return struct;
}
/**
 * @public
 */
export function structTaker2(struct: Struct2): Struct2 {
    return struct;
}
export type Struct2 = {
    struct2: true;
}

function main() {
    const output = transformSync(Path.resolve('src/example.ts'), {
        sourceMaps: true,
        swcrc: false,
        filename: Path.resolve('src/index.ts'),
        jsc: {
            parser: {
                syntax: 'typescript',
                tsx: true,
                decorators: true,
            },
            transform: {
                optimizer: {
                    
                }

            },
        },
        module: {
            type: 'commonjs',
            strict: false,
            strictMode: true,
            lazy: false,
            noInterop: false
        },
        minify: false,
    });

    console.log(output.code);
}

console.log('this is main!');
if(require.main === module) main();
