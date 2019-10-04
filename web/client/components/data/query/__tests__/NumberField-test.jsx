/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-dom/test-utils');
const NumberField = require('../NumberField');

describe('NumberField', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('create a NumberField component without any props', () => {
        const cmp = ReactDOM.render(<NumberField/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('create a NumberField rendering number range', () => {
        let conf = {
            fieldRowId: 846,
            groupId: 1,
            attribute: "FAMILIES",
            operator: "><",
            fieldValue: {
                upBound: 150000,
                lowBound: 100000
            },
            type: "number",
            fieldException: "p...a"
        };
        const cmp = ReactDOM.render(<NumberField {...conf} />, document.getElementById("container"));
        expect(cmp).toExist();
        let node = ReactDOM.findDOMNode(cmp);
        expect(node).toExist();
        let inputs = node.getElementsByTagName("input");
        expect(inputs).toExist();
        expect(inputs.length).toBe(2);
        cmp.changeNumber({lowBound: 10, upBound: 1});
        cmp.changeNumber({lowBound: 10, upBound: 100});

    });
    it('create a NumberField with = operator', () => {
        let conf = {
            fieldRowId: 846,
            groupId: 1,
            attribute: "FAMILIES",
            operator: "=",
            isRequired: true,
            fieldValue: 20,
            type: "number",
            fieldException: "p...a",
            options: {min: 0, max: 100, precision: 3}
        };
        const cmp = ReactDOM.render(<NumberField {...conf} />, document.getElementById("container"));
        expect(cmp).toExist();
        let node = ReactDOM.findDOMNode(cmp);
        expect(node).toExist();
        let inputs = node.getElementsByTagName("input");
        expect(inputs).toExist();
        expect(inputs.length).toBe(1);
        cmp.changeNumber(null);
        cmp.changeNumber(10);

    });

    it('if value is NaN changeNumber should not be called', () => {
        const actions = {
            onUpdateField: () => {}
        };

        const spyOnUpdateField = expect.spyOn(actions, 'onUpdateField');
        const cmp = ReactDOM.render(
            <NumberField
                onUpdateField={actions.onUpdateField}
            />, document.getElementById("container"));
        expect(cmp).toExist();
        const node = ReactDOM.findDOMNode(cmp);
        const input = node.getElementsByTagName('INPUT');
        TestUtils.Simulate.change(input[0], {target: {value: 'aaa'}});
        expect(spyOnUpdateField).toNotHaveBeenCalled();
    });

    it('if value is number changeNumber should be called', () => {
        const actions = {
            onUpdateField: () => {}
        };

        const spyOnUpdateField = expect.spyOn(actions, 'onUpdateField');
        const cmp = ReactDOM.render(
            <NumberField
                onUpdateField={actions.onUpdateField}
            />, document.getElementById("container"));
        expect(cmp).toExist();
        const node = ReactDOM.findDOMNode(cmp);
        const input = node.getElementsByTagName('INPUT');
        TestUtils.Simulate.change(input[0], {target: {value: '7'}});
        expect(spyOnUpdateField).toHaveBeenCalled();
    });
});
