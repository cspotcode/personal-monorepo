const {promisify} = require('util');
// JS side
exports.default = {
    async foo() {
        return `${ [1, 2, 3] }`;
    },
    async bar() {
        await promisify(setTimeout)(1e3);
        return 'bar return value delayed 1 second';
    },
    async baz() {
        throw new Error('[[baz error message]]');
    },
};
