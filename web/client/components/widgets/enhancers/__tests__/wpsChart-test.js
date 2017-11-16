/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const wpsChart = require('../wpsChart');

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
});
