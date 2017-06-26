/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const CesiumTooltip = require('../steps/CesiumTooltip');

describe("Test the Cesium tooltip component", () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        expect.restoreSpies();
        setTimeout(done);
    });

    it('test default component', () => {
        const cmp = ReactDOM.render(<CesiumTooltip/>, document.getElementById("container"));
        expect(cmp).toExist();
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(1);
        const tr = domNode.getElementsByTagName('TR');
        expect(tr.length).toBe(5);

    });

    it('test default component with touch', () => {
        const cmp = ReactDOM.render(<CesiumTooltip touch/>, document.getElementById("container"));
        expect(cmp).toExist();
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(1);
        const tr = domNode.getElementsByTagName('TR');
        expect(tr.length).toBe(7);
    });

});
