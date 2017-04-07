/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react');
var ReactDOM = require('react-dom');
var GoFullButton = require('../GoFullButton');

describe("test the GoFullButton", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test not showing', () => {
        const tb = ReactDOM.render(<GoFullButton/>, document.getElementById("container"));
        expect(tb).toExist();
        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toNotExist();
    });
    it('test showing on originalUrl property set', () => {
        const tb = ReactDOM.render(<GoFullButton originalUrl={"TEST"}/>, document.getElementById("container"));
        expect(tb).toExist();
        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toExist();
    });
    it('test showing on regex match', () => {
        const href = location.href;
        const tb = ReactDOM.render(<GoFullButton urlRegex={"(.*)"} urlReplaceString={"$1"}/>, document.getElementById("container"));
        expect(tb).toExist();
        expect(tb.generateUrl()).toBe(href);
        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toExist();
    });
});
