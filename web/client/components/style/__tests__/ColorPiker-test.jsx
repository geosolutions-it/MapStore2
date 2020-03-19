
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ColorPicker from '../ColorPicker';

describe("Test the ColorPicker style component", () => {
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
        ReactDOM.render(<ColorPicker line/>, document.getElementById("container"));
        const cmp = document.querySelector('.ms-color-picker');
        expect(cmp).toExist();
    });
    it('should apply disabled class', () => {
        ReactDOM.render(<ColorPicker disabled/>, document.getElementById("container"));
        const cmp = document.querySelector('.ms-color-picker.ms-disabled');
        expect(cmp).toExist();
    });
});
