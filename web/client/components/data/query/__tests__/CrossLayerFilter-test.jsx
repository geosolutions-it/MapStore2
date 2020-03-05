/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');

const expect = require('expect');
const CrossLayerFilter = require('../CrossLayerFilter');
describe('CrossLayerFilter component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('CrossLayerFilter rendering with defaults', () => {
        ReactDOM.render(<CrossLayerFilter />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-switch-panel');
        expect(el).toBeTruthy();
    });
    it('buttons, loading, error selector presence', () => {
        ReactDOM.render(<CrossLayerFilter crossLayerExpanded={false} />, document.getElementById("container"));
        const container = document.getElementById('container');

        // render loading
        ReactDOM.render(<CrossLayerFilter crossLayerExpanded layers={[{name: "test"}]} queryCollection={{typeName: "test"}} loadingCapabilities/>, document.getElementById("container"));
        expect(container.querySelector('.switch-loading')).toBeTruthy();

        // render error
        ReactDOM.render(<CrossLayerFilter crossLayerExpanded layers={[{name: "test"}]} queryCollection={{typeName: "test"}} errorObj={{}}/>, document.getElementById("container"));
        expect(container.querySelector('.glyphicon-exclamation-mark')).toBeTruthy();

        // render clear filter
        ReactDOM.render(<CrossLayerFilter crossLayerExpanded layers={[{name: "test"}]} queryCollection={{typeName: "test"}} />, document.getElementById("container"));
        expect(container.querySelector('.glyphicon-clear-filter')).toBeTruthy();
        expect(container.querySelector('.geometry-operation-selector')).toBeFalsy();
        expect(container.querySelector('.mapstore-conditions-group')).toBeFalsy();

        // render also geometric operation
        ReactDOM.render(<CrossLayerFilter
            crossLayerExpanded
            layers={[{name: "test"}]}
            queryCollection={{
                typeName: "test",
                geometryName: "geometry"
            }} />, document.getElementById("container"));
        expect(container.querySelector('.geometry-operation-selector')).toBeTruthy();
        expect(container.querySelector('.mapstore-conditions-group')).toBeFalsy();

        // render also attribute filter group
        ReactDOM.render(<CrossLayerFilter
            crossLayerExpanded
            layers={[{name: "test"}]}
            queryCollection={{
                typeName: "test",
                geometryName: "geometry"
            }}
            operation="WITHIN"
            spatialOperations={[{
                id: "WITHIN",
                name: "Within"
            }]}
        />, document.getElementById("container"));
        expect(container.querySelector('.geometry-operation-selector')).toBeTruthy();
        expect(container.querySelector('.mapstore-conditions-group')).toBeTruthy();
    });
    it('Test CrossLayerFilter expandCrossLayerFilterPanel', () => {
        const actions = {
            expandCrossLayerFilterPanel: () => {}
        };
        const spyexpandCrossLayerFilterPanel = expect.spyOn(actions, 'expandCrossLayerFilterPanel');
        ReactDOM.render(<CrossLayerFilter
            crossLayerExpanded
            layers={[{name: "test"}]}
            queryCollection={{
                typeName: "test",
                geometryName: "geometry"
            }}
            operation="WITHIN"
            spatialOperations={[{
                id: "WITHIN",
                name: "Within"
            }]}
            expandCrossLayerFilterPanel={actions.expandCrossLayerFilterPanel} />, document.getElementById("container"));
        const el = document.querySelector('.m-slider');
        expect(el).toBeTruthy();
        ReactTestUtils.Simulate.click(el);
        expect(spyexpandCrossLayerFilterPanel).toHaveBeenCalled();
    });
    it('Test CrossLayerFilter with pre-filtered data and no "crossLayerExpanded" property ', () => {
        const container = document.getElementById('container');
        ReactDOM.render(<CrossLayerFilter
            layers={[{name: "test"}]}
            queryCollection={{
                typeName: "test",
                geometryName: "geometry"
            }}
            operation="WITHIN"
            spatialOperations={[{
                id: "WITHIN",
                name: "Within"
            }]}
        />, document.getElementById("container"));
        const collapsablePanel = container.querySelector('.mapstore-switch-panel .panel-collapse');
        const expected = collapsablePanel.getAttribute('aria-hidden');
        expect(expected).toEqual('false');
    });

});
