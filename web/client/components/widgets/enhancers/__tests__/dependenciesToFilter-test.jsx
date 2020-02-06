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

import dependenciesToFilter from '../dependenciesToFilter';
import {
    inputFilterObjSpatial,
    inputQuickFiltersStateAbbr,
    inputLayerFilterSTATENAME,
    resultFilterOnly,
    resultFilterObjRes1,
    resultMergeFilterRes,
    resultMergeFilterCQLRes,
    resultQuickFilters,
    resultQuickFiltersAndDependenciesQF,
    resultQuickFiltersAndDependenciesFilter,
    resultSpatialAndQuickFilters
} from '../../../../test-resources/widgets/dependenciesToFiltersData';

describe('widgets dependenciesToFilter enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('dependenciesToFilter default', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(undefined);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('dependenciesToFilter with quickFilters only', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(resultQuickFilters);
            done();
        }));
        ReactDOM.render(<Sink quickFilters={inputQuickFiltersStateAbbr}
            options={{
                propertyName: ["state_abbr"]
            }}/>, document.getElementById("container"));
    });
    it('dependenciesToFilter with quickFilters and dependencies.quickFilters', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(resultQuickFiltersAndDependenciesQF);
            done();
        }));
        ReactDOM.render(<Sink
            quickFilters={inputQuickFiltersStateAbbr}
            mapSync
            dependencies = {{
                quickFilters: inputQuickFiltersStateAbbr
            }}
            options={{
                propertyName: ["state_abbr"]
            }}/>, document.getElementById("container"));
    });
    it('dependenciesToFilter with filter and quickFilter', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(resultFilterOnly);
            done();
        }));
        ReactDOM.render(<Sink
            quickFilters={inputQuickFiltersStateAbbr}
            filter={inputLayerFilterSTATENAME}
            options={{
                propertyName: ["state_abbr"]
            }}/>, document.getElementById("container"));
    });
    it('dependenciesToFilter with dependencies.filter and quickFilters', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(resultQuickFiltersAndDependenciesFilter);
            done();
        }));
        ReactDOM.render(<Sink
            quickFilters={inputQuickFiltersStateAbbr}
            mapSync
            dependencies={{
                filter: inputLayerFilterSTATENAME
            }}
            options={{
                propertyName: ["state_abbr"]
            }}/>, document.getElementById("container"));
    });
    it('dependenciesToFilter with quickFilter only and spatial filter', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(resultSpatialAndQuickFilters);
            done();
        }));
        ReactDOM.render(<Sink
            filter={inputFilterObjSpatial}
            quickFilters={inputQuickFiltersStateAbbr}
            options={{
                propertyName: ["state_abbr"]
            }}
        />, document.getElementById("container"));
    });
    it('dependenciesToFilter spatial filter', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(resultFilterObjRes1);
            done();
        }));
        ReactDOM.render(<Sink filter={inputFilterObjSpatial}/>, document.getElementById("container"));
    });
    it('dependenciesToFilter with mapsync and spatial filter', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(resultMergeFilterRes);
            done();
        }));
        ReactDOM.render(<Sink
            mapSync
            geomProp={"geometry"}
            dependencies={ {
                viewport: {"bounds": {"minx": "-1", "miny": "-1", "maxx": "1", "maxy": "1"}, "crs": "EPSG:4326", "rotation": 0}
            } } filter={inputFilterObjSpatial}/>, document.getElementById("container"));
    });
    it('dependenciesToFilter with mapsync, spatial filter and cql_filter', (done) => {
        const Sink = dependenciesToFilter(createSink(props => {
            expect(props).toExist();
            expect(props.filter).toBe(resultMergeFilterCQLRes);
            done();
        }));
        ReactDOM.render(<Sink
            mapSync
            geomProp={"geometry"}
            layer={{
                name: "test",
                id: "test"
            }}
            dependencies={{
                layers: [{id: "test", params: {
                    cql_filter: "prop = 'value'"
                }}],
                viewport: { "bounds": { "minx": "-1", "miny": "-1", "maxx": "1", "maxy": "1" }, "crs": "EPSG:4326", "rotation": 0 }
            }} filter={inputFilterObjSpatial} />, document.getElementById("container"));

    });
});
