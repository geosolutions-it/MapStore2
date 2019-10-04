/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    getTilingSchemes,
    getLayerFromId,
    textSearch,
    reset
} from '../WFS3';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';

let mockAxios;

describe('Test WFS3 API', () => {

    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
        reset();
    });

    it('test getTilingSchemes', (done) => {

        const TILING_SCHEMES_URL = '/geoserver/wfs3/collections/layer_name/tiles';
        const TILING_SCHEMES_ID = 'GoogleMapsCompatible';
        const TILING_SCHEME = {
            type: 'TileMatrixSet',
            identifier: 'GoogleMapsCompatible',
            title: 'GoogleMapsCompatible',
            supportedCRS: 'EPSG:3857',
            tileMatrix: [{
                matrixHeight: 1,
                matrixWidth: 1,
                tileHeight: 256,
                tileWidth: 256,
                identifier: '0',
                scaleDenominator: 559082263.9508929,
                topLeftCorner: [
                    -20037508.34,
                    20037508
                ],
                type: 'TileMatrix'
            }],
            boundingBox: {
                crs: 'http://www.opengis.net/def/crs/EPSG/0/3857',
                lowerCorner: [
                    -20037508.34,
                    -20037508.34
                ],
                upperCorner: [
                    20037508.34,
                    20037508.34
                ],
                type: 'BoundingBox'
            },
            wellKnownScaleSet: 'http://www.opengis.net/def/wkss/OGC/1.0/GoogleMapsCompatible'
        };

        mockAxios.onGet(TILING_SCHEMES_URL).reply(() => {
            return [ 200, { tilingSchemes: [ TILING_SCHEMES_ID ] }];
        });

        mockAxios.onGet(`${TILING_SCHEMES_URL}/${TILING_SCHEMES_ID}`).reply(() => {
            return [ 200, TILING_SCHEME];
        });

        const layer = {
            tilingScheme: `${TILING_SCHEMES_URL}/{tilingSchemeId}`,
            tilingSchemes: TILING_SCHEMES_URL
        };

        getTilingSchemes(layer)
            .then(({ tilingSchemes, allowedSRS }) => {
                expect(allowedSRS).toEqual({ 'EPSG:3857': true });
                expect(tilingSchemes).toEqual({
                    url: TILING_SCHEMES_URL,
                    schemes: [ TILING_SCHEME ]
                });
                done();
            });
    });

    it('test getLayerFromId', (done) => {
        const SERVICE_URL = '/geoserver/wfs3/collections/';
        const COLLECTIONS_ID = 'layer_name';
        const TILING_SCHEMES_URL = '/geoserver/wfs3/collections/layer_name/tiles';
        const TILING_SCHEMES_ID = 'GoogleMapsCompatible';
        const COLLECTION = {
            name: COLLECTIONS_ID,
            title: 'Layer Title',
            extent: {
                spatial: [-180, -90, 180, 90]
            },
            links: [
                {
                    href: '/geoserver/wfs3/collections/layer_name/tiles/{tilingSchemeId}/{level}/{row}/{col}',
                    rel: 'tiles',
                    type: 'application/vnd.mapbox-vector-tile'
                },
                {
                    href: '/geoserver/wfs3/collections/layer_name/tiles/{tilingSchemeId}',
                    rel: 'tilingScheme',
                    type: 'application/json',
                    title: '...'
                },
                {
                    href: TILING_SCHEMES_URL,
                    rel: 'tilingSchemes',
                    type: 'application/json',
                    title: '...'
                }
            ]
        };

        const TILING_SCHEME = {
            type: 'TileMatrixSet',
            identifier: 'GoogleMapsCompatible',
            title: 'GoogleMapsCompatible',
            supportedCRS: 'EPSG:3857',
            tileMatrix: [{
                matrixHeight: 1,
                matrixWidth: 1,
                tileHeight: 256,
                tileWidth: 256,
                identifier: '0',
                scaleDenominator: 559082263.9508929,
                topLeftCorner: [
                    -20037508.34,
                    20037508
                ],
                type: 'TileMatrix'
            }],
            boundingBox: {
                crs: 'http://www.opengis.net/def/crs/EPSG/0/3857',
                lowerCorner: [
                    -20037508.34,
                    -20037508.34
                ],
                upperCorner: [
                    20037508.34,
                    20037508.34
                ],
                type: 'BoundingBox'
            },
            wellKnownScaleSet: 'http://www.opengis.net/def/wkss/OGC/1.0/GoogleMapsCompatible'
        };

        mockAxios.onGet(`${SERVICE_URL}${COLLECTIONS_ID}`).reply(() => {
            return [ 200, COLLECTION];
        });

        mockAxios.onGet(TILING_SCHEMES_URL).reply(() => {
            return [ 200, { tilingSchemes: [ TILING_SCHEMES_ID ] }];
        });

        mockAxios.onGet(`${TILING_SCHEMES_URL}/${TILING_SCHEMES_ID}`).reply(() => {
            return [ 200, TILING_SCHEME];
        });

        getLayerFromId(SERVICE_URL, COLLECTIONS_ID)
            .then((layer) => {
                expect(layer).toEqual({
                    name: COLLECTIONS_ID,
                    title: 'Layer Title',
                    type: 'wfs3',
                    visibility: true,
                    url: '/geoserver/wfs3/collections/layer_name/tiles/{tilingSchemeId}/{level}/{row}/{col}',
                    format: 'application/vnd.mapbox-vector-tile',
                    tilingScheme: '/geoserver/wfs3/collections/layer_name/tiles/{tilingSchemeId}',
                    tilingSchemes: {
                        url: TILING_SCHEMES_URL,
                        schemes: [ TILING_SCHEME ]
                    },
                    allowedSRS: { 'EPSG:3857': true },
                    bbox: {
                        crs: 'EPSG:4326',
                        bounds: {
                            minx: -180,
                            miny: -90,
                            maxx: 180,
                            maxy: 90
                        }
                    }});
                done();
            });
    });
    it('test textSearch', (done) => {
        const TILING_SCHEMES_URL = '/geoserver/wfs3/collections';
        const START_POSITION = 1;
        const MAX_RECORDS = 1;
        const TEXT = '';
        const COLLECTIONS = [
            {
                name: 'layer_name_01',
                title: 'layer title 01',
                extent: {
                    spatial: [-180, -90, 180, 90]
                },
                links: []
            },
            {
                name: 'layer_name_02',
                title: 'layer title 02',
                extent: {
                    spatial: [-180, -90, 180, 90]
                },
                links: []
            }
        ];

        mockAxios.onGet(TILING_SCHEMES_URL)
            .reply(() => {
                return [ 200, { collections: COLLECTIONS }];
            });
        textSearch(TILING_SCHEMES_URL, START_POSITION, MAX_RECORDS, TEXT)
            .then((res) => {
                expect(res).toEqual({
                    numberOfRecordsMatched: 2,
                    numberOfRecordsReturned: 1,
                    nextRecord: 3,
                    records: [{
                        name: 'layer_name_01',
                        title: 'layer title 01',
                        extent: { spatial: [ -180, -90, 180, 90 ] },
                        links: [],
                        type: 'wfs3',
                        visibility: true,
                        url: undefined,
                        format: undefined,
                        tilingScheme: undefined,
                        tilingSchemes: undefined,
                        bbox: { crs: 'EPSG:4326', bounds: { minx: -180, miny: -90, maxx: 180, maxy: 90 } },
                        capabilitiesUrl: '/geoserver/wfs3/collections'
                    }]
                });
                done();
            });
    });
});

