/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import model from '../arcgis';
import LazyResult from 'postcss/lib/lazy-result';

describe('mapinfo arcgis utils', () => {
    const layer = {
        id: "13__0021dd50-11ef-11ef-9676-f1a1d3dc7ab8",
        loading: false,
        loadingError: false,
        name: 13,
        previousLoadingError: false,
        properties: {},
        title: "Preliminary",
        type: 'arcgis',
        url: "https://test.url",
        visibility: true,
        bbox: {
            crs: "EPSG:4326",
            bounds: {
                maxx: 146.15441293756888,
                maxy: 68.30102587364424,
                minx: -178.33324456151348,
                miny: -14.601806015513269
            }
        }
    };
    const map = {
        "projection": "EPSG:900913",
        "zoom": 6,
        "resolution": 2445.98490512564
    };
    it('should create a request with empty features', () => {
        const point = {
            "latlng": {
                "lat": 34.81411782090338,
                "lng": -76.51422049947232
            },
            "intersectedFeatures": []
        };
        const request = model.buildRequest(layer, { point, map, currentLocale: 'en-US' });
        expect(request).toEqual({
            request: {
                features: [],
                outputFormat: 'application/json',
                map,
                bounds: {
                    "minx": -8641046.302154357,
                    "miny": 4015126.864845322,
                    "maxx": -8394001.826736668,
                    "maxy": 4262171.340263012
                },
                point: {
                    latlng: {
                        lat: 34.81411782090338,
                        lng: -76.51422049947232 },
                    intersectedFeatures: []
                }
            },
            metadata: {
                title: layer.title
            },
            url: 'client'
        });
    });
    it('should return the response object from getIdentifyFlow', (done) => {
        const point = {
            rawPos: [
                -8926003.543601494,
                4151490.5233060746
            ]
        };
        model.getIdentifyFlow(LazyResult, undefined, { features: [], point, map })
            .toPromise()
            .then((response) => {
                expect(response).toEqual({
                    data: {
                        features: []
                    }
                });
                done();
            });
    });
});
