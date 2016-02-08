/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const QueryBuilder = require('../QueryBuilder.jsx');
const expect = require('expect');

describe('QueryBuilder', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the QueryBuilder component with his default content', () => {
        const querybuilder = ReactDOM.render(<QueryBuilder/>, document.getElementById("container"));
        expect(querybuilder).toExist();
    });

    it('creates the QueryBuilder component with initial content', () => {
        const filterFields = [{
            rowId: 100,
            attribute: "",
            operator: null,
            value: null,
            exception: null
        }, {
            rowId: 200,
            attribute: "Attribute",
            operator: "=",
            value: "attribute1",
            exception: null
        }];

        const attributes = [{
            id: "Attribute",
            type: "list",
            values: [
                "attribute1",
                "attribute2",
                "attribute3",
                "attribute4",
                "attribute5"
            ]
        }];

        const querybuilder = ReactDOM.render(
            <QueryBuilder
                filterFields={filterFields}
                attributes={attributes}
            />,
            document.getElementById("container")
        );

        expect(querybuilder).toExist();
        expect(querybuilder.props.filterFields).toExist();
        expect(querybuilder.props.filterFields.length).toBe(2);
        expect(querybuilder.props.attributes).toExist();
        expect(querybuilder.props.attributes.length).toBe(1);

        const queryBuilderDOMNode = expect(ReactDOM.findDOMNode(querybuilder));

        expect(queryBuilderDOMNode).toExist();
        let childNodes = queryBuilderDOMNode.actual.childNodes;
        expect(childNodes.length).toBe(3);

        for (let i = 0; i < childNodes.length; i++) {
            let child = childNodes[i];
            expect(child.className === "row" || child.className === "btn btn-default").toBe(true);
            expect(child.tagName === "DIV" || child.tagName === "BUTTON").toBe(true);
        }

        const addNewRow = document.getElementsByClassName('btn btn-default')[0];
        addNewRow.click();

        childNodes = queryBuilderDOMNode.actual.childNodes;
        expect(childNodes.length).toBe(3);

    });
});
