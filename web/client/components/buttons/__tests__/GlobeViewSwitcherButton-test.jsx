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
var GlobeViewSwitcherButton = require('../GlobeViewSwitcherButton');

describe("test the GlobeViewSwitcherButton", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test default properties', () => {
        const tb = ReactDOM.render(<GlobeViewSwitcherButton/>, document.getElementById("container"));
        expect(tb).toExist();

        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toExist();
        expect(tbNode.id).toBe('globeviewswitcher-btn');
        expect(tbNode).toExist();
        expect(tbNode.className.indexOf('primary') >= 0).toBe(true);
    });
});
