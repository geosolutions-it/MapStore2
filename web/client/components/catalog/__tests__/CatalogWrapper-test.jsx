/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import CatalogWrapper from '../datasets/CatalogWrapper';

describe('CatalogWrapper component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render when active', () => {
        ReactDOM.render(<CatalogWrapper active><div id="child" /></CatalogWrapper>, document.getElementById('container'));
        const wrapper = document.querySelector('.ms-catalog-wrapper');
        expect(wrapper).toBeTruthy();
        expect(document.querySelector('#child')).toBeTruthy();
    });
    it('should not render when inactive', () => {
        ReactDOM.render(<CatalogWrapper active={false}><div id="child" /></CatalogWrapper>, document.getElementById('container'));
        const wrapper = document.querySelector('.ms-catalog-wrapper');
        expect(wrapper).toBeFalsy();
    });
    it('should render in dock panel mode', () => {
        ReactDOM.render(<CatalogWrapper active isPanel><div id="child" /></CatalogWrapper>, document.getElementById('container'));
        const wrapper = document.querySelector('.ms-catalog-panel');
        const sidePanel = document.querySelector('.ms-side-panel');
        expect(wrapper).toBeTruthy();
        expect(sidePanel).toBeTruthy();
        expect(document.querySelector('#child')).toBeTruthy();
    });
});
