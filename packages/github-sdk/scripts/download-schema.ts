#!/usr/bin/env ts-node-script
import Path from 'path';
import {readJSONSync, writeJSONSync, writeFileSync} from 'fs-extra';
import axios from 'axios';
import {outdent} from 'outdent';
import { buildClientSchema, printSchema } from "graphql";

const __root = Path.resolve(__dirname, '..');

const endpoint = `https://api.github.com`;
const introspectionFile = `src/introspection.json`;
const sdlFile = `src/schema.graphql`;

const {github_token} = readJSONSync(Path.resolve(__root, 'secrets.json'));

const githubAppMediaType = `machine-man`;
const previewMediaTypes_apiv3 = (outdent `
    wyandotte
    ant-man
    squirrel-girl
    mockingbird
    machine-man
    inertia
    cloak
    black-panther
    giant-sentry-fist
    mercy
    scarlet-witch
    sailor-v
    zzzax
    luke-cage
    antiope
    starfox
    fury
    flash
    surtur
    corsair
    sombra
    shadow-cat
    switcheroo
    groot
    gambit
    dorian
    lydian
    london
    baptiste
    doctor-strange
    nebula
`).split('\n');

// Or this list found at https://developer.github.com/v4/previews/?
const previewMediaTypes = (outdent `
    package-deletes
    packages
    flash
    antiope
    merge-info
    update-refs
    hawkgirl
    starfox
    queen-beryl
    corsair
    elektra
    bane
    slothette
    comfort-fade
    stone-crop
`).split('\n');

const acceptHeader = {
    Accept: [githubAppMediaType, ...previewMediaTypes].map(v => `application/vnd.github.${ v }-preview+json`).join(', ')
};

async function main() {
    const response = await axios.get(`${ endpoint }/graphql`, {
        headers: {
            Authorization: `Bearer ${ github_token }`,
            ...acceptHeader,
        },
    });
    const introspectionSchema = response.data;

    writeJSONSync(Path.resolve(__root, introspectionFile), introspectionSchema);

    const graphqlSchemaObj = buildClientSchema(introspectionSchema.data);
    const sdl = printSchema(graphqlSchemaObj);
    writeFileSync(Path.resolve(__root, sdlFile), sdl);
}

main();
