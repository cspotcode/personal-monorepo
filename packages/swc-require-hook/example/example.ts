
import lodash from 'lodash';
const a: string = 123;

class Bar {}
function Decorated(target: any) {
    console.log(`target is named ${target.name}`);
    return target;
}
// @Decorated
class Foo extends Bar {
    a: string = '';
    b: number = 1;

    /** C is here */
    c: Record<string, string> = new Map<string, string>();
}

console.dir(new Foo);
