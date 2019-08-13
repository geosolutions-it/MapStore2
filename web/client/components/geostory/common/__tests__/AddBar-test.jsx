/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import expect from 'expect';
import AddBar from '../AddBar';
describe('AddBar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('AddBar rendering with defaults', () => {
        ReactDOM.render(<AddBar />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.add-bar');
        expect(el).toExist();
    });
    it('AddBar toggle popover and button click events', done => {
        ReactDOM.render(<AddBar buttons={[{glyph: "sheet", onClick: () => done()} ]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.add-bar button');
        expect(el).toExist();
        ReactTestUtils.Simulate.click(el);
        // check the popover is shown after click
        const popover = document.querySelector('.popover-content'); // the popover is rendered in document
        expect(popover).toExist();
        // emulate toolbar button click, done in click handler
        ReactTestUtils.Simulate.click(document.querySelector('.popover-content .glyphicon-sheet'));
    });
});
