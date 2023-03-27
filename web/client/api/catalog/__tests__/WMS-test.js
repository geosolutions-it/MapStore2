/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    getCatalogRecords,
    getLayerFromRecord
} from '../WMS';

describe('Test correctness of the WMS APIs', () => {

    it('wms dimensions without values', () => {
        const records = getCatalogRecords({
            records: [{
                Dimension: [{
                    $: {
                        name: 'elevation'
                    }
                }]
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].dimensions.length).toBe(1);
        expect(records[0].dimensions[0].values.length).toBe(0);
    });

    it('wms dimensions with values', () => {
        const records = getCatalogRecords({
            records: [{
                Dimension: [{
                    $: {
                        name: 'elevation'
                    },
                    _: '1,2'
                }]
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].dimensions.length).toBe(1);
        expect(records[0].dimensions[0].values.length).toBe(2);
    });
    // this is needed to avoid to show time values for timeline, until support for time values is fully implemented
    it('wms dimensions time is excluded', () => {
        const records = getCatalogRecords({
            records: [{
                Dimension: [{
                    $: {
                        name: 'time'
                    },
                    _: '2008-10-31T00:00:00.000Z,2008-11-04T00:00:00.000Z'
                }]
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].dimensions.length).toBe(0);
    });

    it('wms limited srs', () => {
        const records = getCatalogRecords({
            records: [{
                SRS: ['EPSG:4326', 'EPSG:3857', 'EPSG:5041']
            }]
        }, { url: 'http://sample' });
        expect(records.length).toBe(1);
        const layer = getLayerFromRecord(records[0]);
        expect(layer.allowedSRS['EPSG:4326']).toBe(true);
        expect(layer.allowedSRS['EPSG:3857']).toBe(true);
        expect(layer.allowedSRS['EPSG:5041']).toNotExist();
    });
    it('wms multiple urls', () => {
        const records = getCatalogRecords({
            records: [{}]
        }, { url: 'http://sample1, http://sample2' });
        expect(records.length).toBe(1);
        const layer = getLayerFromRecord(records[0]);
        expect(layer.url.length).toBe(2);
        expect(layer.url[0]).toBe('http://sample1');
        expect(layer.url[1]).toBe('http://sample2');

    });

    it('wms layer options', () => {
        const records = getCatalogRecords({
            records: [{}]
        }, {
            url: 'http://sample',
            layerOptions: {
                tileSize: 512,
                serverType: "no-vendor"
            }
        });
        expect(records.length).toBe(1);
        const layer = getLayerFromRecord(records[0]);
        expect(layer.tileSize).toBe(512);
        expect(layer.serverType).toBe("no-vendor");
    });

    it('wms layer with visibility limits', () => {
        const records = getCatalogRecords({
            records: [{
                MaxScaleDenominator: "78271",
                MinScaleDenominator: "1222"
            }]
        }, {
            url: 'http://sample'
        });
        const resolutions = [156543, 78271, 39135, 19567, 9783, 4891, 2445, 1222];
        expect(records.length).toBe(1);
        const layer = getLayerFromRecord(records[0], { map: { projection: "EPSG:900913", resolutions }, service: { autoSetVisibilityLimits: true } });
        expect(Math.ceil(layer.minResolution)).toBe(1);
        expect(Math.ceil(layer.maxResolution)).toBe(21);
    });

    it('wms with no ogcServiceReference.url', () => {
        const records = getCatalogRecords(
            {
                records: [{
                    SRS: ['EPSG:4326', 'EPSG:3857', 'EPSG:5041']
                }]
            },
            {
                url: undefined
            }
        );
        expect(records.length).toBe(1);
        const sampleUrl = "http://sample";
        const layer = getLayerFromRecord(records[0], { catalogURL: sampleUrl });

        expect(layer.url).toBe(sampleUrl);
    });
    it('wms check for reference url', () => {
        const records = getCatalogRecords({
            records: [{
                references: [{
                    type: "OGC:WMS",
                    // url: options && options.url,
                    SRS: ['EPSG:4326', 'EPSG:3857'],
                    params: {
                        name: "record.Name"
                    }
                }]
            }]
        }, {});
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });

    it('wms check for reference url, no options', () => {
        const wmsRecords = [{
            references: [{
                type: "OGC:WMS",
                SRS: ['EPSG:4326', 'EPSG:3857'],
                params: {
                    name: "record.Name"
                }
            }]
        }];
        const records = getCatalogRecords({ records: wmsRecords });
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });

    it('wms check for reference url, options with no url', () => {
        const wmsRecords = [{
            references: [{
                type: "OGC:WMS",
                SRS: ['EPSG:4326', 'EPSG:3857'],
                params: {
                    name: "record.Name"
                }
            }]
        }];
        const records = getCatalogRecords({ records: wmsRecords }, {});
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });

    it('wms check for reference url, no options', () => {
        const wmsRecords = [{
            references: [{
                type: "OGC:WMS",
                SRS: ['EPSG:4326', 'EPSG:3857'],
                params: {
                    name: "record.Name"
                }
            }]
        }];
        const url = "http://some.url";
        const records = getCatalogRecords({ records: wmsRecords }, { url });
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].url).toBe(url);
    });
    it('wms layer with formats', () => {
        const getMapFormats = ["image/png"];
        const getFeatureInfoFormats = ["text/plain"];
        const records = getCatalogRecords({
            records: [{
                getMapFormats,
                getFeatureInfoFormats
            }]
        }, {
            url: 'http://sample'
        });
        expect(records.length).toBe(1);
        const layer = getLayerFromRecord(records[0]);
        expect(layer.imageFormats).toEqual(getMapFormats);
        expect(layer.infoFormats).toEqual(getFeatureInfoFormats);
    });
    it('wms layer with force proxy', () => {
        const records = getCatalogRecords({
            records: [{}]
        }, {
            url: 'http://sample'
        });
        expect(records.length).toBe(1);
        const layer = getLayerFromRecord(records[0], { service: { allowUnsecureLayers: true } });
        expect(layer.forceProxy).toBeTruthy();
    });
});

