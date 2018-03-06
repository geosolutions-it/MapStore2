/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const expect = require('expect');
const ReactDOM = require('react-dom');
const DockablePanel = require('../DockablePanel');

describe("test DockablePanel", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test as modal', () => {
        ReactDOM.render(<DockablePanel show/>, document.getElementById("container"));
        const modal = document.getElementsByClassName('ms-resizable-modal')[0];
        expect(modal).toExist();
        const dock = document.getElementsByClassName('ms-side-panel')[0];
        expect(dock).toNotExist();
    });

    it('test as dock', () => {
        ReactDOM.render(<DockablePanel dock/>, document.getElementById("container"));
        const modal = document.getElementsByClassName('ms-resizable-modal')[0];
        expect(modal).toNotExist();
        const dock = document.getElementsByClassName('ms-side-panel')[0];
        expect(dock).toExist();
    });
});
