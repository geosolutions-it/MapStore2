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
const Dialog = require('../Dialog');

describe("Dialog component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done ) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Dialog loading process for local vector', () => {
        ReactDOM.render(<Dialog id={"mapstore-shapefile-upload"} />, document.getElementById("container"));
        const container = document.getElementById("container");
        const loader = container.querySelector('.sk-circle-wrapper .sk-fade-in');
        expect(loader).toExist;
    });
});
