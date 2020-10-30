import {RapiDocAttributes} from './index';
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'rapi-doc': RapiDocAttributes;
        }
    }
}
