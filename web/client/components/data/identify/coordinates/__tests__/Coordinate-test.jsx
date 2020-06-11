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
const Coordinate = require('../Coordinate');
describe('Identify Coordinate component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Coordinate rendering with defaults', () => {
        ReactDOM.render(<Coordinate />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.coordinates-text');
        expect(el).toExist();
    });
    it('Coordinate rendering with content', () => {
        ReactDOM.render(<Coordinate coordinate={{lat: 1, lon: 1}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-coordinates-decimal');
        expect(el).toExist();
    });
    it('Coordinate edit mode', () => {
        ReactDOM.render(<Coordinate edit coordinate={{ lat: 1, lon: 1 }} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.coord-editor');
        expect(el).toExist();
    });
    it('Test Editor onChangeFormat correctly passed', () => {
        const actions = {
            onChangeFormat: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChangeFormat');
        ReactDOM.render(<Coordinate edit onChangeFormat={actions.onChangeFormat} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector('a > span')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
    });
});
