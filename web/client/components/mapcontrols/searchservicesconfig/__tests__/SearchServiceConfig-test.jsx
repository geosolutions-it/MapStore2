/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

var expect = require('expect');

var React = require('react');
var ReactDOM = require('react-dom');
var ResultsProps = require('../ResultsProps');
var ServicesList = require('../ServicesList');
var WFSOptionalProps = require('../WFSOptionalProps');
var WFSServiceProps = require('../WFSServiceProps');


describe("test text search service config components", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test Result Props creation', () => {
        const tb = ReactDOM.render(<ResultsProps.Element/>, document.getElementById("container"));
        expect(tb).toExist();
    });
    it('test Services List creation', () => {
        const tb = ReactDOM.render(<ServicesList.Element/>, document.getElementById("container"));
        expect(tb).toExist();
    });
    it('test WFS optional props creation', () => {
        const tb = ReactDOM.render(<WFSOptionalProps.Element/>, document.getElementById("container"));
        expect(tb).toExist();
    });
    it('test WFS serivece props creation', () => {
        const tb = ReactDOM.render(<WFSServiceProps.Element/>, document.getElementById("container"));
        expect(tb).toExist();
    });

});
