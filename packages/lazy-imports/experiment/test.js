const target = {};
const p = new Proxy(function() {}, {
    ownKeys(t) {
        const result = Reflect.ownKeys(target);
        // These 3 *must* be included since we are pretending to be a function
        for(const add of ['prototype', 'arguments', 'caller']) {
            if(!result.includes(add)) {
              result.push(add);
            }
        }
        return result;
    }
});

for(const k in p) {
    console.log(k);
}