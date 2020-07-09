/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const xml2js = require('xml2js');
const WMTSUtils = require('../WMTSUtils');
const restCapabilities = require('raw-loader!../../test-resources/wmts/GetCapabilities-rest.xml');
const kvpCapabilities = require('raw-loader!../../test-resources/wmts/GetCapabilities-1.0.0.xml');

describe('Test the WMTSUtils', () => {
    it('get matrix ids with object', () => {
        const ids = WMTSUtils.getMatrixIds({
            "EPSG:4326": [{
                identifier: 'EPSG:4326'
            }]
        }, 'EPSG:4326');
        expect(ids.length).toBe(1);
        expect(ids[0].identifier).toBe('EPSG:4326');
    });

    it('get matrix ids with array', () => {
        const ids = WMTSUtils.getMatrixIds([{
            identifier: 'EPSG:4326'
        }], 'EPSG:4326');
        expect(ids.length).toBe(1);
        expect(ids[0].identifier).toBe('EPSG:4326');
    });

    it('wmts kvp', (done) => {
        xml2js.parseString(kvpCapabilities, { explicitArray: false }, (ignore, json) => {
            const operations = WMTSUtils.getOperations(json);
            const kvpOperation = WMTSUtils.getOperation(operations, "GetTile", "KVP");
            expect(kvpOperation).toBe("http://sample.server/geoserver/gwc/service/wmts?");
            expect(WMTSUtils.getOperation(operations, "GetTile", "RESTful")).toNotExist();
            expect(WMTSUtils.getRequestEncoding(json)).toBe("KVP");
            done();
        });
    });
    it('wmts rest', (done) => {
        xml2js.parseString(restCapabilities, { explicitArray: false }, (ignore, json) => {
            const operations = WMTSUtils.getOperations(json);
            const kvpOperation = WMTSUtils.getOperation(operations, "GetTile", "KVP");
            expect(kvpOperation).toNotExist();
            expect(WMTSUtils.getOperation(operations, "GetTile", "RESTful")).toBe("https://maps.sampleServer.org/basemap");
            const tileURLs = WMTSUtils.getGetTileURL(json.Capabilities.Contents.Layer[0]);
            expect(tileURLs).toExist();
            expect(tileURLs.length).toBe(5);
            expect(tileURLs[0]).toBe("https://maps1.sampleServer.org/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png");
            done();
        });
    });
});
