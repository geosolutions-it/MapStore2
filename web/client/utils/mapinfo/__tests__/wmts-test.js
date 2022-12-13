/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import axios from '../../../libs/ajax';
import MockAdapter from "axios-mock-adapter";
import {INFO_FORMATS} from "../../FeatureInfoUtils";
import {getFeatureInfo} from "../../../api/identify";
import wmts from '../wmts';

describe('mapinfo wmts utils', () => {
    let mockAxios;
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach((done) => {
        if (mockAxios) {
            mockAxios.restore();
        }
        mockAxios = null;
        setTimeout(done);
    });

    it('should return the response object from getIdentifyFlow in case of 400 error, TileOutOfRange', (done) => {
        const SAMPLE_LAYER = {
            type: "wmts",
            name: "test_layer"
        };
        mockAxios.onGet().reply(() => {
            return [400, '<?xml version="1.0" encoding="UTF-8"?><ExceptionReport version="1.1.0" xmlns="http://www.opengis.net/ows/1.1"  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xsi:schemaLocation="http://www.opengis.net/ows/1.1 http://geowebcache.org/schema/ows/1.1.0/owsExceptionReport.xsd">  <Exception exceptionCode="TileOutOfRange" locator="TILEROW">    <ExceptionText>Row 84 is out of range, min: 85 max:87</ExceptionText>  </Exception></ExceptionReport>'];
        });
        getFeatureInfo(
            "TEST_URL", {
                info_format: INFO_FORMATS.PROPERTIES
            }, SAMPLE_LAYER
        ).subscribe(
            n => {
                expect(n.data.features).toEqual([]);
                expect(n.features).toEqual([]);
                done();
            },
            error => {
                return done(error);
            }
        );
    });

    it('should build the request using information from tile matrix', () => {
        const layer = {
            "type": "wmts",
            "requestEncoding": "KVP",
            "format": "image/png",
            "url": "/geoserver/gwc/service/wmts",
            "capabilitiesURL": "/geoserver/gwc/service/wmts",
            "queryable": true,
            "visibility": true,
            "dimensions": [],
            "name": "gs:us_states",
            "title": "States of US",
            "description": "States of US",
            "availableTileMatrixSets": {
                "EPSG:900913x2": {
                    "crs": "EPSG:900913",
                    "tileMatrixSet": {
                        "ows:Identifier": "EPSG:900913x2",
                        "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::900913",
                        "TileMatrix": [
                            {
                                "ows:Identifier": "EPSG:900913x2:0",
                                "ScaleDenominator": "2.7954113197544646E8",
                                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                                "TileWidth": "512",
                                "TileHeight": "512",
                                "MatrixWidth": "1",
                                "MatrixHeight": "1"
                            },
                            {
                                "ows:Identifier": "EPSG:900913x2:1",
                                "ScaleDenominator": "1.3977056598772323E8",
                                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                                "TileWidth": "512",
                                "TileHeight": "512",
                                "MatrixWidth": "2",
                                "MatrixHeight": "2"
                            },
                            {
                                "ows:Identifier": "EPSG:900913x2:2",
                                "ScaleDenominator": "6.988528299386162E7",
                                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                                "TileWidth": "512",
                                "TileHeight": "512",
                                "MatrixWidth": "4",
                                "MatrixHeight": "4"
                            },
                            {
                                "ows:Identifier": "EPSG:900913x2:3",
                                "ScaleDenominator": "3.494264149693081E7",
                                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                                "TileWidth": "512",
                                "TileHeight": "512",
                                "MatrixWidth": "8",
                                "MatrixHeight": "8"
                            },
                            {
                                "ows:Identifier": "EPSG:900913x2:4",
                                "ScaleDenominator": "1.7471320748465404E7",
                                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                                "TileWidth": "512",
                                "TileHeight": "512",
                                "MatrixWidth": "16",
                                "MatrixHeight": "16"
                            }
                        ]
                    }
                }
            },
            "bbox": {
                "crs": "EPSG:4326",
                "bounds": {
                    "minx": "-124.73142200000001",
                    "miny": "24.955967",
                    "maxx": "-66.969849",
                    "maxy": "49.371735"
                }
            },
            "links": [],
            "params": {},
            "allowedSRS": {
                "EPSG:4326": true,
                "EPSG:900913": true
            },
            "catalogURL": null,
            "id": "gs:us_states__3a6f8310-7ad6-11ed-b6ac-67747abb1bf6",
            "loading": false,
            "loadingError": false
        };
        const options = {
            "format": "text/plain",
            "map": {
                "projection": "EPSG:900913",
                "units": "m",
                "center": {
                    "x": -102.7500495624999,
                    "y": 37.664881286912795,
                    "crs": "EPSG:4326"
                },
                "zoom": 5,
                "maxExtent": [
                    -20037508.34,
                    -20037508.34,
                    20037508.34,
                    20037508.34
                ],
                "mapId": null,
                "size": {
                    "width": 1090,
                    "height": 941
                },
                "bbox": {
                    "bounds": {
                        "minx": -14104206.742868058,
                        "miny": 2230520.5522863767,
                        "maxx": -8771959.649694163,
                        "maxy": 6833864.143732831
                    },
                    "crs": "EPSG:3857",
                    "rotation": 0
                },
                "version": 2,
                "limits": {},
                "mousePointer": "pointer",
                "mapStateSource": "map",
                "resolution": 4891.96981025128
            },
            "point": {
                "pixel": {
                    "x": 421.00000000000045,
                    "y": 305.9999999999993
                },
                "latlng": {
                    "lat": 43.149093999201284,
                    "lng": -108.19335937499999
                },
                "rawPos": [
                    -12044029.67283865,
                    5334693.078079021
                ],
                "modifiers": {
                    "alt": false,
                    "ctrl": false,
                    "metaKey": false,
                    "shift": false
                }
            },
            "currentLocale": "en-US",
            "env": [
                {
                    "name": "mapstore_language",
                    "value": "en"
                }
            ]
        };
        const { request } = wmts.buildRequest(layer, options);
        expect(request).toEqual({
            service: 'WMTS',
            request: 'GetFeatureInfo',
            layer: 'gs:us_states',
            infoformat: 'text/plain',
            style: '',
            tilecol: 3,
            tilerow: 5,
            tilematrix: 'EPSG:900913x2:4',
            tilematrixset: 'EPSG:900913x2',
            i: 97,
            j: 445
        });
    });
});
