/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import BuilderHeader from '../BuilderHeader';
describe('BuilderHeader component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('BuilderHeader rendering with defaults', () => {
        ReactDOM.render(<BuilderHeader />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widgets-builder-header');
        expect(el).toExist();
    });
    it('Test BuilderHeader onClose', () => {
        const actions = {
            onClose: () => {}
        };
        const spyonClose = expect.spyOn(actions, 'onClose');
        ReactDOM.render(<BuilderHeader onClose={actions.onClose} />, document.getElementById("container"));
        const btn = document.querySelector('.ms-close');
        ReactTestUtils.Simulate.click(btn); // <-- trigger event callback
        expect(spyonClose).toHaveBeenCalled();
    });
    it('filter button not present on first step', () => {
        ReactDOM.render(<BuilderHeader step={0} />, document.getElementById("container"));
        const btn = document.querySelector('.glyphicon-filter');
        expect(btn).toNotExist();
    });
});
