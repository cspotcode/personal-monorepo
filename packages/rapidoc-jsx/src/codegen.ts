import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { JSDOM } from 'jsdom';
import { difference } from 'lodash';
import outdent from 'outdent';
import * as prettier from 'prettier';
import type * as JQueryStatic from 'jquery';
const jqueryFactory: (window: any) => JQueryStatic = require('jquery');

// const rapidocSourcePath = require.resolve('rapidoc');
// const rapidocSource = readFileSync(rapidocSourcePath, 'utf8');

// const giveMeRapidoc = new Function('', `
//     const document = {
//         createTextNode() {
//             return {};
//         },
//         createElement(...args) {
//             return {
//                 removeAttribute() {},
//                 appendChild() {}
//             };
//         },
//         querySelector(...args) {
//             return {
//                 appendChild() {},
//             };
//         },
//         getElementsByTagName() {
//             return [];
//         },
//     };
//     const window = {
//         document,
//         setTimeout() {},
//     };
//     class Element {}
//     class HTMLElement extends Element {}

//     ${rapidocSource}
//     return window;
// `);

// const generatedWindowObject = giveMeRapidoc();

const rapidocClassImplementationPath = require.resolve('rapidoc/src/rapidoc.js');
const rapidocClassImplementationSource = readFileSync(rapidocClassImplementationPath, 'utf8');

const propertiesRegexp = /(static get properties\(\) \{[\s\S]+?\n  \})/;

const [, propertiesStaticMethodSource] = rapidocClassImplementationSource.match(propertiesRegexp);

const theClass = (new Function('', `
    return class {
        ${propertiesStaticMethodSource}
    }
`))();

const properties = Object.entries(theClass.properties as Record<string, {type: Function, attribute: string}>).map(([k, v]) => ({
    propName: k,
    attributeName: v.attribute || k,
    type: v.type === String ? 'string' : v.type === Boolean ? 'boolean' : v.type === Object ? '{}' : v.type === Number ? 'number' : 'unknown' + v.type.name
})).filter(v => {
    // remove internal properties
    return ![
        'selectedContentId',
        'showAdvanceSearchDialog',
        'advanceSearchMatches'
    ].includes(v.propName) && (v.attributeName as any) !== false;
});

function createJquery(html: string) {
    const dom = new JSDOM(html);
    const $ = jqueryFactory(dom.window);
    return $;
}

const rapidocDocsHtmlPath = require.resolve('rapidoc/docs/api.html');
const rapidocDocsHtml = readFileSync(rapidocDocsHtmlPath, 'utf8');
const $ = createJquery(rapidocDocsHtml);

const docs = [...$('td.mono.bold.right')].map(v => {
    const attrName = $(v).text().trim();
    const docs = $(v).parent().find('.gray').text().trim().replace(/(Allowed: |allowed values ).*/, '').trim();
    let allowedStr = $(v).parent().find('.gray>span').text();
    allowedStr = allowedStr.replace(/^Allowed: /, '');
    const overrideType = allowedStr === 'true | false'
        ? 'boolean'
        : allowedStr
        ? allowedStr.split(/ ?\| ?/).map(a => `'${ a.trim() }'`).join(' | ')
        : null;
    return {attrName, docs, overrideType};
});
// console.log(docs.length, properties.length);
// console.log('items in docs missing from properties');
// console.log(difference(docs.map(d => d.attrName), properties.map(p => p.attributeName)));
// console.log('items in properties missing from docs');
// console.log(difference(properties.map(p => p.attributeName), docs.map(d => d.attrName)));

let interfaceDeclaration =
`//
// This file is codegen-ed; do not modify by hand
//

/** */
export interface CodegenedPropertiesInterface {
    ${ codegenInterfaceBody('properties') }
}
/** */
export interface CodegenedAttributesInterface {
    ${ codegenInterfaceBody('attributes') }
}

export const propertyToAttributeMapping = {
    ${ properties.map(p => `'${p.propName}': '${p.attributeName}',`).join('\n') }
}
`
function codegenInterfaceBody(names: 'attributes' | 'properties') {
    return properties.map(prop => {
            const docsEntry = docs.find(d => d.attrName === prop.attributeName);
            let type = docsEntry?.overrideType ?? prop.type;
            return outdent `
                /**
                 * ${docsEntry?.docs ? outdent.string(docsEntry.docs).replace(/\n/g, '\n * ') : ''}
                 * HTML attribute: ${prop.attributeName}
                 */
                ${names === 'attributes' ? `'${ prop.attributeName }'` : prop.propName}?: ${type};
            `;
        }).join('\n');
}

interfaceDeclaration = prettier.format(interfaceDeclaration, { parser: 'typescript' });

writeFileSync(resolve(__dirname, 'properties.ts'), interfaceDeclaration);
