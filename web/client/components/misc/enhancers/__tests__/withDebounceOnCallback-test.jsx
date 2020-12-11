/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import withDebounceOnCallback from '../withDebounceOnCallback';
import { Simulate, act } from 'react-dom/test-utils';

function TestInputControl({ value, onChange }) {
    function handleOnChange(event) {
        onChange(event.target.value);
    }
    return (<input id="test-input" value={value} onChange={handleOnChange} />);
}

describe('HOC withDebounceOnCallback', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should trigger onChange after a debounce time', (done) => {
        const Component = withDebounceOnCallback('onChange', 'value')(TestInputControl);
        const initialValue = 'hello';
        const debounceTime = 300;
        const startTime = Date.now();
        act(() => {
            ReactDOM.render(<Component
                debounceTime={debounceTime}
                value={initialValue}
                onChange={(value) => {
                    try {
                        const endTime = Date.now();
                        expect(value).toBe(initialValue);
                        expect(endTime - startTime >= debounceTime).toBe(true);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });

        const inputNode = document.querySelector('#test-input');
        expect(inputNode).toBeTruthy();
        Simulate.change(inputNode, { target: { value: initialValue + ' t' } });
        Simulate.change(inputNode, { target: { value: initialValue + ' te' } });
        Simulate.change(inputNode, { target: { value: initialValue + ' tes' } });
        Simulate.change(inputNode, { target: { value: initialValue + ' test' } });
        Simulate.change(inputNode, { target: { value: initialValue + ' tests' } });
        Simulate.change(inputNode, { target: { value: initialValue + ' test' } });
        Simulate.change(inputNode, { target: { value: initialValue + ' tes' } });
        Simulate.change(inputNode, { target: { value: initialValue + ' te' } });
        Simulate.change(inputNode, { target: { value: initialValue + ' t' } });
        Simulate.change(inputNode, { target: { value: initialValue } });
    });
});
