/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';

import axios from '../../../libs/ajax';
import describePois from '../../../test-resources/wfs/describe-pois.json';
import {
    getFeatureSource,
    getFeatureSourceByType,
    getFeatureSourceType,
    registerFeatureSource
} from '../index';
import * as wfs from '../wfs';
import * as vector from '../vector';

describe('featuresource registry', () => {
    it('getFeatureSourceType from the layer type', () => {
        expect(getFeatureSourceType({type: 'wfs'})).toBe('wfs');
        expect(getFeatureSourceType({type: 'vector'})).toBe('vector');
        expect(getFeatureSourceType()).toBe(undefined);
    });
    it('getFeatureSourceType of a wms layer follows the linked search service', () => {
        expect(getFeatureSourceType({type: 'wms', search: {type: 'wfs'}})).toBe('wfs');
        expect(getFeatureSourceType({type: 'wms', search: {url: '/dummy'}})).toBe('wms');
    });
    it('getFeatureSourceType ignores the search type of a non wms layer', () => {
        expect(getFeatureSourceType({type: 'vector', search: {type: 'wfs'}})).toBe('vector');
    });
    it('getFeatureSource resolves the registered sources', () => {
        expect(getFeatureSource({type: 'wfs'})).toBe(wfs);
        expect(getFeatureSource({type: 'wms'})).toBe(wfs);
        expect(getFeatureSource({type: 'vector'})).toBe(vector);
        expect(getFeatureSource({type: 'unknown'})).toBe(undefined);
    });
    it('registerFeatureSource', () => {
        const source = { describe: () => {}, getFeatures: () => {} };
        registerFeatureSource('test-source', source);
        expect(getFeatureSourceByType('test-source')).toBe(source);
        expect(getFeatureSource({type: 'test-source'})).toBe(source);
    });
});

describe('wfs feature source', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('toInfo', () => {
        const info = wfs.toInfo(describePois);
        expect(info.original).toBe(describePois);
        expect(info.geometry.length).toBe(1);
        expect(info.geometry[0].attribute).toBe('the_geom');
        expect(info.attributes.map(({attribute}) => attribute)).toEqual(['NAME', 'THUMBNAIL', 'MAINPAGE']);
        expect(info.schema.geometryAttribute).toBe('the_geom');
        expect(info.attributesJSONSchema.type).toBe('object');
    });
    it('toInfo with fields', () => {
        const info = wfs.toInfo(describePois, [{name: 'NAME', alias: 'Name Alias'}]);
        expect(info.attributes[0].label).toBe('Name Alias');
    });
    it('describe requests the DescribeFeatureType', (done) => {
        mockAxios.onGet().reply((config) => {
            expect(config.url).toContain('request=DescribeFeatureType');
            expect(config.url).toContain('typeName=poi');
            expect(config.url).toContain('outputFormat=application/json');
            return [200, describePois];
        });
        wfs.describe({}, {url: '/dummy', typeName: 'poi'})
            .then((info) => {
                expect(info.geometry[0].attribute).toBe('the_geom');
                done();
            })
            .catch(done);
    });
    it('describe fails with an invalid json', (done) => {
        mockAxios.onGet().reply(() => [200, 'not a json']);
        wfs.describe({}, {url: '/dummy', typeName: 'poi'})
            .catch((e) => {
                expect(e.code).toBe(wfs.INVALID_JSON);
                done();
            });
    });
});

describe('vector feature source', () => {
    it('toInfo', () => {
        const info = vector.toInfo({
            featureTypes: [{
                typeName: 'test',
                properties: [
                    {name: 'geometry', type: 'xsd:Point', localType: 'Point'},
                    {name: 'NAME', type: 'xsd:string', localType: 'string'}
                ]
            }]
        });
        expect(info.geometry.length).toBe(1);
        expect(info.geometry[0].name).toBe('geometry');
        expect(info.attributes.map(({attribute}) => attribute)).toEqual(['NAME']);
        expect(info.schema.geometryAttribute).toBe('geometry');
    });
});
