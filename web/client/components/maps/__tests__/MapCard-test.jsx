/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var MapCard = require('../MapCard.jsx');
var expect = require('expect');

const TestUtils = require('react-dom/test-utils');

describe('This test for MapCard', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const mapItem = ReactDOM.render(<MapCard map={{}}/>, document.getElementById("container"));
        expect(mapItem).toExist();

        const mapItemDom = ReactDOM.findDOMNode(mapItem);
        expect(mapItemDom).toExist();

        expect(mapItemDom.className).toBe('gridcard map-thumb');
        const headings = mapItemDom.getElementsByClassName('gridcard-title');
        expect(headings.length).toBe(1);
    });
    // test DEFAULTS
    it('creates the component with data', () => {
        const testName = "test";
        const testDescription = "testDescription";
        const mapItem = ReactDOM.render(<MapCard map={{name: testName, description: testDescription}}/>, document.getElementById("container"));
        expect(mapItem).toExist();

        const mapItemDom = ReactDOM.findDOMNode(mapItem);
        expect(mapItemDom).toExist();

        expect(mapItemDom.className).toBe('gridcard map-thumb');
        const headings = mapItemDom.getElementsByClassName('gridcard-title');
        expect(headings.length).toBe(1);
        expect(headings[0].innerHTML).toBe(testName);
    });

    it('test viewer url', () => {
        const testName = "test";
        const testDescription = "testDescription";
        var component = TestUtils.renderIntoDocument(<MapCard viewerUrl="viewer" id={1} map={{id: 1, name: testName, description: testDescription}} mapType="leaflet"/>);
        const handlers = {
            onclick: () => {}
        };
        const buttonLink = TestUtils.findRenderedDOMComponentWithTag(
           component, 'button'
        );
        expect(buttonLink).toExist();
        let spy = expect.spyOn(handlers, "onclick");
        component = TestUtils.renderIntoDocument(<MapCard id={1} viewerUrl={handlers.onclick} map={{id: 1, name: testName, description: testDescription}} mapType="leaflet" />);
        const button = TestUtils.findRenderedDOMComponentWithTag(
           component, 'button'
        );
        TestUtils.Simulate.click(button);
        expect(button).toExist();
        expect(spy.calls.length).toEqual(1);
    });
    it('test edit/delete', () => {
        const testName = "test";
        const testDescription = "testDescription";

        const handlers = {
            viewerUrl: () => {},
            onEdit: () => {},
            onMapDelete: () => {}
        };

        let spyviewerUrl = expect.spyOn(handlers, "viewerUrl");
        let spyonEdit = expect.spyOn(handlers, "onEdit");
        let spyonMapDelete = expect.spyOn(handlers, "onMapDelete");
        const component = ReactDOM.render(<MapCard id={1}
            viewerUrl={handlers.viewerUrl}
            onMapDelete={handlers.onMapDelete}
            onEdit={handlers.onEdit}
            map={{canEdit: true, id: 1, name: testName, description: testDescription}} mapType="leaflet" />, document.getElementById("container"));
        const buttons = TestUtils.scryRenderedDOMComponentsWithTag(
           component, 'button'
        );
        expect(buttons.length).toBe(3);
        buttons.forEach(b => TestUtils.Simulate.click(b));

        expect(spyviewerUrl.calls.length).toEqual(1);
        expect(spyonEdit.calls.length).toEqual(1);
        // wait for confirm
        expect(spyonMapDelete.calls.length).toEqual(0);
    });
});
