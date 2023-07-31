/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import describePois from '../../../../test-resources/wfs/describe-pois.json';
import {
    isGeometryType,
    getFeatureTypeProperties,
    findGeometryProperty,
    getPropertyDescriptor,
    getTypeName

} from '../base';

describe('WFS base utility functions', () => {
    it('findGeometryProperty', () => {
        const prop = findGeometryProperty(describePois);
        expect(prop).toExist();
        expect(prop.name).toBe('the_geom');
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
        GEOM_ATTRIBUTES.forEach( a => {
            expect(isGeometryType(a)).toBe(true);
        });
        NOT_GEOM_ATTRIBUTES.forEach( a => {
            expect(isGeometryType(a)).toBe(false);
        });
        const geomProp = findGeometryProperty(describePois);
        expect(geomProp).toExist();
        expect(geomProp.name).toBe('the_geom');
        expect(isGeometryType(geomProp)).toBe(true);
    });
});
