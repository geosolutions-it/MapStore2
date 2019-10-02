/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');

const expect = require('expect');
const SwitchToolbar = require('../SwitchToolbar').default;
describe('SwitchToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('SwitchToolbar rendering with defaults', () => {
        ReactDOM.render(<SwitchToolbar />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('button');
        expect(el).toExist();
    });
    it('Test SwitchToolbar onClick', () => {
        const actions = {
            onClick: () => {}
        };
        const spyonClick = expect.spyOn(actions, 'onClick');
        ReactDOM.render(<SwitchToolbar onClick={actions.onClick} />, document.getElementById("container"));
        const input = document.getElementsByTagName('button')[0];
        expect(input).toExist();
        ReactTestUtils.Simulate.click(input);
        expect(spyonClick).toHaveBeenCalled();
    });
});
