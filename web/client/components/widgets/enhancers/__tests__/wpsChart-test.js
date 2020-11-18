/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {isString} from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';

import wpsChart from '../wpsChart';

describe('wpsChart enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('wpsChart data retrival', (done) => {
        const Sink = wpsChart(createSink( ({data, loading} = {}) => {
            if (!loading) {
                expect(data).toExist();
                expect(data.length).toBe(6);
                done();
            }
        }));
        const props = {
            layer: {
                name: "test",
                url: 'base/web/client/test-resources/widgetbuilder/aggregate',
                wpsUrl: 'base/web/client/test-resources/widgetbuilder/aggregate',
                search: {url: 'base/web/client/test-resources/widgetbuilder/aggregate'}},
            options: {
                aggregateFunction: "Count",
                aggregationAttribute: "test",
                groupByAttributes: "test"
            }
        };
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
    });
    it('wpsChart error management', (done) => {
        const Sink = wpsChart(createSink( ({error, loading} = {}) => {
            if (!loading && error) {
                expect(error).toExist();
                done();
            }
        }));
        const props = {
            layer: {
                name: "test",
                url: 'base/web/client/test-resources/widgetbuilder/aggregate',
                wpsUrl: 'base/web/client/test-resources/widgetbuilder/no-data',
                search: {url: 'base/web/client/test-resources/widgetbuilder/aggregate'}},
            options: {
                aggregateFunction: "Count",
                aggregationAttribute: "test",
                groupByAttributes: "test"
            }
        };
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
    });
    it('wpsChart with time as object', (done) => {
        const Sink = wpsChart(createSink( ({data, loading} = {}) => {
            if (!loading) {
                expect(data).toExist();
                expect(data.length).toBe(2);
                expect(data[0].year).toExist();
                expect(isString(data[0].year)).toBe(true);
                expect(data[1].year).toExist();
                expect(isString(data[1].year)).toBe(true);
                done();
            }
        }));
        const props = {
            layer: {
                name: "test",
                url: 'base/web/client/test-resources/widgetbuilder/aggregate2',
                wpsUrl: 'base/web/client/test-resources/widgetbuilder/aggregate2',
                search: {url: 'base/web/client/test-resources/widgetbuilder/aggregate2'}},
            options: {
                aggregateFunction: "Count",
                aggregationAttribute: "name",
                groupByAttributes: "year"
            }
        };
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
    });
});
