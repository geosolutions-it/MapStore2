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
import ReactTestUtils from 'react-dom/test-utils';

import StringFilter from '../StringFilter';

describe('Test for StringFilter component', () => {
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
        ReactDOM.render(<StringFilter/>, document.getElementById("container"));
        const el = document.getElementsByClassName("form-control input-sm")[0];
        expect(el).toExist();
    });
    it('render with value', () => {
        ReactDOM.render(<StringFilter value={"TEST"}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("form-control input-sm")[0];
        expect(el).toExist();
        expect(el.value).toBe("TEST");
    });
    it('Test StringFilter onChange', (done) => {
        ReactTestUtils.act(()=>{
            ReactDOM.render(<StringFilter onChange={(input) => {
                try {
                    expect(input.value).toBe("test");
                } catch (e) {
                    done(e);
                }
                done();
            }} />, document.getElementById("container"));
        });
        const input = document.getElementsByClassName("form-control input-sm")[0];
        input.value = "test";
        ReactTestUtils.Simulate.change(input);
    });
    it('Test StringFilter space trim', (done) => {
        ReactTestUtils.act(()=>{
            ReactDOM.render(<StringFilter onChange={(input) => {
                try {
                    expect(input.value).toBe("test");
                    expect(input.rawValue).toBe("test  ");
                } catch (e) {
                    done(e);
                }
                done();
            }} />, document.getElementById("container"));
        });
        const input = document.getElementsByClassName("form-control input-sm")[0];
        input.value = "test  ";
        ReactTestUtils.Simulate.change(input);
    });
    it('Test empty string trigger none', (done) => {
        const EXPRESSION_TESTS = [
            [" ", undefined],
            ["", undefined]
        ];
        EXPRESSION_TESTS.map(([rawValue, value])=> {
            ReactTestUtils.act(()=>{
                ReactDOM.render(<StringFilter value={"test"} onChange={(input) => {
                    try {
                        expect(input.value).toBe(value);
                        expect(input.rawValue).toBe(rawValue);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }} />, document.getElementById("container"));
            });
            const input = document.getElementsByClassName("form-control input-sm")[0];
            input.value = rawValue;
            ReactTestUtils.Simulate.change(input);
        });
    });
});
