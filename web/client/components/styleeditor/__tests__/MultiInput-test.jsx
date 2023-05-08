/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import MultiInput from '../MultiInput';
import expect from 'expect';
import { Simulate, act } from 'react-dom/test-utils';

describe('MultiInput component', () => {
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
        ReactDOM.render(<MultiInput />, document.getElementById("container"));
        const selectNode = document.querySelector('.Select');
        expect(selectNode).toBeTruthy();
    });

    it('should render with constant value', () => {
        ReactDOM.render(<MultiInput value={{ type: 'constant', value: 123.123}} />, document.getElementById("container"));
        const inputNode = document.querySelector('.form-control');
        expect(inputNode.value).toBe("123.123");
    });

    it('should render with select value', () => {
        const INITIAL_OPTION_VALUE = 'original_option_value';
        const config = {
            initialOptionValue: INITIAL_OPTION_VALUE,
            selectOptions: [
                { label: 'Height', value: 'height' },
                { label: 'Id', value: 'id' },
                { label: 'Original value', value: INITIAL_OPTION_VALUE }
            ]
        };
        ReactDOM.render(<MultiInput value={{ type: 'attributes', name: 'height' }} config={config} />, document.getElementById("container"));
        const inputNode = document.querySelector('.form-control');
        expect(inputNode).toBeFalsy();
        const selectNode = document.querySelector('.Select');
        expect(selectNode).toBeTruthy();
    });
    it('should render localized labels in select', () => {
        const INITIAL_OPTION_VALUE = 'original_option_value';
        const config = {
            initialOptionValue: INITIAL_OPTION_VALUE,
            getSelectOptions: () => [
                { label: {"default": "Localized"}, value: 'height' },
                { label: 'Id', value: 'id' },
                { label: 'Original value', value: INITIAL_OPTION_VALUE }
            ]
        };
        ReactDOM.render(<MultiInput value={{ type: 'attributes', name: 'height' }} config={config} />, document.getElementById("container"));
        const selectNode = document.querySelector('.Select');
        const selectInputNode = selectNode.querySelector('input');
        act(() => {

            Simulate.focus(selectInputNode);
            Simulate.keyDown(selectInputNode, { key: 'ArrowDown', keyCode: 40 });
            Simulate.keyDown(selectInputNode, { key: 'Enter', keyCode: 13 });
        });
        const selectMenuOptionNodes = selectNode.querySelectorAll('.Select-option');
        expect(selectMenuOptionNodes.length).toBe(3);
        expect(selectMenuOptionNodes[0].textContent).toBe('Localized');
        expect(selectMenuOptionNodes[1].textContent).toBe('Id');
        expect(selectMenuOptionNodes[2].textContent).toBe('Original value');
    });

    it('should handle onChange', (done) => {
        act(() => {
            ReactDOM.render(<MultiInput
                value={{ type: 'constant', value: 123.123 }}
                onChange={(value) => {
                    try {
                        expect(value).toEqual({ type: 'constant', value: '-33' });
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        });
        const inputNode = document.querySelector('.form-control');
        Simulate.focus(inputNode);
        Simulate.change(inputNode, { target: { value: '-33' } });
    });

    it('should change height mode', () => {
        const callbacks = {
            onChange: () => { }
        };
        const spy = expect.spyOn(callbacks, 'onChange');
        ReactDOM.render(<MultiInput value={{ type: 'constant', value: 123.123}} onChange={callbacks.onChange} />, document.getElementById("container"));
        const buttonNode = document.querySelector('button');
        Simulate.click(buttonNode);
        const menuItems = document.querySelectorAll('ul.dropdown-menu li a');
        expect(menuItems.length).toBe(2);
        Simulate.click(menuItems[1]);
        expect(spy).toHaveBeenCalledWith({ type: 'attribute' });
    });

    it('should render with select value', () => {
        const callbacks = {
            onChange: () => { }
        };
        const INITIAL_OPTION_VALUE = 'original_option_value';
        const config = {
            initialOptionValue: INITIAL_OPTION_VALUE,
            getSelectOptions: () => [
                { label: 'Height', value: 'height' },
                { label: 'Id', value: 'id' },
                { label: 'Original value', value: INITIAL_OPTION_VALUE }
            ]
        };
        const spy = expect.spyOn(callbacks, 'onChange');
        ReactDOM.render(
            <MultiInput

                value={{ type: 'attribute', name: 'height' }}
                config={config} onChange={callbacks.onChange}
            />,
            document.getElementById("container")
        );
        const selectNode = document.querySelector('.Select');
        const selectInputNode = selectNode.querySelector('input');
        act(() => {
            Simulate.focus(selectInputNode);
            Simulate.keyDown(selectInputNode, { key: 'ArrowDown', keyCode: 40 });
        });
        const selectMenuOptionNodes = selectNode.querySelectorAll('.Select-option');
        expect(selectMenuOptionNodes.length).toBe(3);
        act(() => {
            Simulate.mouseDown(selectMenuOptionNodes[1]);
        });
        expect(spy).toHaveBeenCalledWith({ type: 'attribute', name: 'id' });
    });
});
