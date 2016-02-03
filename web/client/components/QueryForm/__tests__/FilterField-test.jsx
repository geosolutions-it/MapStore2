/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const FilterField = require('../FilterField.jsx');
const ComboField = require('../ComboField.jsx');
const DateField = require('../DateField.jsx');

const expect = require('expect');

describe('FilterField', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the FilterField component with his default content', () => {
        const filterField = {
            rowId: 200,
            attribute: "Attribute1",
            operator: "=",
            value: "attribute1",
            exception: null
        };

        const attributes = [{
            id: "Attribute1",
            type: "list",
            values: [
                "attribute1",
                "attribute2",
                "attribute3",
                "attribute4",
                "attribute5"
            ]
        }, {
            id: "Attribute2",
            type: "list",
            values: [
                "attribute6",
                "attribute7",
                "attribute8",
                "attribute9",
                "attribute10"
            ]
        }];

        const filterfield = ReactDOM.render(
            <FilterField
                attributes={attributes}
                filterField={filterField}>
                    <ComboField
                        attType="list"
                        fieldOptions={attributes[0] && attributes[0].type === "list" ? [null, ...attributes[0].values] : null}/>
                    <DateField attType="date"
                        operator={filterField.operator}/>
                </FilterField>,
                document.getElementById("container"));

        expect(filterfield).toExist();

        expect(filterfield.props.children).toExist();
        expect(filterfield.props.children.length).toBe(2);

        expect(filterfield.props.attributes).toExist();
        expect(filterfield.props.attributes.length).toBe(2);

        expect(filterfield.props.filterField).toExist();

        const filterFieldDOMNode = expect(ReactDOM.findDOMNode(filterfield));

        expect(filterFieldDOMNode).toExist();

        let childNodes = filterFieldDOMNode.actual.childNodes;

        expect(childNodes.length).toBe(3);

        const attributeSelect = childNodes[0].childNodes[0].getElementsByClassName('form-control')[0];
        expect(attributeSelect.value).toBe("Attribute1");

        const valueSelect = childNodes[2].childNodes[0].getElementsByClassName('form-control')[0];
        expect(valueSelect.value).toBe("attribute1");
    });
});
