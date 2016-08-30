/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react/addons');
var ReactDOM = require('react-dom');
var RulesTable = require('../RulesTable.jsx');
var expect = require('expect');

describe('test rules table component', () => {

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
        const rulesTable = ReactDOM.render(<RulesTable/>, document.getElementById("container"));
        expect(rulesTable).toExist();

        const dom = ReactDOM.findDOMNode(rulesTable);
        expect(dom).toExist();

        const table = dom.getElementsByClassName('rules-table');
        expect(table.length).toBe(0);

        const rules = dom.getElementsByClassName('rule');
        expect(rules.length).toBe(0);
    });
});
