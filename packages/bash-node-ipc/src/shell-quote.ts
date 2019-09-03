// Copied from https://github.com/substack/node-shell-quote/blob/master/index.js
// Simplified and bugfixed to fit our needs
export function quote (xs: (/*{op: string}|*/string)[]) {
    return xs.map(function (s) {
        // if (s && typeof s === 'object') {
        //     return s.op.replace(/(.)/g, '\\$1');
        // }
        // else
        if (s === '') {
            return "''";
        }
        // else if (/["\s]/.test(s) && !/'/.test(s)) {
        //     return "'" + s.replace(/(['\\])/g, '\\$1') + "'";
        // }
        // else if (/["'\s]/.test(s)) {
        else {
            return '"' + s.replace(/(["\\$`!])/g, '\\$1').replace(/\n/g, `"$$'\\n'"`) + '"';
        }
        // else {
        //     return String(s).replace(/([A-z]:)?([#!"$&'()*,:;<=>?@\[\\\]^`{|}])/g, '$1\\$2');
        // }
    }).join(' ');
};
