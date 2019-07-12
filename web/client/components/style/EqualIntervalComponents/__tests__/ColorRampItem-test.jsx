/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const ColorRampItem = require('../ColorRampItem');

describe("Test the ColorRampItem", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates colorRamp with defaults', () => {
        ReactDOM.render(<ColorRampItem />, document.getElementById("container"));
        const container = document.getElementById('container');
        const colorRamp = container.querySelector('.color-ramp-item');
        expect(colorRamp).toExist();
    });
    it('ColorRampItem with string item equal to blue', () => {
        ReactDOM.render(<ColorRampItem item="blue" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const colorRamp = container.querySelector('.colorname-cell');
        expect(colorRamp.innerHTML).toEqual('blue');
    });
    it('ColorRampItem with object item contain name', () => {
        const color = 'global.colors.blue';
        ReactDOM.render(<ColorRampItem item={{name: color}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const colorRamp = container.querySelector('span');
        expect(colorRamp.innerHTML).toEqual(color);
    });
    it('ColorRampItem with object item contain label', () => {
        const name = 'blue';
        const label = 'global.colors.blue';
        ReactDOM.render(<ColorRampItem item={{name, label}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const colorRamp = container.querySelector('span');
        expect(colorRamp.innerHTML).toEqual(label);
    });
});
