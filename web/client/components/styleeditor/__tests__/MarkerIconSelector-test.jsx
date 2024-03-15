/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import MarkerIconSelector from '../MarkerIconSelector';
import { Simulate } from 'react-dom/test-utils';
import expect from 'expect';

describe('MarkerIconSelector component', () => {
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
        ReactDOM.render(<MarkerIconSelector />, document.getElementById("container"));
        const markerIconSelectorNode = document.querySelector('.ms-mark-preview');
        expect(markerIconSelectorNode).toBeTruthy();
    });
    it('should return changed value with onChange', (done) => {
        ReactDOM.render(<MarkerIconSelector onChange={(value) => {
            try {
                expect(value).toEqual({
                    name: 'msMarkerIcon',
                    args: [ {
                        color: 'red',
                        shape: 'circle',
                        glyph: undefined
                    } ] });
            } catch (e) {
                done(e);
            }
            done();
        }}/>, document.getElementById("container"));
        const markerIconSelectorNode = document.querySelector('.ms-mark-preview');
        expect(markerIconSelectorNode).toBeTruthy();
        Simulate.click(markerIconSelectorNode);
        const markSelectorListNode = document.querySelector('.ms-mark-list');
        expect(markSelectorListNode).toBeTruthy();
        const markSelectorListButtonsNodes = [...document.querySelectorAll('.ms-mark-list button')];
        expect(markSelectorListButtonsNodes.length).toBe(56);
        Simulate.click(markSelectorListButtonsNodes[0]);
    });
});
