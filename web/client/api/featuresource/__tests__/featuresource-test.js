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
    areLayerFeaturesEditable,
    canBrowseFeatures,
    getFeatureSource,
    getFeatureSourceByType,
    getFeatureSourceType,
    registerFeatureSource,
    supportsFeatureEditing
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
    it('canBrowseFeatures', () => {
        expect(canBrowseFeatures({type: 'wms', search: {type: 'wfs', url: '/dummy'}})).toBe(true);
        expect(canBrowseFeatures({type: 'wms'})).toBe(false);
        expect(canBrowseFeatures({type: 'vector'})).toBe(false);
        expect(canBrowseFeatures({type: 'wmts'})).toBe(false);
        expect(canBrowseFeatures()).toBe(false);
    });
    it('supportsFeatureEditing', () => {
        expect(supportsFeatureEditing({type: 'wms'})).toBe(true);
        expect(supportsFeatureEditing({type: 'wfs'})).toBe(true);
        expect(supportsFeatureEditing({type: 'vector'})).toBe(false);
        expect(supportsFeatureEditing({type: 'wmts'})).toBe(false);
    });
    it('areLayerFeaturesEditable', () => {
        expect(areLayerFeaturesEditable({type: 'wms'})).toBe(true);
        expect(areLayerFeaturesEditable({type: 'wms', disableFeaturesEditing: true})).toBe(false);
        expect(areLayerFeaturesEditable({type: 'wmts'})).toBe(false);
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

describe('wfs feature source transactions', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    const describeFeatureType = {
        "elementFormDefault": "qualified",
        "targetNamespace": "http://localhost:8080/geoserver/mapstore",
        "targetPrefix": "mapstore",
        "featureTypes": [
            {
                "typeName": "TEST_LAYER",
                "properties": [
                    {"name": "Integer", "maxOccurs": 1, "minOccurs": 0, "nillable": true, "type": "xsd:int", "localType": "int"},
                    {"name": "Long", "maxOccurs": 1, "minOccurs": 0, "nillable": true, "type": "xsd:int", "localType": "int"},
                    {"name": "Point", "maxOccurs": 1, "minOccurs": 0, "nillable": true, "type": "gml:Point", "localType": "Point"}
                ]
            }
        ]
    };
    const postBodyOf = (options, done, check) => {
        mockAxios.onPost().reply((config) => {
            try {
                check(config.data);
            } catch (e) {
                done(e);
            }
            return [200, ''];
        });
        wfs.saveFeatures({}, {describe: describeFeatureType, url: '/dummy', ...options})
            .subscribe(() => done(), done);
    };
    it('saveFeatures for a single edit', (done) => {
        postBodyOf({updates: {"TEST_LAYER.13": {"Integer": 50}}}, done, (body) => {
            expect(body).toBe(`<wfs:Transaction service="WFS" version="1.1.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs" xmlns:mapstore="http://localhost:8080/geoserver/mapstore"><wfs:Update typeName="mapstore:TEST_LAYER"><wfs:Property><wfs:Name>Integer</wfs:Name><wfs:Value>50</wfs:Value></wfs:Property><ogc:Filter><ogc:FeatureId fid="TEST_LAYER.13"/></ogc:Filter></wfs:Update></wfs:Transaction>`);
        });
    });
    it('saveFeatures for a multi edit', (done) => {
        postBodyOf({updates: {"TEST_LAYER.13": {"Integer": 50, "Long": 55}}}, done, (body) => {
            expect(body).toBe(`<wfs:Transaction service="WFS" version="1.1.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs" xmlns:mapstore="http://localhost:8080/geoserver/mapstore"><wfs:Update typeName="mapstore:TEST_LAYER"><wfs:Property><wfs:Name>Integer</wfs:Name><wfs:Value>50</wfs:Value></wfs:Property>,<wfs:Property><wfs:Name>Long</wfs:Name><wfs:Value>55</wfs:Value></wfs:Property><ogc:Filter><ogc:FeatureId fid="TEST_LAYER.13"/></ogc:Filter></wfs:Update></wfs:Transaction>`);
        });
    });
    it('saveFeatures for a delete', (done) => {
        postBodyOf({deletes: [{id: "TEST_LAYER.13"}]}, done, (body) => {
            expect(body).toContain('<wfs:Delete');
            expect(body).toContain('TEST_LAYER.13');
        });
    });
});
