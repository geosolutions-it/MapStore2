/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');

const GroupField = require('../QueryBuilder.jsx');

describe('GroupField', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the GroupField component with his default content', () => {
        const groupfield = ReactDOM.render(<GroupField/>, document.getElementById("container"));
        expect(groupfield).toExist();
    });

    it('creates the GroupField component with initial content', () => {
        const groupLevels = 5;

        const groupFields = [{
            id: 1,
            logic: "OR",
            index: 0
        }];

        const filterFields = [{
            rowId: 100,
            groupId: 1,
            attribute: "",
            operator: null,
            value: null,
            exception: null
        }, {
            rowId: 200,
            groupId: 1,
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

        const groupfield = ReactDOM.render(
            <GroupField
                filterFields={filterFields}
                attributes={attributes}
                groupFields={groupFields}
                groupLevels={groupLevels}
            />,
            document.getElementById("container")
        );

        expect(groupfield).toExist();
        expect(groupfield.props.filterFields).toExist();
        expect(groupfield.props.filterFields.length).toBe(2);
        expect(groupfield.props.groupFields).toExist();
        expect(groupfield.props.groupFields.length).toBe(1);
        expect(groupfield.props.groupLevels).toExist();
        expect(groupfield.props.groupLevels).toBe(5);
        expect(groupfield.props.attributes).toExist();
        expect(groupfield.props.attributes.length).toBe(1);

        const groupFieldDOMNode = expect(ReactDOM.findDOMNode(groupfield));
        expect(groupFieldDOMNode).toExist();

        let groupPanel = document.getElementsByClassName('panel-body')[0];
        let childNodes = groupPanel.childNodes;
        expect(childNodes.length).toBe(4);

        for (let i = 0; i < childNodes.length; i++) {
            let child = childNodes[i];
            expect(child.className === "logicHeader row" || child.className === "row").toBe(true);
        }

        const buttons = document.getElementsByClassName('btn btn-default');
        expect(buttons.length).toBe(4);
    });

    it('creates the GroupField with cascading', () => {
        const groupLevels = 5;

        const groupFields = [{
            id: 1,
            logic: "OR",
            index: 0
        }];

        const filterFields = [
            {
                rowId: 100,
                groupId: 1,
                attribute: "Attribute",
                operator: "=",
                value: "attribute1",
                exception: null
            }, {
                rowId: 200,
                groupId: 1,
                attribute: "Attribute2",
                operator: "=",
                value: null,
                exception: null
            }
        ];

        const attributes = [
            {
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
            }
        ];

        const groupfield = ReactDOM.render(
            <GroupField
                filterFields={filterFields}
                attributes={attributes}
                groupFields={groupFields}
                groupLevels={groupLevels}
            />,
            document.getElementById("container")
        );

        expect(groupfield).toExist();
        expect(groupfield.props.filterFields).toExist();
        expect(groupfield.props.filterFields.length).toBe(2);
        expect(groupfield.props.groupFields).toExist();
        expect(groupfield.props.groupFields.length).toBe(1);
        expect(groupfield.props.groupLevels).toExist();
        expect(groupfield.props.groupLevels).toBe(5);
        expect(groupfield.props.attributes).toExist();
        expect(groupfield.props.attributes.length).toBe(2);

        const groupFieldDOMNode = expect(ReactDOM.findDOMNode(groupfield));
        expect(groupFieldDOMNode).toExist();

        let groupPanel = document.getElementsByClassName('panel-body')[0];
        let childNodes = groupPanel.childNodes;
        expect(childNodes.length).toBe(4);

        let selectBtn = groupFieldDOMNode.actual.getElementsByClassName('rw-dropdownlist-picker rw-select rw-btn')[6];
        selectBtn.click();
        let options = groupFieldDOMNode.actual.getElementsByClassName('rw-list-option');
        expect(options.length).toBe(2);
        expect(options[0].childNodes[0].nodeValue).toBe("attribute_a");
        expect(options[1].childNodes[0].nodeValue).toBe("attribute_b");
    });
});
