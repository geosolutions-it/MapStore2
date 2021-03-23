/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import CrossLayerFilter from '../CrossLayerFilter';
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
        expect(el).toExist();
    });
    it('buttons, loading, error selector presence', () => {
        ReactDOM.render(<CrossLayerFilter crossLayerExpanded={false} />, document.getElementById("container"));
        const container = document.getElementById('container');

        // render loading
        ReactDOM.render(<CrossLayerFilter crossLayerExpanded layers={[{name: "test"}]} queryCollection={{typeName: "test"}} loadingCapabilities/>, document.getElementById("container"));
        expect(container.querySelector('.switch-loading')).toExist();

        // render error
        ReactDOM.render(<CrossLayerFilter crossLayerExpanded layers={[{name: "test"}]} queryCollection={{typeName: "test"}} errorObj={{}}/>, document.getElementById("container"));
        expect(container.querySelector('.glyphicon-exclamation-mark')).toExist();

        // render clear filter
        ReactDOM.render(<CrossLayerFilter crossLayerExpanded layers={[{name: "test"}]} queryCollection={{typeName: "test"}} />, document.getElementById("container"));
        expect(container.querySelector('.glyphicon-clear-filter')).toExist();
        expect(container.querySelector('.geometry-operation-selector')).toNotExist();
        expect(container.querySelector('.mapstore-conditions-group')).toNotExist();

        // render also geometric operation
        ReactDOM.render(<CrossLayerFilter
            crossLayerExpanded
            layers={[{name: "test"}]}
            queryCollection={{
                typeName: "test",
                geometryName: "geometry"
            }} />, document.getElementById("container"));
        expect(container.querySelector('.geometry-operation-selector')).toExist();
        expect(container.querySelector('.mapstore-conditions-group')).toNotExist();

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
        expect(container.querySelector('.geometry-operation-selector')).toExist();
        expect(container.querySelector('.mapstore-conditions-group')).toExist();
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
        expect(el).toExist();
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

    it('Test CrossLayerFilter show tooltip for non matching layer source', () => {
        const container = document.getElementById('container');
        ReactDOM.render(<CrossLayerFilter
            layers={[{name: "test", url: "https://google.com"}, {name: 'test2', url: 'https://example.com'}]}
            queryCollection={{
                typeName: "test",
                geometryName: "geometry"
            }}
            searchUrl="https://google.com"
            operation="WITHIN"
            spatialOperations={[{
                id: "WITHIN",
                name: "Within"
            }]}
        />, document.getElementById("container"));
        const infoIcon = container.querySelector('.mapstore-info-popover');
        expect(infoIcon).toExist();
    });

    it('Test CrossLayerFilter not show tooltip for matching layer source', () => {
        const container = document.getElementById('container');
        ReactDOM.render(<CrossLayerFilter
            layers={[{name: "test", url: "https://google.com"}, {name: 'test2', url: 'https://google.com'}]}
            queryCollection={{
                typeName: "test",
                geometryName: "geometry"
            }}
            searchUrl="https://google.com"
            operation="WITHIN"
            spatialOperations={[{
                id: "WITHIN",
                name: "Within"
            }]}
        />, document.getElementById("container"));
        const infoIcon = container.querySelector('.mapstore-info-popover');
        expect(infoIcon).toNotExist();
    });

});
