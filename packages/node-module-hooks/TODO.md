Rewrite all:
    ./node_modules/bar/whatever
    ./node_modules/@foo/bar/whatever
to be:
    ./node_modules/@foo/bar/package.json
This simplifies the dependency graph.
Filesystem watching should still behave,
because any change to a node_modules should 
be accompanied by a change to the package.json

flags to:
    ignoring certain module paths entirely
    Track certain modules as dependencies but not as dependents.
        for example, track node_modules we depend on, but not what they depend on.
