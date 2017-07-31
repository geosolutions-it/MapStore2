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
const OverlayProgressBar = require('../OverlayProgressBar');

describe("test the OverlayProgressBar", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test OverlayProgressBar starts loading', () => {
        const overlayProgressBar = ReactDOM.render(<OverlayProgressBar loading/>, document.getElementById("container"));
        expect(overlayProgressBar).toExist();
        const node = ReactDOM.findDOMNode(overlayProgressBar);
        expect(node.children.length).toBe(1);
    });

    it('test OverlayProgressBar stops loading', () => {
        const overlayProgressBar = ReactDOM.render(<OverlayProgressBar loading={false}/>, document.getElementById("container"));
        expect(overlayProgressBar).toExist();
        const node = ReactDOM.findDOMNode(overlayProgressBar);
        expect(node).toBe(null);
    });

});
