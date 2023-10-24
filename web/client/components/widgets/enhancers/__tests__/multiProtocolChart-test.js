/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import expect from 'expect';
import multiProtocolChart from '../multiProtocolChart';

describe('multiProtocolChart enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('multiProtocolChart WFS data fetch', (done) => {
        const Sink = multiProtocolChart(createSink( ({data, loading} = {}) => {
            if (!loading) {
                try {
                    expect(data).toBeTruthy();
                    expect(data.length).toBe(1);
                    expect(data[0].length).toBe(18);
                    data[0].map(({ STATE_NAME, LAND_KM}) => {
                        expect(STATE_NAME).toBeTruthy();
                        expect(LAND_KM).toBeTruthy();
                    });
                } catch (e) {
                    done(e);
                }
                done();
            }
        }));
        const props = {
            traces: [{
                layer: {
                    name: "test",
                    url: 'base/web/client/test-resources/wfs/Arizona_18_results.json',
                    wpsUrl: 'base/web/client/test-resources/wfs/Arizona_18_results.json',
                    search: { url: 'base/web/client/test-resources/wfs/Arizona_18_results.json'}
                },
                options: {
                    aggregationAttribute: "LAND_KM",
                    groupByAttributes: "STATE_NAME"
                }
            }]

        };
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
    });
    it('multiProtocolChart WPS data fetch', (done) => {
        const Sink = multiProtocolChart(createSink(({ data, loading } = {}) => {
            if (!loading) {
                try {
                    expect(data).toBeTruthy();
                    expect(data.length).toBe(1);
                    expect(data[0].length).toBe(6);
                    data[0].map(({ District_N: x, "Sum(Shape_Area)": y }) => {
                        expect(x).toBeTruthy();
                        expect(y).toBeTruthy();
                    });
                } catch (e) {
                    done(e);
                }
                done();
            }
        }));
        const props = {
            traces: [{
                layer: {
                    name: "test",
                    url: 'base/web/client/test-resources/widgetbuilder/aggregate',
                    wpsUrl: 'base/web/client/test-resources/widgetbuilder/aggregate',
                    search: { url: 'base/web/client/test-resources/widgetbuilder/aggregate' }
                },
                options: {
                    aggregateFunction: "Count",
                    aggregationAttribute: "test",
                    groupByAttributes: "test"
                }
            }]
        };
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
    });

});
