/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import LayerOverridesNode from '../LayerOverridesNode';
import expect from 'expect';

describe('LayerOverridesNode component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        ReactDOM.render(<LayerOverridesNode />, document.getElementById("container"));
        const layerNode = document.querySelector('.ms-map-views-layer-node');
        expect(layerNode).toBeTruthy();
    });
    it('should display three buttons for changed layers', () => {
        ReactDOM.render(<LayerOverridesNode
            layer={{
                type: 'wms',
                changed: true
            }}
        />, document.getElementById("container"));
        const layerNode = document.querySelector('.ms-map-views-layer-node.changed');
        expect(layerNode).toBeTruthy();
        const buttonNodes = document.querySelectorAll('button');
        expect(buttonNodes.length).toBe(3);
    });
    it('should display clipping opacity option for layers', () => {
        ReactDOM.render(<LayerOverridesNode
            layer={{
                type: 'wms'
            }}
            initialExpanded
        />, document.getElementById("container"));
        const layerNode = document.querySelector('.ms-map-views-layer-node');
        expect(layerNode).toBeTruthy();
        const buttonNodes = document.querySelectorAll('button');
        expect(buttonNodes.length).toBe(2);
        const inputNodes = document.querySelectorAll('input');
        expect(inputNodes.length).toBe(1);
    });
    it('should display clipping options for 3D tiles', () => {
        ReactDOM.render(<LayerOverridesNode
            layer={{
                type: '3dtiles'
            }}
            initialExpanded
        />, document.getElementById("container"));
        const layerNode = document.querySelector('.ms-map-views-layer-node');
        expect(layerNode).toBeTruthy();
        const buttonNodes = document.querySelectorAll('button');
        expect(buttonNodes.length).toBe(2);
        const selectNodes = document.querySelectorAll('.Select');
        expect(selectNodes.length).toBe(2);
        const inputNodes = document.querySelectorAll('input');
        expect(inputNodes.length).toBe(2);
        expect([...inputNodes].map(node => node.getAttribute('type')))
            .toEqual([ null, 'checkbox' ]);
    });
});
