#!/usr/bin/env node
import yargs = require('yargs');
import { string, required, command, describe, META_ROOT_OPTIONS, META_OPTIONS, declareCommand, boolean } from './yargs-helpers';
import { mkdtempSync, readJsonSync, writeJSONSync, readdirSync, readFileSync, ensureDirSync } from 'fs-extra';
import { sync as execSync } from 'execa';
import { resolve, isAbsolute } from 'path';
import assert from 'assert';
import { Octokit } from '@octokit/rest';
import { OctokitResponse, EndpointInterface, RequestParameters } from '@octokit/types';

@command({
    command: '*',
    describe: 'Bundle a previously-published npm module as static binaries via pkg',
    handler: defaultCommandHandler
})
class DefaultCommandArgs {
    @string()
    @required()
    // @describe('package name (and version) on npmjs.com, e.g. `outdent` or `outdent@next`')
    @describe('package name on npmjs.com, e.g. `outdent`, or path to tarball')
    pkgName!: string;
    @string()
    @describe('package version or dist-tag to download, default `latest`')
    pkgVersion?: string;
    @string()
    @describe('if package exports multiple binaries, which should we bundle? Default: bundle all')
    bin?: string;
    @string()
    @describe('if you want binaries to have a different name than source package')
    outputBinName?: string;
    @string()
    @required()
    @describe('Github org and repo, e.g. `cspotcode/outdent`')
    repo!: string;
    @string()
    @describe('must specify if using github enterprise')
    githubServer?: string;
    @string()
    @describe('must specify if using github enterprise')
    githubApiServer?: string;
    @string()
    gitTag?: string;
    @string()
    gitTagPrefix?: string;
    @string()
    @describe('Used to talk to github API.  If omitted, will be extracted from `git credential fill`')
    githubAccessToken?: string;
    @boolean()
    uploadToGithub?: boolean;
}
async function defaultCommandHandler(args: DefaultCommandArgs) {
    let {
        pkgName: pkgNameOrPath, bin, gitTag, gitTagPrefix = 'v', repo, pkgVersion = 'latest', outputBinName,
        githubServer = 'https://github.com', githubApiServer = 'https://api.github.com', githubAccessToken,
        uploadToGithub = true
    } = args;
    outputBinName = outputBinName ?? bin;
    const [ghOwner, ghRepo] = repo.split('/');

    // Jump into temp directory
    const originalWorkdir = process.cwd();
    const workdirRel = mkdtempSync('pkg-release');
    const workdir = resolve(workdirRel);
    const workdirNpmInstall = resolve(workdir, 'npm-install');
    const workdirPkgBinaries = resolve(workdir, 'pkg-binaries');
    ensureDirSync(workdirNpmInstall);
    process.chdir(workdirNpmInstall);

    // Force using npmjs.com
    process.env['npm_config_registry'] = 'https://registry.npmjs.org/';

    // Write temporary package.json so `npm install` is properly scoped
    writeJSONSync(resolve(workdirNpmInstall, 'package.json'), { name: '@cspotcode/temp-name-does-not-exist' });

    let pkgName: string;
    const pkgNameIsPath = pkgNameOrPath.startsWith('.') || isAbsolute(pkgNameOrPath);
    if(pkgNameIsPath) {
        // install from tarball
        execSync('npm', ['install', `${ resolve(originalWorkdir, pkgNameOrPath) }`], {
            stdio: 'inherit'
        });
        pkgName = Object.keys(readJsonSync('package.json').dependencies)[0];
    } else {
        // Install from npmjs.com
        pkgName = pkgNameOrPath;
        execSync('npm', ['install', `${ pkgName }@${ pkgVersion }`], {
            stdio: 'inherit'
        });
    }

    const targetPackage = readJsonSync(resolve(workdirNpmInstall, 'node_modules', pkgName, 'package.json'));
    const npmPackageVersion = targetPackage.version;

    let binaries = targetPackage.bin;
    if(bin) binaries = { [bin]: binaries[bin] };
    bin = bin ?? ''; // TODO remove this
    assert(Object.keys(binaries).length <= 1, 'publishing multiple binaries at once not implemented yet');
    assert(Object.keys(binaries).length !== 0, `target package doesn't specify a binary in its package.json`);
    writeJSONSync(resolve(workdirNpmInstall, 'package.json'), {
        name: outputBinName,
        bin: {
            [bin]: resolve(workdirNpmInstall, 'node_modules', pkgName, binaries[bin])
        },
        dependencies: {
            [pkgName]: npmPackageVersion
        },
        pkg: {
            scripts: [],
            assets: ["node_modules/**/*"],
            targets: [
                "node12-alpine-x64",
                "node12-macos-x64",
                "node12-linux-x64",
                "node12-win-x64"
            ]
        }
    });

    execSync('pkg', [
        '--out-dir', workdirPkgBinaries,
        '--public',
        '.'
    ], { stdio: 'inherit' });

    if(uploadToGithub) {
        gitTag = gitTag ?? `${ gitTagPrefix }${ npmPackageVersion }`;

        if(githubAccessToken == null) {
            console.log('extracting github access token from `git credential fill`');
            const gitCredsResult = execSync('git', ['credential', 'fill'], {
                stdout: 'pipe',
                input: `url=${ githubServer }`
            });
            const gitCreds = gitCredsResult.stdout.trim().split('\n').map(v => v.trim()).filter(v => v).reduce((a, v) => {
                const [key, ...value] = v.split('=');
                return {
                    ...a,
                    [key]: value.join('=')
                };
            }, {}) as { username: string, password: string };
            githubAccessToken = gitCreds.password;
        }

        const ghClient = new Octokit({
            auth: githubAccessToken,
            previews: [
                'wyandotte-preview',
                'ant-man-preview',
                'squirrel-girl-preview',
                'mockingbird-preview',
                'machine-man-preview',
                'inertia-preview',
                'cloak-preview',
                'black-panther-preview',
                'giant-sentry-fist-preview',
                'mercy-preview',
                'scarlet-witch-preview',
                'sailor-v-preview',
                'zzzax-preview',
                'luke-cage-preview',
                'antiope-preview',
                'starfox-preview',
                'fury-preview',
                'flash-preview',
                'surtur-preview',
                'corsair-preview',
                'sombra-preview',
                'shadow-cat-preview',
                'switcheroo-preview',
                'groot-preview',
                'gambit-preview',
                'dorian-preview',
                'lydian-preview',
                'london-preview',
                'baptiste-preview',
                'doctor-strange-preview',
                'nebula-preview'
            ]
        });
        /**
         * Create fn bound to an endpoint, that will return de-paginated results
         * @example
         *     await paginate(ghClient.repos.listTags)({... opts object ...});
         */
        function paginate<
            Endpoint extends {
                (params: any): Promise<OctokitResponse<any>>;
                endpoint: EndpointInterface;
            },
            >(endpoint: Endpoint) {
            // Infer first argument and return type from Endpoint
            type _temp = Endpoint extends (params: infer Params | undefined) => Promise<OctokitResponse<infer Response>> ? { p: Params, r: Response } : never;
            type Params = _temp['p'];
            type Response = _temp['r'];

            return async function(
                params: Parameters<Endpoint>[0]
            ) {
                const mergedOptions = endpoint.endpoint.merge(params as any);
                return { data: await ghClient.paginate(mergedOptions as any) as any };
            } as Endpoint & { endpoint: never };
        }
        type ResponseOfEndpoint<T> = T extends (...args: any) => Promise<OctokitResponse<infer R>> ? R : never;
        let release: ResponseOfEndpoint<typeof ghClient['repos']['getReleaseByTag']> | ResponseOfEndpoint<typeof ghClient['repos']['createRelease']>;
        try {
            release = (await ghClient.repos.getReleaseByTag({
                owner: ghOwner,
                repo: ghRepo,
                tag: gitTag
            })).data;
            console.log(`Release #${ release.id } found for tag ${ gitTag }`);
        } catch(e) {
            const fn = paginate(ghClient.repos.listTags);
            const tags = (await fn({
                owner: ghOwner,
                repo: ghRepo,
            })).data;
            assert(tags.some(t => t.name === gitTag), `Git tag "${ gitTag }" does not exist on GitHub`);
            release = (await ghClient.repos.createRelease({
                owner: ghOwner,
                repo: ghRepo,
                tag_name: gitTag,
            })).data;
            console.log(`Release #${ release.id } created for tag ${ gitTag }`);
        }
        for(const assetFilename of readdirSync(workdirPkgBinaries)) {
            console.log(`Uploading ${ assetFilename }`);
            const assetPathAbs = resolve(workdirPkgBinaries, assetFilename);
            await ghClient.repos.uploadReleaseAsset({
                owner: ghOwner,
                repo: ghRepo,
                release_id: release.id,
                headers: { 'content-type': 'application/octet-stream' }, // generic binary data
                data: readFileSync(assetPathAbs) as any, // hoping octokit accepts Buffers here
                name: assetFilename.replace(/\./g, '_')
            });
        }
        console.log(`Assets uploaded to release: ${ release.url }`);
    }
}

async function main() {
    declareCommand(yargs, DefaultCommandArgs).strict().parse();
}

main();
