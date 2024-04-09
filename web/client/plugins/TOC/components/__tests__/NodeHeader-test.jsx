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
import NodeHeader from '../NodeHeader';

describe('NodeHeader', () => {
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
        ReactDOM.render(<NodeHeader />, document.getElementById("container"));
        expect(document.querySelector('.ms-node-header')).toBeTruthy();
    });
    it('should add content with beforeTitle and afterTitle', () => {
        ReactDOM.render(<NodeHeader
            beforeTitle={<div className="before" />}
            afterTitle={<div className="after" />}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-node-header')).toBeTruthy();
        const addons = document.querySelectorAll('.ms-node-header-addons');
        expect(addons.length).toBe(2);
        expect(addons[0].querySelector('.before')).toBeTruthy();
        expect(addons[1].querySelector('.after')).toBeTruthy();
    });
});
