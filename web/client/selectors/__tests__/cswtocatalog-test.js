/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { cswToCatalogSelector } from '../cswtocatalog';
import { isEqual } from 'lodash';
/** Geonetwork Style **/
const sampleCSWRecord = {
    boundingBox: {
        extent: [10.686,
            44.931,
            46.693,
            12.54],
        crs: "EPSG:4326"

    },
    dc: {
        identifier: "test-identifier",
        title: "sample title",
        subject: ["subject1", "subject2"],
        "abstract": "sample abstract",
        URI: [{
            TYPE_NAME: "DC_1_1.URI",
            protocol: "OGC:WMS-1.1.1-http-get-map",
            name: "workspace:layername",
            description: "sample layer description",
            value: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&layers=workspace:layername"
        }, {
            TYPE_NAME: "DC_1_1.URI",
            protocol: "image/png",
            name: "thumbnail",
            value: "http://sample.com/img.jpg"
        }]
    }
};
/* GeoServer style */
const sampleCSWRecord2 = {
    boundingBox: {
        extent: [10.686,
            44.931,
            46.693,
            12.54],
        crs: "EPSG:4326"

    },
    dc: {
        identifier: "test-identifier",
        title: "sample title",
        subject: ["subject1", "subject2"],
        "abstract": "sample abstract",
        "references": [{
            scheme: "OGC:WMS-1.1.1-http-get-map",
            value: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&layers=workspace:layername"
        }, {
            scheme: "WWW:LINK-1.0-http--image-thumbnail",
            value: "http://sample.com/img.jpg"
        }]
    }
};
const sampleRecordName = 'workspace:layername1';
const sampleCSWRecord3 = {
    boundingBox: {
        extent: [10.686,
            44.931,
            46.693,
            12.54],
        crs: "EPSG:4326"

    },
    dc: {
        identifier: "test-identifier",
        title: "sample title",
        subject: ["subject1", "subject2"],
        "abstract": "sample abstract",
        "references": [{
            scheme: "OGC:WMS-1.1.1-http-get-map",
            value: [
                'http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&layers=' + sampleRecordName,
                'http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&layers=workspace:layername2',
                'http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&layers=workspace:layername3'
            ]
        }]
    }
};
const sampleRecord = {
    identifier: "test-identifier",
    title: "sample title",
    tags: ["subject1", "subject2"],
    description: "sample abstract",
    thumbnail: "http://sample.com/img.jpg",
    boundingBox: {
        extent: [10.686,
            44.931,
            46.693,
            12.54],
        crs: "EPSG:4326"

    },
    references: [{
        type: "OGC:WMS-1.1.1-http-get-map",
        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&layers=workspace:layername",
        params: {name: "workspace:layername"}
    }]
};

describe('Test csw to catalog selector', () => {
    it('test correct conversion for geonetwork style', () => {
        const testState = {
            catalog: {
                searchOptions: {
                    catalogURL: "http://sample.com"
                },
                result: {
                    records: [sampleCSWRecord],
                    numberOfRecordsMatched: 1,
                    numberOfRecordsReturned: 1
                }

            }
        };
        const records = cswToCatalogSelector(testState.catalog);
        expect(records).toExist();
        expect(records[0]).toExist();
        expect(isEqual(records[0], sampleRecord)).toBe(true);
    });
    it('test correct conversion for geoserver style', () => {
        const testState = {
            catalog: {
                searchOptions: {
                    catalogURL: "http://sample.com"
                },
                result: {
                    records: [sampleCSWRecord2],
                    numberOfRecordsMatched: 1,
                    numberOfRecordsReturned: 1
                }

            }
        };
        const records = cswToCatalogSelector(testState.catalog);
        expect(records).toExist();
        expect(records[0]).toExist();
        expect(isEqual(records[0], sampleRecord)).toBe(true);
    });
    it('test correct conversion for multiple urls in dc.references', () => {
        const testState = {
            catalog: {
                searchOptions: {
                    catalogURL: "http://sample.com"
                },
                result: {
                    records: [sampleCSWRecord3],
                    numberOfRecordsMatched: 1,
                    numberOfRecordsReturned: 1
                }

            }
        };
        const records = cswToCatalogSelector(testState.catalog);
        const name = records[0].references[0].params.name;
        expect(records).toExist();
        expect(records[0]).toExist();
        expect(name).toBe(sampleRecordName);
    });
});
