/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import SelectInput from '../SelectInput';
import { act, Simulate } from 'react-dom/test-utils';
import expect from 'expect';

describe('SelectInput component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        ReactDOM.render(<SelectInput />, document.getElementById("container"));
        const selectInputNode = document.querySelector('.Select');
        expect(selectInputNode).toBeTruthy();
    });
    it('should not freeze after changing options', () => {
        act(() => {
            ReactDOM.render(<SelectInput
                value={'a'}
                config={{
                    getOptions: () => [{ value: '1', label: '1' }]
                }}
            />, document.getElementById("container"));
        });
        let selectInputControlNode = document.querySelector('.Select-control');
        expect(selectInputControlNode).toBeTruthy();
        act(() => {
            ReactDOM.render(<SelectInput
                value={'a'}
                config={{
                    getOptions: () => [{ value: '1', label: '1' }, { value: '2', label: '2' }]
                }}
            />, document.getElementById("container"));
        });
        selectInputControlNode = document.querySelector('.Select-control');
        act(() => {
            Simulate.keyDown(selectInputControlNode, { keyCode: 40 });
        });
        const selectInputOptions = document.querySelectorAll('.Select-option');
        expect(selectInputOptions.length).toBe(3);
        expect([...selectInputOptions].map((node) => node.innerHTML)).toEqual([ 'a', '1', '2' ]);
    });
});
