/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const OpacitySlider = require('../OpacitySlider');
const expect = require('expect');

describe('test OpacitySlider module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render component', () => {
        const cmp = ReactDOM.render(<OpacitySlider />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode).toExist();
        const target = document.getElementsByClassName('noUi-target');
        expect(target.length).toBe(1);
        expect(target[0].getAttribute('disabled')).toBe(null);
    });

    it('show tooltip', () => {
        const cmp = ReactDOM.render(<OpacitySlider opacity={0.6}/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode).toExist();
        const tooltips = document.getElementsByClassName('noUi-tooltip');
        expect(tooltips.length).toBe(1);
        expect(tooltips[0].innerHTML).toBe('60 %');
    });

    it('hide tooltip', () => {
        const cmp = ReactDOM.render(<OpacitySlider hideTooltip opacity={0.6}/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode).toExist();
        const tooltips = document.getElementsByClassName('noUi-tooltip');
        expect(tooltips.length).toBe(0);
    });

    it('disable component', () => {
        const cmp = ReactDOM.render(<OpacitySlider disabled opacity={0.6}/>, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode).toExist();
        const target = document.getElementsByClassName('noUi-target');
        expect(target.length).toBe(1);
        expect(target[0].getAttribute('disabled')).toBe('true');
    });
});
