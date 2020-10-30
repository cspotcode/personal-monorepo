import { CodegenedPropertiesInterface, CodegenedAttributesInterface, propertyToAttributeMapping } from "./properties";
import { Component } from 'react';
import * as React from 'react';

export interface RapiDocAttributes extends CodegenedAttributesInterface {}
export interface RapiDocProperties extends CodegenedPropertiesInterface {}

export class RapiDoc extends Component<RapiDocProperties> {
    render() {
        const attributes: Record<string, any> = {};
        for(const [k, v] of Object.entries(this.props)) {
            attributes[propertyToAttributeMapping[k]] = v;
        }
        return React.createElement('rapi-doc', attributes);
    }
}
