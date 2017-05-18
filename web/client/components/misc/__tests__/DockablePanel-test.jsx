/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require("react");
const expect = require('expect');
const ReactDOM = require('react-dom');
const DockablePanel = require('../DockablePanel');

const defaultProps = {
    dockSize: 0.35,
    wrappedComponent: null,
    position: "bottom",
    maxDockSize: 1.0,
    minDockSize: 0.1,
    setDockSize: () => {}
};
describe("Test DockablePanel Component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Test DockablePanel rendering without tools', () => {
        let comp = ReactDOM.render(
            <DockablePanel {...defaultProps}/>, document.getElementById("container"));
        expect(comp).toExist();

    });


});
