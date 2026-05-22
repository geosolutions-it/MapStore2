/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import CRSSelector from '../CRSSelector';
import TestUtils from 'react-dom/test-utils';
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

        ReactDOM.render(<CRSSelector enabled {...crsOptions}/>, document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        expect(cmpDom).toExist();

        const select = cmpDom.getElementsByTagName("select").item(0);
        const opts = select.childNodes;
        expect(opts.length).toBe(1);

    });

    it('checks if a change of the combo fires the proper action', () => {
        let newCRS;
        ReactDOM.render(<CRSSelector enabled {...crsOptions} onCRSChange={ (crs) => {newCRS = crs; }}/>, document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        const select = cmpDom.getElementsByTagName("select").item(0);

        select.value = "EPSG:4326";
        TestUtils.Simulate.change(select, {target: {value: 'EPSG:4326'}});

        expect(newCRS).toBe('EPSG:4326');
    });

    it('uses availableProjections when provided', () => {
        const availableProjections = [
            { value: 'EPSG:3857', label: 'Web Mercator' },
            { value: 'EPSG:3003', label: 'Monte Mario' }
        ];
        ReactDOM.render(
            <CRSSelector
                enabled
                availableProjections={availableProjections}
                crs="EPSG:3857"
            />,
            document.getElementById('container')
        );

        const cmpDom = document.getElementById('container');
        const select = cmpDom.getElementsByTagName('select').item(0);
        const opts = select.childNodes;
        expect(opts.length).toBe(2);
        expect(opts[0].value).toBe('EPSG:3857');
        expect(opts[0].textContent).toBe('Web Mercator');
        expect(opts[1].value).toBe('EPSG:3003');
        expect(opts[1].textContent).toBe('Monte Mario');
    });
});
