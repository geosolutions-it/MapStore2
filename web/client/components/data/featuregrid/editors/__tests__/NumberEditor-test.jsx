/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const TestUtils = require('react-dom/test-utils');
const NumberEditor = require('../NumberEditor').default;

let testColumn = {
    key: 'columnKey'
};


describe('FeatureGrid NumberEditor/IntegerEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Number Editor', () => {
        const cmp = ReactDOM.render(<NumberEditor
            value={1.1}
            rowIdx={1}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(cmp.getValue().columnKey).toBe(1.1);
        expect(cmp.validateNumberValue(1.1)).toBe(true);
    });
    it('Integer Editor', () => {
        const cmp = ReactDOM.render(<NumberEditor
            dataType="int"
            value={1.1}
            rowIdx={2}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(cmp.getValue().columnKey).toBe(1);
        expect(cmp.validateNumberValue(1)).toBe(true);
    });
    it('Number Editor failed validation', () => {
        const cmp = ReactDOM.render(<NumberEditor
            value={1.1}
            rowIdx={1}
            maxValue={1.5}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const container = document.getElementById('container');
        const inputElement = container.querySelector('input');
        expect(inputElement).toExist();
        expect(inputElement.value).toBe('1.1');
        TestUtils.Simulate.change(inputElement, {target: {value: '1.6'}});

        expect(cmp.getValue().columnKey).toBe(1.1);
        expect(cmp.state.isValid).toBe(false);
    });
    it('Number Editor passed validation', () => {
        const cmp = ReactDOM.render(<NumberEditor
            value={1.1}
            rowIdx={1}
            maxValue={1.5}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const container = document.getElementById('container');
        const inputElement = container.querySelector('input');
        expect(inputElement).toExist();
        expect(inputElement.value).toBe('1.1');

        TestUtils.Simulate.change(inputElement, {target: {value: '1.4'}});

        expect(cmp.getValue().columnKey).toBe(1.4);
        expect(cmp.state.isValid).toBe(true);
    });
});
