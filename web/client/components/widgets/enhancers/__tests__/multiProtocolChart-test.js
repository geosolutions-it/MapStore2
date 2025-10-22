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
import multiProtocolChart, { wpsAggregateToChartData, wfsToChartData } from '../multiProtocolChart';

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

    it('wpsAggregateToChartData should replace null GroupBy attribute with placeholder', () => {
        const data = {
            AggregationResults: [
                [null, 159.055],
                ["District of Columbia", 159.055],
                ["Virginia", null]
            ],
            GroupByAttributes: ["District"],
            AggregationAttribute: "Population",
            AggregationFunctions: ["Sum"]
        };
        const options = {
            nullHandling: {
                groupByAttributes: {
                    strategy: "placeholder",
                    placeholder: "UNKNOWN"
                }
            }
        };

        const result = wpsAggregateToChartData(data, options);

        expect(result.length).toBe(3);
        expect(result[0].District).toBe("UNKNOWN");
        expect(result[0]["Sum(Population)"]).toBe(159.055);
        expect(result[1].District).toBe("District of Columbia");
        expect(result[1]["Sum(Population)"]).toBe(159.055);
        expect(result[2].District).toBe("Virginia");
        expect(result[2]["Sum(Population)"]).toBe(null);
    });

    it('wpsAggregateToChartData should exclude null GroupBy attributes when strategy is exclude', () => {
        const data = {
            AggregationResults: [
                [null, 159.055],
                ["District of Columbia", 200.5],
                ["Virginia", 300.75]
            ],
            GroupByAttributes: ["District"],
            AggregationAttribute: "Population",
            AggregationFunctions: ["Sum"]
        };
        const options = {
            nullHandling: {
                groupByAttributes: {
                    strategy: "exclude"
                }
            }
        };

        const result = wpsAggregateToChartData(data, options);

        expect(result.length).toBe(2);
        expect(result[0].District).toBe("District of Columbia");
        expect(result[0]["Sum(Population)"]).toBe(200.5);
        expect(result[1].District).toBe("Virginia");
        expect(result[1]["Sum(Population)"]).toBe(300.75);
    });

    it('wfsToChartData should exclude null GroupBy attributes when strategy is exclude', () => {
        const data = {
            features: [
                { properties: { STATE_NAME: null, LAND_KM: 100 } },
                { properties: { STATE_NAME: "Arizona", LAND_KM: 200 } },
                { properties: { STATE_NAME: "California", LAND_KM: 300 } }
            ]
        };
        const options = {
            groupByAttributes: "STATE_NAME",
            nullHandling: {
                groupByAttributes: {
                    strategy: "exclude"
                }
            }
        };

        const result = wfsToChartData(data, options);

        expect(result.length).toBe(2);
        expect(result[0].STATE_NAME).toBe("Arizona");
        expect(result[0].LAND_KM).toBe(200);
        expect(result[1].STATE_NAME).toBe("California");
        expect(result[1].LAND_KM).toBe(300);
    });

    it('wfsToChartData should replace null GroupBy attributes with placeholder', () => {
        const data = {
            features: [
                { properties: { STATE_NAME: null, LAND_KM: 100 } },
                { properties: { STATE_NAME: "Arizona", LAND_KM: 200 } },
                { properties: { STATE_NAME: "California", LAND_KM: 300 } }
            ]
        };
        const options = {
            groupByAttributes: "STATE_NAME",
            nullHandling: {
                groupByAttributes: {
                    strategy: "placeholder",
                    placeholder: "UNKNOWN"
                }
            }
        };

        const result = wfsToChartData(data, options);

        expect(result.length).toBe(3);
        expect(result[0].STATE_NAME).toBe("Arizona");
        expect(result[1].STATE_NAME).toBe("California");
        expect(result[2].STATE_NAME).toBe("UNKNOWN");
        expect(result[2].LAND_KM).toBe(100);
    });

});
