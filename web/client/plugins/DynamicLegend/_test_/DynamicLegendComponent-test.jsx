/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import DynamicLegend from '../components/DynamicLegend';

describe('DynamicLegend Component', () => {
    let container;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        container = document.getElementById('container');
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const myDockstyle = {
        height: "calc(100% - 0px)",
        right: 40
    };

    const defaultProps = {
        onUpdateNode: () => { },
        currentZoomLvl: 1,
        onClose: () => { },
        isVisible: true,
        groups: [],
        mapBbox: {},
        resolution: 1,
        size: 550,
        dockStyle: myDockstyle,
        layers: [],
        isFloating: false,
        flatLegend: false,
        setConfiguration: () => { }
    };


    it('should render the component container', () => {
        ReactDOM.render(<DynamicLegend {...defaultProps} />, container);
        const componentContainer = container.querySelector('#dynamic-legend-container');
        expect(componentContainer).toBeTruthy();
    });

    it('should render the header when container is not visible', () => {
        ReactDOM.render(<DynamicLegend {...defaultProps} />, container);
        const componentContainer = container.querySelector('#dynamic-legend-container');
        const header = componentContainer.querySelector('.ms-header');
        expect(header).toBeTruthy();
    });

    it('shouldn\'t render the header when container is not visible', () => {
        const props = { ...defaultProps };
        props.isVisible = false;
        ReactDOM.render(<DynamicLegend {...props} />, container);
        const componentContainer = container.querySelector('#dynamic-legend-container');
        const header = componentContainer.querySelector('.ms-header');
        expect(header).toBe(null);
    });

    it('should render layers tree', () => {
        ReactDOM.render(<DynamicLegend {...defaultProps} />, container);
        const layerTreeIsExisting = container.querySelectorAll('.ms-layers-tree');
        expect(layerTreeIsExisting).toBeTruthy();
    });
});
