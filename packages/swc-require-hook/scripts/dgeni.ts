import Dgeni, { Package } from 'dgeni';
import Path from 'path';
const __root = Path.resolve(__dirname, '..');

const docs = new Package('docs', [
    require('dgeni-packages/typescript'),
    require('dgeni-markdown')
])
    .config(function(log, readFilesProcessor, writeFilesProcessor, readTypeScriptModules) {
        log.level = 'info';

        readFilesProcessor.basePath = __root;
        readFilesProcessor.sourceFiles = [{
            basePath: __root,
            include: 'examples/**/*',
            fileReader: 'exampleFileReader'
        }];

        readTypeScriptModules.basePath = __root;
        readTypeScriptModules.sourceFiles = [
            {
                include: 'src/**/*.ts',
                basePath: 'src'
            }
        ];

        writeFilesProcessor.outputFolder = Path.resolve(__root, 'dgeni-docs');
    });

const pkg = new Package('swc-require-hook', [
    require('dgeni-packages/ngdoc'),
    require('dgeni-packages/typescript'),
    require('dgeni-packages/nunjucks')
])

    /*readTypeScriptModules,*/
    .config((log, readFilesProcessor, writeFilesProcessor) => {
        log.level = 'info';

        readFilesProcessor.basePath = __root;
        readFilesProcessor.sourceFiles = [{
            basePath: __root,
            include: 'examples/**/*',
            fileReader: 'exampleFileReader'
        }];

        writeFilesProcessor.outputFolder = 'dgeni-docs';
    })

    .config((readTypeScriptModules, tsParser) => {

        // Tell TypeScript how to load modules that start with with `@angular`
        // tsParser.options.paths = { '@angular/*': [API_SOURCE_PATH + '/*'] };
        // tsParser.options.baseUrl = __root;

        readTypeScriptModules.basePath = Path.resolve(__root, 'src');
        readTypeScriptModules.sourceFiles = [
            'index.ts',
            'other.ts',
            'register.ts'
        ];
    })

    .config((templateFinder) => {
        // Specify where the templates are located
        templateFinder.templateFolders.unshift(
            Path.resolve(__root, 'templates')
        );
    })

    .config((computePathsProcessor) => {
        // Here we are defining what to output for our docType Module.
        //
        // Each angular module will be extracted to it's own partial and will act as
        // a container for the various Components, Controllers, Services in that
        // Module. We are basically specifying where we want the output files to be
        // located.
        computePathsProcessor.pathTemplates.push({
            docTypes: ['module'],
            pathTemplate: '${area}/${name}',
            outputPathTemplate: 'partials/${area}/${name}.html'
        });

        // Doing the same thing but for regular types like Services, Controllers,
        // etc... By default they are grouped in a componentGroup and processed
        // via the generateComponentGroupsProcessor internally in Dgeni
        computePathsProcessor.pathTemplates.push({
            docTypes: ['componentGroup'],
            pathTemplate: '${area}/${moduleName}/${groupType}',
            outputPathTemplate: 'partials/${area}/${moduleName}/${groupType}.html'
        });
    });

var dgeni = new Dgeni([docs]);

dgeni.generate().then((docs) => {
    console.log(`${ docs.length } docs generated`);
});
