/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import GlobeTranslucencySection from '../GlobeTranslucencySection';
import expect from 'expect';

describe('GlobeTranslucencySection component', () => {
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
        ReactDOM.render(<GlobeTranslucencySection />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
    });
    it('should display five inputs if expanded', () => {
        ReactDOM.render(<GlobeTranslucencySection expandedSections={{ translucency: true }}/>, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const inputNodes = document.querySelectorAll('input');
        expect(inputNodes.length).toBe(5);
        expect([...inputNodes].map(node => node.getAttribute('type')))
            .toEqual([ 'checkbox', 'number', 'checkbox', 'number', 'number' ]);
    });
});
