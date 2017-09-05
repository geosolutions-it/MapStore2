/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react');
var ReactDOM = require('react-dom');
var CRSSelector = require('../CRSSelector');

const TestUtils = require('react-dom/test-utils');
const crsOptions = {
    availableCRS: {
        "EPSG:4326": {label: "EPSG:4326"}
    },
    filterAllowedCRS: ["EPSG:4326"],
    additionalCRS: {},
    projectionDefs: []
};
describe('CRSSelector', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks default', () => {

        const cmp = ReactDOM.render(<CRSSelector enabled {...crsOptions}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const select = cmpDom.getElementsByTagName("select").item(0);
        const opts = select.childNodes;
        expect(opts.length).toBe(1);

    });

    it('checks if a change of the combo fires the proper action', () => {
        let newCRS;
        const cmp = ReactDOM.render(<CRSSelector enabled {...crsOptions} onCRSChange={ (crs) => {newCRS = crs; }}/>, document.getElementById("container"));
        const cmpDom = ReactDOM.findDOMNode(cmp);
        const select = cmpDom.getElementsByTagName("select").item(0);

        select.value = "EPSG:4326";
        TestUtils.Simulate.change(select, {target: {value: 'EPSG:4326'}});

        expect(newCRS).toBe('EPSG:4326');
    });
});
