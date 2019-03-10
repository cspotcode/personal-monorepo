import Path from 'path';
import fs from 'fs';
import * as webpack from 'webpack';
import {WebpackOptions, BannerPlugin} from 'webpack';
import {fromPairs} from 'lodash';

interface FullNodeLibraryOptions extends Pick<WebpackOptions, 'entry'> {
    outputFilepath: string;
    /** Enable .ts, .tsx, and .jsx files */
    enableTypescript: boolean;
    /** Emit a sourcemap */
    sourceMap: boolean;
    /** Use source-map-loader to parse input sourcemaps */
    ingestSourceMaps: boolean;
    /** external modules to exclude from bundling */
    noBundle: Array<string>;
}
const defaultOptions = {
    entry: 'src/index.ts',
    outputFilepath: 'dist/index.js',
    enableTypescript: true,
    sourceMap: true,
    noBundle: [],
    ingestSourceMaps: true,
};
const _assertDefaultsHaveCorrectPropertyNames: keyof FullNodeLibraryOptions = null as any as keyof typeof defaultOptions;
type NodeLibraryOptions = {
    [K in Extract<keyof FullNodeLibraryOptions, keyof typeof defaultOptions>]?: FullNodeLibraryOptions[K];
} & {
    [K in Exclude<keyof FullNodeLibraryOptions, keyof typeof defaultOptions>]: FullNodeLibraryOptions[K];
};

/**
 * Sensible webpack configuration for bundling a node library into a single file.
 * 
 * Usage: module.exports = nodeLibrary(module, {/* override defaults here * /});
 */
export function nodeLibrary(module: NodeJS.Module, options: NodeLibraryOptions) {
    const __dirname = Path.dirname(module.filename);
    const opts: FullNodeLibraryOptions = {
        ...defaultOptions,
        ...options
    };
    const {enableTypescript, entry, outputFilepath, sourceMap, noBundle, ingestSourceMaps} = opts;
    const entryAbs = Path.resolve(__dirname, entry);
    const outputFilepathAbs = Path.resolve(__dirname, outputFilepath);
    const outputDir = Path.dirname(outputFilepathAbs);
    const outputName = Path.basename(outputFilepathAbs);
    
    // Detect entry-point shebang
    const shebang = fs.readFileSync(entryAbs, 'utf8').split('\n')[0];
    const shebangPlugins = 
        shebang.slice(0, 2) === '#!'
        ? [new webpack.BannerPlugin({ banner: shebang, raw: true })]
        : [];

    // TODO add __rootname
    // TODO copy from my npm-pwsh and strip-ts-types configs
    const config: webpack.WebpackOptions = {
        target: 'node',
        entry,
        output: {
            path: outputDir,
            filename: outputName,
            libraryTarget: "commonjs2",
            // TODO why?  How do we handle this correctly?
            devtoolModuleFilenameTemplate: "../[resource-path]",
        },
        mode: 'production',
        devtool: sourceMap ? 'source-map' : 'none',
        externals: {
            // Example
            // vscode: "commonjs vscode"
            ...fromPairs(noBundle.map(v => [v, `commonjs ${ v }`]))
        },
        resolve: {
            extensions: ['.js', '.json', ...(enableTypescript ? ['.ts', '.tsx', '.jsx'] : [])]
        },
        module: {
            rules: [
                ...enableTypescript ? [{
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }]
                }] : [],
                ...ingestSourceMaps ? [{
                    test: /\.(js|ts|tsx|jsx)$/,
                    use: ["source-map-loader"],
                    enforce: "pre"
                }] : []
            ]
        },
        plugins: [...shebangPlugins]
    };

    return config;
}
