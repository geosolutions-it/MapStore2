/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var ResourceCard = require('../ResourceCard.jsx');
var expect = require('expect');

const TestUtils = require('react-dom/test-utils');

describe('This test for ResourceCard', () => {
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
        const mapItem = ReactDOM.render(<ResourceCard map={{}} />, document.getElementById("container"));
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
        const mapItem = ReactDOM.render(<ResourceCard resource={{ name: testName, description: testDescription }} />, document.getElementById("container"));
        expect(mapItem).toExist();

        const mapItemDom = ReactDOM.findDOMNode(mapItem);
        expect(mapItemDom).toExist();

        expect(mapItemDom.className).toBe('gridcard map-thumb');
        const headings = mapItemDom.getElementsByClassName('gridcard-title');
        expect(headings.length).toBe(1);
        expect(headings[0].innerHTML).toBe(testName);
    });

    it('test edit/delete', () => {
        const testName = "test";
        const testDescription = "testDescription";

        const handlers = {
            viewerUrl: () => { },
            onEdit: () => { },
            onDelete: () => { }
        };


        let spyonEdit = expect.spyOn(handlers, "onEdit");
        let spyonDelete = expect.spyOn(handlers, "onDelete");
        const component = ReactDOM.render(<ResourceCard
            viewerUrl={handlers.viewerUrl}
            onDelete={handlers.onDelete}
            onEdit={handlers.onEdit}
            resource={{ canEdit: true, id: 1, name: testName, description: testDescription }} />, document.getElementById("container"));
        const buttons = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'button'
        );
        expect(buttons.length).toBe(2);
        buttons.forEach(b => TestUtils.Simulate.click(b));
        expect(spyonEdit.calls.length).toEqual(1);
        // wait for confirm
        expect(spyonDelete.calls.length).toEqual(0);
        expect(document.querySelector('.modal-details-sheet-confirm')).toExist();
        const confirmBtn = document.querySelectorAll('.modal-footer .btn-default')[1];
        expect(confirmBtn).toExist();
        TestUtils.Simulate.click(confirmBtn);
        expect(spyonDelete.calls.length).toEqual(1);

    });
});
