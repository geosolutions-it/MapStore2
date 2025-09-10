/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import describePois from '../../../../test-resources/wfs/describe-pois.json';
import museam from '../../../../test-resources/wfs/museam.json';
import {
    findGeometryProperty,
    findNonGeometryProperty,
    getFeatureTypeProperties,
    getPropertyDescriptor,
    getTypeName,
    isGeometryType,
    isValid
} from '../base';

describe('WFS base utility functions', () => {
    it('findGeometryProperty', () => {
        const prop = findGeometryProperty(describePois);
        expect(prop).toExist();
        expect(prop.name).toBe('the_geom');
    });
    it('findNonGeometryProperty', () => {
        const prop = findNonGeometryProperty(describePois)[0];
        expect(prop).toBeTruthy();
        expect(prop.name).toBe('NAME');
    });
    it('getFeatureTypeProperties', () => {
        const props = getFeatureTypeProperties(describePois);
        expect(props).toExist();
        expect(props.length).toBe(4);
    });
    it('getPropertyDescriptor', () => {
        const prop = getPropertyDescriptor('the_geom', describePois);
        expect(prop).toExist();
        expect(prop.name).toBe('the_geom');
    });
    it('getTypeName', () => {
        const typeName = getTypeName(describePois);
        expect(typeName).toExist();
        expect(typeName).toBe('tiger:poi');
    });
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
        const MULTI_GEOM_ATTRIBUTES = [{
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
        }, {
            "name": "geom2",
            "maxOccurs": 1,
            "minOccurs": 0,
            "nillable": true,
            "type": "xsd:Point",
            "localType": "Point"
        }, {
            "name": "geom3",
            "maxOccurs": 1,
            "minOccurs": 0,
            "nillable": true,
            "type": "xsd:LineString",
            "localType": "LineString"
        }];
        GEOM_ATTRIBUTES.forEach( a => {
            expect(isGeometryType(a)).toBe(true);
        });
        NOT_GEOM_ATTRIBUTES.forEach( a => {
            expect(isGeometryType(a)).toBe(false);
        });
        MULTI_GEOM_ATTRIBUTES.forEach( a => {
            expect(isGeometryType(a)).toBe(true);
        });
        const geomProp = findGeometryProperty(describePois);
        expect(geomProp).toExist();
        expect(geomProp.name).toBe('the_geom');
        expect(isGeometryType(geomProp)).toBe(true);
    });
    it('isValid', () => {
        museam.features.forEach(f => isValid(f, describePois).map( v => expect(v).toBe(true)));
    });
});
