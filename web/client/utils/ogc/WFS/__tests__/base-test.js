import expect from 'expect';
import {isGeometryType} from '../base';

describe('WFS base utility functions', () => {
    it('isGeometryType', () => {
        const GEOM_ATTRIBUTES = [{
            "name": "the_geom",
            "maxOccurs": 1,
            "minOccurs": 0,
            "nillable": true,
            "type": "gml:MultiPolygon",
            "localType": "MultiPolygon"
        }, {
            "name": "GEOM",
            "maxOccurs": 1,
            "minOccurs": 1,
            "nillable": false,
            "type": "xsd:Geometry",
            "localType": "Geometry"
        }];
        const NOT_GEOM_ATTRIBUTES = [{
            "name": "ACCESS_RIGHTS",
            "maxOccurs": 1,
            "minOccurs": 0,
            "nillable": true,
            "type": "xsd:string",
            "localType": "string"
        }, {
            "name": "ACTIVE",
            "maxOccurs": 1,
            "minOccurs": 1,
            "nillable": false,
            "type": "xsd:number",
            "localType": "number"
        }];
        GEOM_ATTRIBUTES.forEach( a => {
            expect(isGeometryType(a)).toBe(true);
        });
        NOT_GEOM_ATTRIBUTES.forEach( a => {
            expect(isGeometryType(a)).toBe(false);
        });
    });
});
