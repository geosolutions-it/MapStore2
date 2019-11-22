/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const MapCard = require('../MapCard.jsx');
const expect = require('expect');

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

        expect(mapItemDom.childNodes[0].className).toBe('gridcard map-thumb');
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

        expect(mapItemDom.childNodes[0].className).toBe('gridcard map-thumb');
        const headings = mapItemDom.getElementsByClassName('gridcard-title');
        expect(headings.length).toBe(1);
        expect(headings[0].innerHTML).toBe(testName);
    });

    it('test details tool', () => {
        const testName = "test";
        const testDescription = "testDescription";
        let component = TestUtils.renderIntoDocument(<MapCard viewerUrl="viewer" id={1} map={{id: 1, name: testName, description: testDescription, details: null, canEdit: true}} shareToolEnabled={false}  mapType="leaflet"/>);
        const handlers = {
            onToggleDetailsSheet: () => {},
            onEdit: () => {}
        };
        let spy = expect.spyOn(handlers, "onToggleDetailsSheet");
        component = TestUtils.renderIntoDocument(<MapCard id={1} detailsSheetActions={{...handlers}} map={{id: 1, name: testName, description: testDescription, detailsText: "here some details", details: "here some details"}} shareToolEnabled={false} mapType="leaflet" />);
        const detailsTool = TestUtils.findRenderedDOMComponentWithTag(
            component, 'button'
        );
        expect(detailsTool).toExist();
        TestUtils.Simulate.click(detailsTool);
        expect(spy.calls.length).toEqual(1);
    });
    it('test edit/delete/share', () => {
        const testName = "test";
        const testDescription = "testDescription";

        const handlers = {
            viewerUrl: () => {},
            onEdit: () => {},
            onMapDelete: () => {},
            onShare: () => {}
        };


        let spyonEdit = expect.spyOn(handlers, "onEdit");
        let spyonMapDelete = expect.spyOn(handlers, "onMapDelete");
        let spyonShare = expect.spyOn(handlers, "onShare");
        const component = ReactDOM.render(<MapCard id={1}
            viewerUrl={handlers.viewerUrl}
            onMapDelete={handlers.onMapDelete}
            onEdit={handlers.onEdit}
            onShare={handlers.onShare}
            enableShareTool={false}
            map={{canEdit: true, id: 1, name: testName, description: testDescription}} mapType="leaflet" />, document.getElementById("container"));
        const buttons = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'button'
        );
        expect(buttons.length).toBe(3);
        buttons.forEach(b => TestUtils.Simulate.click(b));

        expect(spyonEdit.calls.length).toEqual(1);
        // wait for confirm
        expect(spyonMapDelete.calls.length).toEqual(0);
        expect(spyonShare.calls.length).toEqual(1);
    });
    it('test edit properties tool', () => {
        const testName = "test";
        const testDescription = "testDescription";

        const handlers = {
            onEdit: () => {}
        };

        let spy = expect.spyOn(handlers, "onEdit");
        const component = ReactDOM.render(<MapCard id={1}
            onEdit={handlers.onEdit}
            map={{canEdit: true, id: 1, name: testName, description: testDescription}} mapType="leaflet" />, document.getElementById("container"));
        const tools = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'button'
        );
        expect(tools.length).toBeGreaterThan(0);

        const wrenchTool = tools.find(tool => !!tool.querySelector('.glyphicon-wrench'));
        expect(wrenchTool).toExist();
        TestUtils.Simulate.click(wrenchTool);
        expect(spy.calls.length).toBe(1);
    });
    it('test edit properties tool with dashboard', () => {
        const testName = "test";
        const testDescription = "testDescription";

        const handlers = {
            onEdit: () => {}
        };

        let spy = expect.spyOn(handlers, "onEdit");
        const component = ReactDOM.render(<MapCard id={1}
            onEdit={handlers.onEdit}
            map={{canEdit: true, id: 1, name: testName, description: testDescription, category: {name: "DASHBOARD"}}} mapType="leaflet" />, document.getElementById("container"));
        const tools = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'button'
        );
        expect(tools.length).toBeGreaterThan(0);

        const wrenchTool = tools.find(tool => !!tool.querySelector('.glyphicon-wrench'));
        expect(wrenchTool).toExist();
        TestUtils.Simulate.click(wrenchTool);
        expect(spy.calls.length).toBe(1);
    });
});
