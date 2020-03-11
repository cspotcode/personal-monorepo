#!/usr/bin/env ts-node-script
import { generate } from '@graphql-codegen/cli';
import Path from 'path';

const __root = Path.resolve(__dirname, '..');

async function main() {
    // TODO run
    // yarn gqlg --schemaFilePath ./src/schema.graphql --destDirPath ./src/gqlg --depthLimit 1
    // rm ./src/gqlg/queries/relay.gql

    const generatedFiles = await generate({
        overwrite: true,
        schema: "./src/introspection.json",
        documents: "src/gqlg/**/*.gql",
        generates: {
            [Path.resolve(__root, 'src/sdk.ts')]: {
                plugins: [
                    'typescript',
                    'typescript-operations',
                    'typescript-graphql-request'
                ]
            },
            // [Path.resolve(__root, 'src/graphql.schema.json')]: {
            //     plugins: ['introspection']
            // }
        }
    });
}

main();
