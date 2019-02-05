Use cosmic config for each setup.

    rootDir = "."
    outDir = rootDir
    include globs
    exclude globs
    extensions: {
        '.generate.ts': '.ts'
        '.render.md': ['markdown', '.md']
    }
    render: {
        // Custom renderers
        markdown: 
    }

Support a "bootstrap" file that e.g. loads ts-node, etc.

Disk caching: log all transitive dependencies.
Cache tracks:
    time of most recent render
    for each template file
        Set of all emitted files
        Set of all require() cache dependencies

Watch mode?

API allows returning multiple files, with relative or absolute paths.

JS API is invoked with an API object.
If it returns a string, that's the output code.
If it makes calls against the API object, it can emit additional files.

export function default(api) {

}
api.templateExtension
api.emitExtension
api.emit(relativeOutputFilePath, fileContents);
api.emit({basename: 'whatever'}, fileContents);
