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
import InlineLoader from '../InlineLoader';

describe('InlineLoader', () => {
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
        ReactDOM.render(<InlineLoader />, document.getElementById("container"));
        expect(document.querySelector('.inline-loader-container')).toBeTruthy();
        expect(document.querySelector('.inline-loader-bar').style.display).toBe('none');
    });
    it('should render with loading true', () => {
        ReactDOM.render(<InlineLoader loading/>, document.getElementById("container"));
        expect(document.querySelector('.inline-loader-container')).toBeTruthy();
        expect(document.querySelector('.inline-loader-bar').style.display).toBe('block');
    });
});
