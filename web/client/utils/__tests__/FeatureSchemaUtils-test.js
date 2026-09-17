/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    DEFAULT_SCHEMA_SRS,
    getSchemaAttributes,
    getSchemaAttribute,
    getGeometryAttribute,
    isGeometryAttribute,
    isValidValueForAttribute,
    isValidValueForAttributeName
} from '../FeatureSchemaUtils';

const SCHEMA = {
    typeName: 'topp:states',
    attributes: [{
        name: 'the_geom',
        label: 'the_geom',
        type: 'geometry',
        localType: 'MultiPolygon',
        nillable: true,
        geometry: true
    }, {
        name: 'STATE_NAME',
        label: 'State name',
        type: 'string',
        localType: 'string',
        nillable: true,
        geometry: false
    }, {
        name: 'CODE',
        label: 'CODE',
        type: undefined,
        localType: 'anyURI',
        nillable: false,
        geometry: false
    }],
    geometryAttribute: 'the_geom',
    geometryType: 'MultiPolygon',
    srs: DEFAULT_SCHEMA_SRS
};

describe('Test the FeatureSchemaUtils', () => {
    it('DEFAULT_SCHEMA_SRS', () => {
        expect(DEFAULT_SCHEMA_SRS).toBe('EPSG:4326');
    });
    it('getSchemaAttributes excludes geometries', () => {
        expect(getSchemaAttributes(SCHEMA).map(({ name }) => name)).toEqual(['STATE_NAME', 'CODE']);
    });
    it('getSchemaAttributes with typedOnly', () => {
        expect(getSchemaAttributes(SCHEMA, { typedOnly: true }).map(({ name }) => name)).toEqual(['STATE_NAME']);
    });
    it('getSchemaAttributes with no schema', () => {
        expect(getSchemaAttributes()).toEqual([]);
        expect(getSchemaAttributes({})).toEqual([]);
    });
    it('getSchemaAttribute', () => {
        expect(getSchemaAttribute(SCHEMA, 'STATE_NAME').localType).toBe('string');
        expect(getSchemaAttribute(SCHEMA, 'missing')).toBe(undefined);
        expect(getSchemaAttribute(undefined, 'STATE_NAME')).toBe(undefined);
    });
    it('getGeometryAttribute', () => {
        expect(getGeometryAttribute(SCHEMA).name).toBe('the_geom');
        expect(getGeometryAttribute({ attributes: [{ name: 'a', geometry: false }] })).toBe(undefined);
        expect(getGeometryAttribute()).toBe(undefined);
    });
    it('isGeometryAttribute', () => {
        expect(isGeometryAttribute(SCHEMA, 'the_geom')).toBe(true);
        expect(isGeometryAttribute(SCHEMA, 'STATE_NAME')).toBe(false);
        expect(isGeometryAttribute(SCHEMA, 'missing')).toBe(false);
    });
    it('isValidValueForAttribute with no descriptor', () => {
        expect(isValidValueForAttribute('a', undefined)).toBe(true);
        expect(isValidValueForAttribute('a', null)).toBe(true);
    });
    it('isValidValueForAttribute with nillable attribute', () => {
        expect(isValidValueForAttribute(null, { nillable: true })).toBe(true);
        expect(isValidValueForAttribute('a', { nillable: true })).toBe(true);
    });
    it('isValidValueForAttribute with not nillable attribute', () => {
        expect(isValidValueForAttribute('a', { nillable: false })).toBe(true);
        expect(isValidValueForAttribute(null, { nillable: false })).toBe(false);
        expect(isValidValueForAttribute(undefined, { nillable: false })).toBe(false);
    });
    it('isValidValueForAttribute with undefined nillable', () => {
        expect(isValidValueForAttribute('a', { name: 'a' })).toBe(false);
    });
    it('isValidValueForAttributeName', () => {
        expect(isValidValueForAttributeName('Rome', 'STATE_NAME', SCHEMA)).toBe(true);
        expect(isValidValueForAttributeName(null, 'CODE', SCHEMA)).toBe(false);
        expect(isValidValueForAttributeName(null, 'missing', SCHEMA)).toBe(true);
    });
});
