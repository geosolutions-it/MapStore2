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

    it('creates the QueryBuilder with cascading', () => {
        const filterFields = [{
            rowId: 100,
            attribute: "Attribute",
            operator: "=",
            value: "attribute1",
            exception: null
        }, {
            rowId: 200,
            attribute: "Attribute2",
            operator: "=",
            value: null,
            exception: null
        }];

        const attributes = [{
            id: "Attribute",
            type: "list",
            values: [
                {id: 1, name: "attribute1"},
                {id: 2, name: "attribute2"},
                {id: 3, name: "attribute3"},
                {id: 4, name: "attribute4"},
                {id: 5, name: "attribute5"}
            ]
        }, {
            id: "Attribute2",
            dependson: {field: "Attribute", from: "id", to: "id"},
            type: "list",
            values: [
                {id: 1, name: "attribute_a"},
                {id: 1, name: "attribute_b"},
                {id: 2, name: "attribute_c"},
                {id: 2, name: "attribute_d"},
                {id: 3, name: "attribute_e"},
                {id: 3, name: "attribute_f"},
                {id: 4, name: "attribute_g"},
                {id: 4, name: "attribute_h"},
                {id: 5, name: "attribute_i"},
                {id: 5, name: "attribute_l"}
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
        expect(querybuilder.props.attributes.length).toBe(2);

        const queryBuilderDOMNode = expect(ReactDOM.findDOMNode(querybuilder));

        expect(queryBuilderDOMNode).toExist();
        let childNodes = queryBuilderDOMNode.actual.childNodes;
        expect(childNodes.length).toBe(3);

        let options = queryBuilderDOMNode.actual.getElementsByClassName('form-control')[5].options;
        expect(options.length).toBe(3);
        expect(options[1].value).toBe("attribute_a");
        expect(options[2].value).toBe("attribute_b");
    });
});
