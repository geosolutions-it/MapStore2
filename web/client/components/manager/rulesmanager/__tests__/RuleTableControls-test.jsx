/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react/addons');
var ReactDOM = require('react-dom');
var RulesTableControls = require('../RulesTableControls.jsx');
var expect = require('expect');

describe('test rules table controls component', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the component with defaults', () => {
        const rulesTableCotnrols = ReactDOM.render(<RulesTableControls/>, document.getElementById("container"));
        expect(rulesTableCotnrols).toExist();

        const dom = ReactDOM.findDOMNode(rulesTableCotnrols);
        expect(dom).toExist();

        const table = dom.getElementsByClassName('btn');
        expect(table.length).toBe(1);
    });
});
