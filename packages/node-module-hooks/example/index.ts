import {dependencyTracker} from '../src/index';

dependencyTracker.install();
require('./foo');
console.log('dependencies of ./foo');
console.dir(dependencyTracker.getTransitiveDependencies(require.resolve('./foo')));
console.log('dependents of ./bar');
console.dir(dependencyTracker.getTransitiveDependents(require.resolve('./bar')));
