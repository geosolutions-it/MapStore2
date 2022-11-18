/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PositionsSection from '../PositionsSection';
import expect from 'expect';
import { Simulate } from 'react-dom/test-utils';

describe('PositionsSection component', () => {
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
        ReactDOM.render(<PositionsSection />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
    });
    it('should display six inputs if expanded', () => {
        ReactDOM.render(<PositionsSection computeViewCoordinates={value => value} expandedSections={{ positions: true }}/>, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const inputNodes = document.querySelectorAll('input');
        expect(inputNodes.length).toBe(6);
        expect([...inputNodes].map(node => node.getAttribute('type')))
            .toEqual([ 'number', 'number', 'number', 'number', 'number', 'number' ]);
    });
    it('should trigger on capture view', (done) => {
        ReactDOM.render(<PositionsSection
            view={{ id: 'view.01' }}
            expandedSections={{ positions: true }}
            onCaptureView={(currentView) => {
                expect(currentView).toEqual({ id: 'view.01' });
                done();
            }}
        />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const buttonNodes = [...document.querySelectorAll('button')];
        expect(buttonNodes.length).toBe(2);
        Simulate.click(buttonNodes[1]);
    });
});
