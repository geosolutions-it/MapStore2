/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import LayerOverridesNodeContent from '../LayerOverridesNodeContent';
import expect from 'expect';

describe('LayerOverridesNodeContent component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should not render with default', () => {
        ReactDOM.render(<LayerOverridesNodeContent />, document.getElementById("container"));
        expect(document.querySelector('#container').children.length).toBe(0);
    });
    it('should display clipping options for 3D tiles', () => {
        ReactDOM.render(<LayerOverridesNodeContent
            node={{
                type: '3dtiles'
            }}
        />, document.getElementById("container"));
        const layerNode = document.querySelector('.ms-map-views-layer-clipping');
        expect(layerNode).toBeTruthy();
        const selectNodes = document.querySelectorAll('.Select');
        expect(selectNodes.length).toBe(2);
        const inputNodes = document.querySelectorAll('input');
        expect(inputNodes.length).toBe(2);
        expect([...inputNodes].map(node => node.getAttribute('type')))
            .toEqual([ null, 'checkbox' ]);
    });
});
