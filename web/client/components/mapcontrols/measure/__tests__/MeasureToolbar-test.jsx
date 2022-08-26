/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import MeasureToolbar from '../MeasureToolbar';

describe("MeasureToolbar", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default values', () => {
        ReactDOM.render(<MeasureToolbar/>, document.getElementById("container"));
        const toolbar = document.querySelector('.ms-measure-toolbar');
        expect(toolbar).toBeTruthy();
        const icon = toolbar.querySelector('.ms-measure-icon');
        expect(icon).toBeTruthy();
        const info = toolbar.querySelector('.ms-measure-info');
        expect(info).toBeTruthy();
    });
    it('should render with default values', () => {
        ReactDOM.render(<MeasureToolbar info={<div className="test-info"></div>}><div className="test-children"></div></MeasureToolbar>, document.getElementById("container"));
        const toolbar = document.querySelector('.ms-measure-toolbar');
        expect(toolbar).toBeTruthy();
        const testChildren = toolbar.querySelector('.test-children');
        expect(testChildren).toBeTruthy();
        const info = toolbar.querySelector('.ms-measure-info');
        expect(info).toBeTruthy();
        const testInfo = info.querySelector('.test-info');
        expect(testInfo).toBeTruthy();
    });
});
