/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import expect from 'expect';
import FormulaInput from '../FormulaInput';

const hasErrors = () => !!document.querySelector('.has-error');
const isValid = () => !!document.querySelector('.has-success');
const getInput = () => document.querySelector('input');
const getValue = () => getInput().value;
const editValue = (value) => ReactTestUtils.Simulate.change(getInput(), { target: { value } });
const createSpyOnChange = () => {
    const actions = {
        onChange: () => { }
    };
    const spyonChange = expect.spyOn(actions, 'onChange');
    return spyonChange;
};
describe('FormulaInput', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('initial value', () => {
        const spyOnChange = createSpyOnChange();
        ReactDOM.render(<FormulaInput value="value" onChange={spyOnChange} />, document.getElementById("container"));
        // initial value is rendered
        expect(isValid()).toBeTruthy();
        expect(hasErrors()).toBeFalsy();
        expect(getValue()).toEqual("value");
    });
    it('wrong value', () => {
        const spyOnChange = createSpyOnChange();
        ReactDOM.render(<FormulaInput value="aaa" onChange={spyOnChange} />, document.getElementById("container"));
        // initial value is rendered
        expect(isValid()).toBeFalsy();
        expect(hasErrors()).toBeTruthy();
        expect(getValue()).toEqual("aaa");
    });
    it('input changes', () => {
        const spyOnChange = createSpyOnChange();
        ReactDOM.render(<FormulaInput onChange={spyOnChange}/>, document.getElementById("container"));
        expect(isValid()).toBeFalsy(); // empty string is not green
        expect(hasErrors()).toBeFalsy();
        expect(getValue()).toEqual("");

        // set valid value
        editValue("2");
        expect(spyOnChange.calls.length).toEqual(1);
        expect(spyOnChange.calls[0].arguments[0].target.value).toEqual(2);
        expect(isValid()).toBeTruthy();

        // set invalid value
        editValue("2a");
        // the value is rendered
        expect(getValue()).toEqual("2a");
        // onChange is not called. calls is still 1 element array
        expect(spyOnChange.calls.length).toEqual(1);
        // the status is error
        expect(isValid()).toBeFalsy();
        expect(hasErrors()).toBeTruthy();

        // insert a valid formula
        editValue("2 * value");
        expect(getValue()).toEqual("2 * value");
        expect(isValid()).toBeTruthy();
        expect(spyOnChange.calls.length).toEqual(2);
        expect(spyOnChange.calls[1].arguments[0].target.value).toEqual("2 * value");
    });
});
