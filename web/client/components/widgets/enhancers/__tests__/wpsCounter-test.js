/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';

import wpsCounter from '../wpsCounter';

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
    it('wpsCounter data retrieval', (done) => {
        const Sink = wpsCounter(createSink( ({data, loading} = {}) => {
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
                aggregationAttribute: "test"
            }
        };
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
    });
    it('wpsCounter error management', (done) => {
        const Sink = wpsCounter(createSink( ({error, loading} = {}) => {
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
                aggregationAttribute: "test"
            }
        };
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
    });
    it('wpsCounter with mapSync with mapWidget and dependencies', (done) => {
        const Sink = wpsCounter(createSink( ({data, loading} = {}) => {
            if (!loading) {
                expect(data).toExist();
                done();
            }
        }));
        const props = {
            mapSync: true,
            dependencies: {
                viewport: "..."
            },
            dependenciesMap: {
                mapSync: 'widgets[456].mapSync'
            },
            widgets: [
                {
                    id: "123",
                    widgetType: 'table'
                },
                {
                    id: "456",
                    widgetType: 'map'
                }
            ],
            layer: {
                name: "test",
                url: 'base/web/client/test-resources/widgetbuilder/aggregate',
                wpsUrl: 'base/web/client/test-resources/widgetbuilder/aggregate',
                search: {url: 'base/web/client/test-resources/widgetbuilder/aggregate'}},
            options: {
                aggregateFunction: "Count",
                aggregationAttribute: "test"
            }
        };
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
    });
    it('wpsCounter with mapSync standard Map', (done) => {
        const Sink = wpsCounter(createSink( ({data, loading} = {}) => {
            if (!loading) {
                expect(data).toExist();
                done();
            }
        }));
        const props = {
            mapSync: true,
            dependencies: {
                viewport: "..."
            },
            dependenciesMap: {
                mapSync: 'map.mapSync'
            },
            layer: {
                name: "test",
                url: 'base/web/client/test-resources/widgetbuilder/aggregate',
                wpsUrl: 'base/web/client/test-resources/widgetbuilder/aggregate',
                search: {url: 'base/web/client/test-resources/widgetbuilder/aggregate'}},
            options: {
                aggregateFunction: "Count",
                aggregationAttribute: "test"
            }
        };
        ReactDOM.render(<Sink {...props} />, document.getElementById("container"));
    });
});
