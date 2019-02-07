const fs = require('fs');
const _ = require('lodash');
const {flatten, groupBy, mapValues, reduce, map, range, fromPairs} = _;
const outputs = [];
for(const p of [
    'package.json',
    ...fs.readdirSync('packages').map(v => `packages/${v}/package.json`)
]) {
    try {
        const {dependencies, devDependencies} = require(`${process.cwd()}/${p}`);
        outputs.push({dependencies, devDependencies});
    } catch(e) {}
}

const allDeps = flatten(outputs.map(o => Object.entries({...o.dependencies, ...o.devDependencies})));
const groupedDeps = mapValues(groupBy(allDeps, a => a[0]), v => v.map(v2 => v2[1]));
const max = Math.max(...map(groupedDeps, v => v.length));

const pkgs = range(max).map(i => ({
    dependencies: fromPairs(map(groupedDeps, (v, k) => [k, v[i]]))
}));
console.dir(pkgs);

fs.writeFileSync(
    './.github/workflow-image/package-jsons', 
    pkgs
        .map(o => JSON.stringify(o))
        .join('\n')
    // outputs
    //     .filter(v => Object.keys({...v.dependencies, ...v.devDependencies}).length)
    //     .map(o => JSON.stringify(o))
    //     .join('\n')
);
