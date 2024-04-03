/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ExpandButton from '../ExpandButton';
import { Simulate } from 'react-dom/test-utils';

describe('ExpandButton', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with defaults', () => {
        ReactDOM.render(<ExpandButton />, document.getElementById("container"));
        expect(document.querySelector('.ms-node-expand')).toBeTruthy();
    });
    it('should render with expanded false', () => {
        ReactDOM.render(<ExpandButton expanded={false}/>, document.getElementById("container"));
        expect(document.querySelector('.ms-node-expand')).toBeTruthy();
        expect(document.querySelector('.glyphicon-next')).toBeTruthy();
    });
    it('should render with expanded true', () => {
        ReactDOM.render(<ExpandButton expanded/>, document.getElementById("container"));
        expect(document.querySelector('.ms-node-expand')).toBeTruthy();
        expect(document.querySelector('.glyphicon-bottom')).toBeTruthy();
    });
    it('should trigger onChange if clicked', (done) => {
        ReactDOM.render(<ExpandButton expanded onChange={(value) => {
            expect(value.expanded).toBe(false);
            done();
        }}/>, document.getElementById("container"));
        const button = document.querySelector('.ms-node-expand');
        expect(button).toBeTruthy();
        Simulate.click(button);
    });
    it('should not render if hide is true', () => {
        ReactDOM.render(<ExpandButton hide/>, document.getElementById("container"));
        expect(document.querySelector('.ms-node-expand')).toBeFalsy();
    });
});
