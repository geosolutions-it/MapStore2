/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var MapItem = require('../MapItem.jsx');
var expect = require('expect');

describe('This test for MapItem', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const mapItem = React.render(<MapItem/>, document.body);
        expect(mapItem).toExist();

        const mapItemDom = React.findDOMNode(mapItem);
        expect(mapItemDom).toExist();

        expect(mapItemDom.className).toBe('list-group-item');
        const headings = mapItemDom.getElementsByClassName('list-group-item-heading');
        expect(headings.length).toBe(0);
    });
    // test DEFAULTS
    it('creates the component with data', () => {
        const testName = "test";
        const testDescription = "testDescription";
        const mapItem = React.render(<MapItem name={testName} description={testDescription}/>, document.body);
        expect(mapItem).toExist();

        const mapItemDom = React.findDOMNode(mapItem);
        expect(mapItemDom).toExist();

        expect(mapItemDom.className).toBe('list-group-item');
        const headings = mapItemDom.getElementsByClassName('list-group-item-heading');
        expect(headings.length).toBe(1);
        expect(headings[0].innerHTML).toBe(testName);
    });
});
