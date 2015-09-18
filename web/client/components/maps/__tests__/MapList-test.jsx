/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var MapList = require('../MapList.jsx');
var expect = require('expect');

describe('This test for MapList', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const mapList = React.render(<MapList/>, document.body);
        expect(mapList).toExist();

        const dom = React.findDOMNode(mapList);
        expect(dom).toExist();
        // check body existence
        const panelBody = dom.getElementsByClassName('panel-body');
        expect(panelBody.length).toBe(1);
        // check missing header
        const headings = dom.getElementsByClassName('panel-heading');
        expect(headings.length).toBe(0);
    });

    it('checks properties', () => {
        const testTitle = "testTitle";
        const mapList = React.render(<MapList panelProps={{header: testTitle}}/>, document.body);
        expect(mapList).toExist();

        const dom = React.findDOMNode(mapList);
        expect(dom).toExist();
        // check body
        const panelBody = dom.getElementsByClassName('panel-body');
        expect(panelBody.length).toBe(1, "Panel Body Missing");

        // check header
        const headings = dom.getElementsByClassName('panel-heading');
        expect(headings.length).toBe(1, "Panel Heading Missing");
        expect(headings[0].innerHTML).toBe(testTitle, "Panel Heading Incorrect");
    });

    it('checks data', () => {
        var map1 = {id: 1, name: "a", description: "description"};
        var map2 = {id: 2, name: "b", description: "description"};
        const mapList = React.render(<MapList maps={[map1, map2]}/>, document.body);
        expect(mapList).toExist();
        const dom = React.findDOMNode(mapList);
        expect(dom).toExist();

        // check body
        const panelBody = dom.getElementsByClassName('panel-body');
        expect(panelBody.length).toBe(1, "Panel Body Missing");

        // check list
        const list = panelBody[0].getElementsByTagName("ul");
        expect(list.length).toBe(1, " list missing");

        // check child number
        expect(list[0].childNodes.length).toBe(2);
    });
});
