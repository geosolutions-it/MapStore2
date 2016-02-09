/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var ReactDOM = require('react-dom');
var SnapshotIcon = require('../SnapshotIcon');
const defaultIcon = require('../../spinners/InlineSpinner/img/spinner.gif');
describe("test the SnapshotIcon", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        const tb = ReactDOM.render(<SnapshotIcon />, document.getElementById("container"));
        expect(tb).toExist();

    });

    it('test component to draw loading img', () => {
        const tb = ReactDOM.render(<SnapshotIcon status="SHOTING" />, document.getElementById("container"));
        expect(tb).toExist();
        const img = ReactDOM.findDOMNode(tb);
        expect(img).toExist();
        expect(img.src === defaultIcon).toBe(true);

    });

});
