/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');

const DateField = require('../DateField.jsx');

const expect = require('expect');

describe('DateField', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the DateField component with single date', () => {
        let operator = ">";
        let fieldName = "valueField";
        let fieldRowId = 200;
        let fieldValue = {startDate: new Date(86400000), endDate: null};

        const datefield = ReactDOM.render(
            <DateField attType="date"
                operator={operator}
                fieldName={fieldName}
                fieldRowId={fieldRowId}
                fieldValue={fieldValue}/>,
            document.getElementById("container")
        );
        expect(datefield).toBeTruthy();
        const dateFieldDOMNode = ReactDOM.findDOMNode(datefield);
        expect(dateFieldDOMNode).toBeTruthy();
        let childNodes = dateFieldDOMNode.getElementsByTagName('DIV');
        expect(childNodes.length).toBe(1);
        let dateRow = childNodes[0];
        expect(dateRow).toBeTruthy();
        expect(dateRow.childNodes.length).toBe(2);
    });

    it('creates the DateField component with date range', () => {
        let operator = "><";
        let fieldName = "valueField";
        let fieldRowId = 200;
        let fieldValue = {startDate: new Date(86400000), endDate: new Date(96400000)};

        const datefield = ReactDOM.render(
            <DateField attType="date"
                operator={operator}
                fieldName={fieldName}
                fieldRowId={fieldRowId}
                fieldValue={fieldValue}/>,
            document.getElementById("container")
        );
        expect(datefield).toBeTruthy();
        const dateFieldDOMNode = ReactDOM.findDOMNode(datefield);
        expect(dateFieldDOMNode).toBeTruthy();
        let childNodes = dateFieldDOMNode.getElementsByTagName('DIV');
        expect(childNodes.length).toBe(4);
        expect(dateFieldDOMNode.childNodes.length).toBe(2);
    });

    it('creates the DateField with date-time type', () => {
        let operator = ">";
        let fieldName = "valueField";
        let fieldRowId = 200;
        let fieldValue = {startDate: new Date(86400000), endDate: null};

        const datefield = ReactDOM.render(
            <DateField
                timeEnabled
                dateEnabled
                attType="date-time"
                operator={operator}
                fieldName={fieldName}
                fieldRowId={fieldRowId}
                fieldValue={fieldValue}/>,
            document.getElementById("container")
        );
        expect(datefield).toBeTruthy();
        const dateFieldDOMNode = ReactDOM.findDOMNode(datefield);
        expect(dateFieldDOMNode).toBeTruthy();
        let childNodes = dateFieldDOMNode.getElementsByTagName('DIV');
        expect(childNodes.length).toBe(1);
        let dateRow = childNodes[0];
        expect(dateRow).toBeTruthy();
        expect(dateRow.childNodes.length).toBe(2);
        const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(datefield, "button");
        expect(buttons.length).toBe(2);
        expect(buttons[0].title).toBe("Select Date");
        expect(buttons[1].title).toBe("Select Time");
    });

    it('creates the DateField with time type', () => {
        let operator = ">";
        let fieldName = "valueField";
        let fieldRowId = 200;
        let fieldValue = {startDate: new Date(86400000), endDate: null};

        const datefield = ReactDOM.render(
            <DateField
                timeEnabled
                dateEnabled={false}
                attType="time"
                operator={operator}
                fieldName={fieldName}
                fieldRowId={fieldRowId}
                fieldValue={fieldValue}/>,
            document.getElementById("container")
        );
        expect(datefield).toBeTruthy();
        const dateFieldDOMNode = ReactDOM.findDOMNode(datefield);
        expect(dateFieldDOMNode).toBeTruthy();
        let childNodes = dateFieldDOMNode.getElementsByTagName('DIV');
        expect(childNodes.length).toBe(1);
        let dateRow = childNodes[0];
        expect(dateRow).toBeTruthy();
        expect(dateRow.childNodes.length).toBe(2);
        const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(datefield, "button");
        expect(buttons.length).toBe(1);
        expect(buttons[0].title).toBe("Select Time");
    });
});
