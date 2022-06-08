/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import expect from 'expect';

import dependenciesToLayers from '../dependenciesToLayers';
import {
    inputMapDefault,
    inputMapStatesCenterChanged,
    inputMapStatesWithCQL,
    inputDependenciesQuickFilters,
    inputMapStatesCenterChangedAndQuickFilters,
    inputDependenciesQuickFiltersAndFilter,
    resultMapStatesNoCQL,
    resultMapStatesCQL,
    resultMapStatesCQLAndOriginalCql,
    resultMapStatesCQLQuickFiltersAndFilter,
    resultMapWithCqlStatesCQLQuickFiltersAndFilter
} from '../../../../test-resources/widgets/dependenciesToLayersData';

describe('widgets dependenciesToLayers enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('dependenciesToLayers default', (done) => {
        const Sink = dependenciesToLayers(createSink( props => {
            expect(props).toExist();
            expect(props.maps).toEqual(inputMapDefault);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('dependenciesToLayers with no layer in common with dependencies', (done) => {
        const Sink = dependenciesToLayers(createSink( props => {
            expect(props).toExist();
            expect(props.maps).toEqual(resultMapStatesNoCQL);
            done();
        }));
        ReactDOM.render(<Sink
            maps={inputMapStatesCenterChanged}
            mapSync
            selectedMapId={"MAP_ID"}
        />, document.getElementById("container"));
    });
    it('dependenciesToLayers with layer in common with dependencies, with quickFilters', (done) => {
        const Sink = dependenciesToLayers(createSink( props => {
            expect(props).toExist();
            expect(props.maps).toEqual(resultMapStatesCQL);
            done();
        }));
        ReactDOM.render(<Sink
            maps={inputMapStatesCenterChanged}
            dependencies={inputDependenciesQuickFilters}
            mapSync
            selectedMapId={"MAP_ID"}
        />, document.getElementById("container"));
    });
    it('dependenciesToLayers with layer in common with dependencies, with quickFilters updated once', (done) => {
        const Sink = dependenciesToLayers(createSink( props => {
            expect(props).toExist();
            expect(props.maps).toEqual(resultMapStatesCQLAndOriginalCql);
            done();
        }));
        ReactDOM.render(<Sink
            maps={inputMapStatesCenterChangedAndQuickFilters}
            dependencies={inputDependenciesQuickFilters}
            mapSync
            selectedMapId={"MAP_ID"}
        />, document.getElementById("container"));
    });
    it('dependenciesToLayers with layer in common with dependencies, with quickFilters and filter', (done) => {
        const Sink = dependenciesToLayers(createSink( props => {
            expect(props).toExist();
            expect(props.maps).toEqual(resultMapStatesCQLQuickFiltersAndFilter);
            done();
        }));
        ReactDOM.render(<Sink
            maps={inputMapStatesCenterChanged}
            dependencies={inputDependenciesQuickFiltersAndFilter}
            mapSync
            selectedMapId={"MAP_ID"}
        />, document.getElementById("container"));
    });
    it('dependenciesToLayers, map with cql, with layer in common with dependencies, with quickFilters and filter', (done) => {
        const Sink = dependenciesToLayers(createSink( props => {
            expect(props).toExist();
            expect(props.maps).toEqual(resultMapWithCqlStatesCQLQuickFiltersAndFilter);
            done();
        }));
        ReactDOM.render(<Sink
            maps={inputMapStatesWithCQL}
            dependencies={inputDependenciesQuickFiltersAndFilter}
            mapSync
            selectedMapId={"MAP_ID"}
        />, document.getElementById("container"));
    });

});
