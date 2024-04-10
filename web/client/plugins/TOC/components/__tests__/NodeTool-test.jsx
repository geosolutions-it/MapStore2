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
import NodeTool from '../NodeTool';

describe('NodeTool', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render a glyph with defaults', () => {
        ReactDOM.render(<NodeTool />, document.getElementById("container"));
        expect(document.querySelector('button')).toBeFalsy();
        expect(document.querySelector('.glyphicon')).toBeTruthy();
    });
    it('should render a button with onClick', () => {
        ReactDOM.render(<NodeTool onClick={() => {}}/>, document.getElementById("container"));
        expect(document.querySelector('button')).toBeTruthy();
        expect(document.querySelector('.glyphicon')).toBeTruthy();
    });
});
