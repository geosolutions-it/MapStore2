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
import VisibilityCheck from '../VisibilityCheck';
import { Simulate } from 'react-dom/test-utils';

describe('VisibilityCheck', () => {
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
        ReactDOM.render(<VisibilityCheck />, document.getElementById("container"));
        expect(document.querySelector('.ms-visibility-check')).toBeTruthy();
    });
    it('should render checkbox icon with mutuallyExclusive set false', () => {
        ReactDOM.render(<VisibilityCheck mutuallyExclusive={false} />, document.getElementById("container"));
        expect(document.querySelector('.ms-visibility-check')).toBeTruthy();
        expect(document.querySelector('.glyphicon-checkbox-off')).toBeTruthy();
        ReactDOM.render(<VisibilityCheck value mutuallyExclusive={false} />, document.getElementById("container"));
        expect(document.querySelector('.glyphicon-checkbox-on')).toBeTruthy();
    });
    it('should render radio icon with mutuallyExclusive set true', () => {
        ReactDOM.render(<VisibilityCheck mutuallyExclusive />, document.getElementById("container"));
        expect(document.querySelector('.ms-visibility-check')).toBeTruthy();
        expect(document.querySelector('.glyphicon-radio-off')).toBeTruthy();
        ReactDOM.render(<VisibilityCheck value mutuallyExclusive />, document.getElementById("container"));
        expect(document.querySelector('.glyphicon-radio-on')).toBeTruthy();
    });
    it('should not render with hide prop set true', () => {
        ReactDOM.render(<VisibilityCheck hide />, document.getElementById("container"));
        expect(document.querySelector('.ms-visibility-check')).toBeFalsy();
    });
    it('should trigger onChange if clicked', (done) => {
        ReactDOM.render(<VisibilityCheck onChange={(visibility) => {
            expect(visibility).toBe(true);
            done();
        }} />, document.getElementById("container"));
        const button = document.querySelector('.ms-visibility-check');
        expect(button).toBeTruthy();
        Simulate.click(button);
    });
});
