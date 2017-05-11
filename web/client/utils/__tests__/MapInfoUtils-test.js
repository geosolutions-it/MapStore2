/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    getAvailableInfoFormat,
    getAvailableInfoFormatLabels,
    getAvailableInfoFormatValues,
    getDefaultInfoFormatValue,
    buildIdentifyRequest
} = require('../MapInfoUtils');

const CoordinatesUtils = require('../CoordinatesUtils');

describe('MapInfoUtils', () => {

    it('getAvailableInfoFormat', () => {
        let testData = {
            "TEXT": "text/plain",
            "HTML": "text/html",
            "JSON": "application/json"
        };
        let results = getAvailableInfoFormat();
        expect(results).toExist();
        expect(Object.keys(results).length).toBe(Object.keys(testData).length);

        let testKeys = Object.keys(testData);
        expect(Object.keys(results).reduce((prev, key) => {
            return prev
                && testKeys.indexOf(key) !== -1
                && results[key] === testData[key];
        }, true)).toBe(true);
    });

    it('getAvailableInfoFormatLabels', () => {
        let testData = ['TEXT', 'JSON', 'HTML'];
        let results = getAvailableInfoFormatLabels();
        expect(results).toExist();
        expect(results.length).toBe(3);

        expect(results.reduce((prev, label) => {
            return prev && testData.indexOf(label) !== -1;
        }, true)).toBe(true);
    });

    it('getAvailableInfoFormatValues', () => {
        let testData = ['text/plain', 'text/html', 'application/json'];
        let results = getAvailableInfoFormatValues();
        expect(results).toExist();
        expect(results.length).toBe(3);

        expect(results.reduce((prev, value) => {
            return prev && testData.indexOf(value) !== -1;
        }, true)).toBe(true);
    });

    it('getDefaultInfoFormatValue', () => {
        let results = getDefaultInfoFormatValue();
        expect(results).toExist();
        expect(results).toBe('text/plain');
    });

    it('it should returns a bbox', () => {
        let results = CoordinatesUtils.createBBox(-10, 10, -10, 10);
        expect(results).toExist();
        expect(results.maxx).toBe(-10);
    });
    it('buildIdentifyRequest should honour queryLayers', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wms",
            queryLayers: ["sublayer1", "sublayer2"],
            name: "layer",
            url: "http://localhost"
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.query_layers).toEqual("sublayer1,sublayer2");

        let layer2 = {
            type: "wms",
            name: "layer",
            url: "http://localhost"
        };
        let req2 = buildIdentifyRequest(layer2, props);
        expect(req2.request).toExist();
        expect(req2.request.query_layers).toEqual("layer");

        let layer3 = {
            type: "wms",
            name: "layer",
            queryLayers: [],
            url: "http://localhost"
        };
        let req3 = buildIdentifyRequest(layer3, props);
        expect(req3.request).toExist();
        expect(req3.request.query_layers).toEqual("");
    });

    it('buildIdentifyRequest works for wms layer', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wms",
            queryLayers: ["sublayer1", "sublayer2"],
            name: "layer",
            url: "http://localhost"
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.service).toBe('WMS');
    });

    it('buildIdentifyRequest works for wmts layer', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wmts",
            name: "layer",
            url: "http://localhost"
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.service).toBe('WMTS');
    });

    it('buildIdentifyRequest works for vector layer', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 43,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "vector",
            name: "layer",
            features: [{properties: {}}]
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.lat).toBe(43);
    });
});
