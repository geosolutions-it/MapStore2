/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const SwitchPanel = require('../SwitchPanel');
describe('SwitchPanel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('SwitchPanel rendering with defaults', () => {
        ReactDOM.render(<SwitchPanel expanded><div id="content"></div></SwitchPanel>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-switch-panel');
        expect(el).toExist();
    });
    it('buttons, loading, error', () => {

        const container = document.getElementById('container');

        // render loading
        ReactDOM.render(<SwitchPanel expanded loading/>, document.getElementById("container"));
        expect(container.querySelector('.switch-loading')).toExist();

        // render error
        ReactDOM.render(<SwitchPanel error={{}}/>, document.getElementById("container"));
        expect(container.querySelector('.glyphicon-exclamation-mark')).toExist();

        // render clear filter
        ReactDOM.render(<SwitchPanel expanded buttons={[{glyph: "icon"}]} />, document.getElementById("container"));
        expect(container.querySelector('.glyphicon-icon')).toExist();
    });
    it('Test SwitchPanel onSwitch', () => {
        const actions = {
            onSwitch: () => {}
        };
        const spyonSwitch = expect.spyOn(actions, 'onSwitch');
        ReactDOM.render(<SwitchPanel onSwitch={actions.onSwitch} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector('.m-slider'));
        expect(spyonSwitch).toHaveBeenCalled();
    });
    it('Test SwitchPanel with toolbar', () => {
        ReactDOM.render(<SwitchPanel useToolbar />, document.getElementById("container"));
        const input = document.getElementsByTagName('button')[0];
        expect(input).toExist();
    });
});
