/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import MockAdapter from "axios-mock-adapter";
import axios from "../../libs/ajax";
import { getFeatureInfo } from '../identify';


let mockAxios;
import WMS_TEXT from 'raw-loader!../../test-resources/wms/GFI/text.txt';
import WMS_JSON from '../../test-resources/wms/GFI/json.json';
import WMS_HTML from 'raw-loader!../../test-resources/wms/GFI/html.html';

import WFS_JSON from '../../test-resources/wfs/Wyoming.json';
import WFS_DESCRIBE from '../../test-resources/wfs/describe-states.json';


import { INFO_FORMATS } from '../../utils/FeatureInfoUtils';

const getQueryParam = (param, url) => {

    let href = url;
    // this expression is to get the query strings
    let reg = new RegExp('[?&]' + param + '=([^&#]*)', 'i');
    let queryString = reg.exec(href);
    return queryString ? decodeURIComponent(queryString[1]) : null;
};

describe('identify API', () => {
    describe('WMS', () => {
        const SAMPLE_LAYER = {
            type: "wms",
            name: "test_layer"
        };
        beforeEach((done) => {
            mockAxios = new MockAdapter(axios);
            mockAxios.onGet().reply((req) => {
                switch (req.params.info_format) {
                case INFO_FORMATS.HTML:
                    return [200, WMS_HTML];
                case INFO_FORMATS.JSON: {
                    return [200, WMS_JSON];
                }
                case INFO_FORMATS.TEXT: {
                    return [200, WMS_TEXT];
                }
                default:
                    return [404, "NOT FOUND"];
                }
            });
            setTimeout(done);
        });
        afterEach((done) => {
            if (mockAxios) {
                mockAxios.restore();
            }
            mockAxios = null;
            setTimeout(done);
        });
        it('TEXT INFO FORMAT', (done) => {
            getFeatureInfo(
                "TEST_URL", {
                    info_format: INFO_FORMATS.TEXT
                }, SAMPLE_LAYER
            ).subscribe(
                n => {
                    expect(n.data.indexOf("Results for FeatureType") >= 0).toBeTruthy();
                    expect(n.features).toBeFalsy();
                    done();
                },
                error => done(error)
            );
        });
        it('TEXT INFO FORMAT with attachJSON', (done) => {
            getFeatureInfo(
                "TEST_URL",
                {
                    info_format: INFO_FORMATS.TEXT
                },
                SAMPLE_LAYER,
                {attachJSON: true}
            ).subscribe(
                n => {
                    expect(n.data.indexOf("Results for FeatureType") >= 0).toBeTruthy();
                    expect(n.features).toBeTruthy();
                    done();
                },
                error => done(error)
            );
        });

        it('HTML INFO FORMAT', (done) => {
            getFeatureInfo(
                "TEST_URL", {
                    info_format: INFO_FORMATS.HTML
                }, SAMPLE_LAYER
            ).subscribe(
                n => {
                    expect(n.data.indexOf("<html") >= 0).toBeTruthy();
                    expect(n.features).toBeFalsy();
                    done();
                },
                error => done(error),
                () => done()
            );
        });
        it('HTML INFO FORMAT with attachJSON', (done) => {
            getFeatureInfo(
                "TEST_URL", {
                    info_format: INFO_FORMATS.HTML
                }, SAMPLE_LAYER,
                { attachJSON: true }
            ).subscribe(
                n => {
                    expect(n.data.indexOf("<html") >= 0).toBeTruthy();
                    expect(n.features).toBeTruthy();
                    done();
                },
                error => done(error)
            );
        });
        it('JSON INFO FORMAT', (done) => {
            getFeatureInfo(
                "TEST_URL", {
                    info_format: INFO_FORMATS.JSON
                }, SAMPLE_LAYER).subscribe(
                n => {
                    expect(n.data.features).toBeTruthy();
                    expect(n.features).toBeTruthy(); // data is present, anyway, even if attachJSON missing
                    done();
                },
                error => done(error),
                () => done()
            );
        });
        it('JSON INFO FORMAT with attachJSON', (done) => {
            // TODO: check only one request to be performed
            getFeatureInfo(
                "TEST_URL", {
                    info_format: INFO_FORMATS.JSON
                }, SAMPLE_LAYER, {attachJSON: true}).subscribe(
                n => {
                    expect(n.data.features).toBeTruthy();
                    expect(n.features).toBeTruthy();
                },
                error => done(error),
                () => done()
            );
        });
    });
    describe('WFS', () => {
        const SAMPLE_LAYER = {
            type: "wfs",
            url: "sample_URL", // needed
            name: "test_layer"
        };
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
        it('Info Request emulation', (done) => {
            mockAxios.onGet().reply((req) => {
                const request = getQueryParam('request', req.url);
                const outputFormat = getQueryParam('outputFormat', req.url);
                const cqlFilter = getQueryParam('CQL_FILTER', req.url);
                if (request === "DescribeFeatureType") {
                    return [200, WFS_DESCRIBE];
                }
                // default if missing geometry filter
                expect(cqlFilter).toEqual("(INTERSECTS(\"the_geom\",SRID=4326;Point(1 1)))");
                switch (outputFormat) {
                case INFO_FORMATS.JSON:
                    return [200, WFS_JSON];
                default:
                    return [404, "NOT FOUND"];
                }
            });
            // TODO: check only one request to be performed
            getFeatureInfo(
                "TEST_URL", {
                    point: {
                        latlng: {
                            lat: 1,
                            lng: 1
                        }
                    },
                    outputFormat: INFO_FORMATS.JSON
                }, SAMPLE_LAYER).subscribe(
                n => {
                    expect(n.data.features).toBeTruthy();
                    expect(n.features).toBeTruthy(); // data is present, anyway, even if attachJSON missing
                    done();
                },
                error => done(error)
            );
        });
        it('Info Request emulation with geometricFilter', (done) => {
            const SAMPLE_GEOMETRIC_FILTER = {
                "type": "geometry",
                "enabled": true,
                "value": {
                    "geometry": {
                        "coordinates": [[[1, 1], [-1, 1], [-1, -1], [1, -1], [1, 1]]],
                        "projection": "EPSG:3857",
                        "type": "Polygon"
                    },
                    "method": "Circle",
                    "operation": "INTERSECTS"
                }
            };
            mockAxios.onGet().reply((req) => {
                const request = getQueryParam('request', req.url);
                const outputFormat = getQueryParam('outputFormat', req.url);
                const cqlFilter = getQueryParam('CQL_FILTER', req.url);
                if (request === "DescribeFeatureType") {
                    return [200, WFS_DESCRIBE];
                }
                // default if missing geometry filter
                expect(cqlFilter).toEqual(`(INTERSECTS("the_geom",SRID=3857;Polygon((1 1, -1 1, -1 -1, 1 -1, 1 1))))`);
                switch (outputFormat) {
                case INFO_FORMATS.JSON:
                    return [200, WFS_JSON];
                default:
                    return [404, "NOT FOUND"];
                }
            });
            // TODO: check only one request to be performed
            getFeatureInfo(
                "TEST_URL", {
                    point: {
                        latlng: {
                            lat: 1,
                            lng: 1
                        },
                        geometricFilter: SAMPLE_GEOMETRIC_FILTER
                    },
                    outputFormat: INFO_FORMATS.JSON
                }, SAMPLE_LAYER).subscribe(
                n => {
                    expect(n.data.features).toBeTruthy();
                    expect(n.features).toBeTruthy(); // data is present, anyway, even if attachJSON missing
                    done();
                },
                error => done(error)
            );
        });
    });

});
