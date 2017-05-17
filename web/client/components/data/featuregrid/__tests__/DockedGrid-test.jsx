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
const DockedGrid = require('../DockedGrid');
const FeatureDockedGrid = require('../FeatureDockedGrid');

const defaultProps = {
    dockSize: 0.35,
    featureDockedGrid: FeatureDockedGrid,
    position: "bottom",
    maxDockSize: 1.0,
    minDockSize: 0.1,
    setDockSize: () => {}
};
describe("Test DockedGrid Component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Test DockedGrid rendering without tools', () => {
        let comp = ReactDOM.render(
            <DockedGrid {...defaultProps}/>, document.getElementById("container"));
        expect(comp).toExist();

    });
    it('Test DockedGrid rendering with 1 added tool', () => {
        let comp = ReactDOM.render(
            <DockedGrid
                {...defaultProps}
                toolbar={{zoom: true}}
                />, document.getElementById("container"));
        expect(comp).toExist();
    });


});
