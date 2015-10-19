/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var CRSSelector = require('../CRSSelector');

describe('CRSSelector', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks default', () => {

        const cmp = React.render(<CRSSelector enabled={true}/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const select = cmpDom.getElementsByTagName("select").item(0);
        const opts = select.childNodes;
        expect(opts.length).toBeGreaterThan(3);

    });

    it('checks if a change of the combo fires the proper action', () => {
        let newCRS;
        const cmp = React.render(<CRSSelector enabled={true} onCRSChange={ (crs) => {newCRS = crs; }}/>, document.body);
        const cmpDom = React.findDOMNode(cmp);
        const select = cmpDom.getElementsByTagName("select").item(0);

        select.value = "EPSG:4326";
        React.addons.TestUtils.Simulate.change(select, {target: {value: 'EPSG:4326'}});

        expect(newCRS).toBe('EPSG:4326');
    });
});
