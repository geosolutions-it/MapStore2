/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const ComboField = require('../ComboField.jsx');

const expect = require('expect');

describe('ComboField', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the ComboField component with options', () => {
        let fieldOptions = [
            "attribute1",
            "attribute2",
            "attribute3",
            "attribute4",
            "attribute5"
        ];
        let fieldValue = "attribute5";
        let fieldRowId = 200;

        const combofield = ReactDOM.render(
            <ComboField
                fieldOptions={fieldOptions}
                fieldName="attribute"
                fieldRowId={fieldRowId}
                fieldValue={fieldValue}/>,
            document.getElementById("container")
        );

        expect(combofield).toExist();

        const comboFieldDOMNode = expect(ReactDOM.findDOMNode(combofield));
        expect(comboFieldDOMNode).toExist();

        let childNodes = comboFieldDOMNode.actual.getElementsByClassName('form-control')[0];
        expect(childNodes.length).toBe(5);
    });
});
