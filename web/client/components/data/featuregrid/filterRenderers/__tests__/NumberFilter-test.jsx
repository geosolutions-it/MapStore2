/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils, {act} from 'react-dom/test-utils';

import NumberFilter from '../NumberFilter';

const EXPRESSION_TESTS = [
    ["2", "=", 2],
    ["2.", "=", 2],
    ["2.1", "=", 2.1],
    [" 2.1 ", "=", 2.1],
    ["> 2", ">", 2],
    [">= 2", ">=", 2],
    ["< 2", "<", 2],
    ["<= 2", "<=", 2],
    ["=2", "=", 2],
    ["==2", "=", 2],
    ["=== 2", "=", 2],
    ["!== 2", "<>", 2],
    ["!= 2", "<>", 2],
    ["<> 2", "<>", 2],
    ["<> -2", "<>", -2],
    ["", "=", undefined],
    [" ", "=", undefined],
    ["ZZZ", "=", undefined]
];
const testExpression = (rawValue) => {
    const input = document.getElementsByTagName("input")[0];
    input.value = rawValue;
    ReactTestUtils.Simulate.change(input);
};

describe('Test for NumberFilter component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render with defaults', () => {
        ReactDOM.render(<NumberFilter/>, document.getElementById("container"));
        const el = document.getElementsByClassName("form-control input-sm")[0];
        expect(el).toExist();
    });
    it('render with value', () => {
        ReactDOM.render(<NumberFilter value={1}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("form-control input-sm")[0];
        expect(el).toExist();
        const input = document.getElementsByTagName("input")[0];
        expect(input.value).toBe("1");
    });
    it('Test NumberFilter onChange', (done) => {
        act(()=>{
            ReactDOM.render(<NumberFilter onChange={(input) => {
                try {
                    expect(input.value).toBe(2);
                } catch (e) {
                    done(e);
                }
                done();
            }} />, document.getElementById("container"));
        });

        const input = document.getElementsByTagName("input")[0];
        input.value = "> 2";
        ReactTestUtils.Simulate.change(input);
    });
    it('Test NumberFilter validity check', (done) => {
        act(()=>{
            ReactDOM.render(<NumberFilter onChange={() => {
                try {
                    expect( document.getElementsByClassName("has-error").length > 0).toBe(true);
                } catch (e) {
                    done(e);
                }
                done();
            }} />, document.getElementById("container"));
        });

        const input = document.getElementsByTagName("input")[0];
        input.value = "ZZZ 2";
        ReactTestUtils.Simulate.change(input);
    });
    it('Test NumberFilter expressions', (done) => {
        EXPRESSION_TESTS.map( ([rawValue, expectedOperator, expectedValue]) => {
            act(()=>{
                ReactDOM.render(<NumberFilter onChange={(input) => {
                    try {
                        expect(input.value).toBe(expectedValue);
                        expect(input.operator).toBe(expectedOperator);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }} onValueChange={(input) => {
                    try {
                        expect(input).toBe(rawValue);

                    } catch (e) {
                        done(e);
                    }
                    done();
                }} />, document.getElementById("container"));
            });
            testExpression(rawValue);
        });
    });
});
