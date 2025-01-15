
/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import useLocalStorage from '../useLocalStorage';
import { Simulate, act } from 'react-dom/test-utils';

const VALUE_KEY = 'test';

function Component({ valueKey, newValue, defaultValue }) {
    const [value, setValue] = useLocalStorage(valueKey, defaultValue);
    return (<button onClick={() => setValue(newValue)}>{value}</button>);
}

describe('useLocalStorage', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        localStorage.removeItem(VALUE_KEY);
        setTimeout(done);
    });
    it('should store new value in localStorage', () => {
        act(() => {
            ReactDOM.render(
                <Component valueKey={VALUE_KEY} newValue="newValue" defaultValue="defaultValue" />,
                document.getElementById("container")
            );
        });
        let button = document.querySelector('button');
        expect(button.innerHTML).toBe('defaultValue');
        expect(localStorage.getItem(VALUE_KEY)).toBe(null);
        Simulate.click(button);
        expect(button.innerHTML).toBe('newValue');
        expect(localStorage.getItem(VALUE_KEY)).toBe('"newValue"');
        act(() => {
            ReactDOM.render(
                <div id="unmount"/>,
                document.getElementById("container")
            );
        });
        button = document.querySelector('button');
        expect(button).toBe(null);
        act(() => {
            ReactDOM.render(
                <Component valueKey={VALUE_KEY} />,
                document.getElementById("container")
            );
        });
        button = document.querySelector('button');
        expect(button.innerHTML).toBe('newValue');
    });
});
