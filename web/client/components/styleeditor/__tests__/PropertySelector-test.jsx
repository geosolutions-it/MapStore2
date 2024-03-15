/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropertySelector from '../PropertySelector';
import expect from 'expect';
import { Simulate } from 'react-dom/test-utils';

describe('PropertySelector', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with defaults', () => {
        ReactDOM.render(<PropertySelector />, document.getElementById('container'));
        const selectorNode = document.querySelector('.ms-symbolizer-property-selector');
        expect(selectorNode).toBeTruthy();
    });
    it('should render double selector when opacity key is available', () => {
        ReactDOM.render(<PropertySelector
            fieldKey="color"
            config={{
                opacityKey: 'opacity'
            }}
        />, document.getElementById('container'));
        const selectorNode = document.querySelector('.ms-symbolizer-property-selector');
        expect(selectorNode).toBeTruthy();
        const selectFields = document.querySelectorAll('.ms-symbolizer-field');
        expect(selectFields.length).toBe(2);
    });
    it('should disable attributes', () => {
        ReactDOM.render(<PropertySelector
            fieldKey="color"
            valueType={"string"}
            attributes={[
                { type: 'string', label: 'color', attribute: 'color' },
                { type: 'number', label: 'area', attribute: 'area' }
            ]}
        />, document.getElementById('container'));
        const selectorNode = document.querySelector('.ms-symbolizer-property-selector');
        expect(selectorNode).toBeTruthy();
        const selectFields = document.querySelectorAll('.Select-input > input');
        expect(selectFields.length).toBe(1);
        Simulate.focus(selectFields[0]);
        Simulate.keyDown(selectFields[0], { key: 'Enter', keyCode: 13 });
        const options = document.querySelectorAll('.Select-option');
        expect(options.length).toBe(2);
        expect([...options].map(option => option.getAttribute('class'))).toEqual([
            'Select-option is-focused',
            'Select-option is-disabled'
        ]);
    });
    it('should trigger on change after selecting a valid attribute', (done) => {
        ReactDOM.render(<PropertySelector
            fieldKey="color"
            valueType={"string"}
            attributes={[
                { type: 'string', label: 'color', attribute: 'color' },
                { type: 'number', label: 'area', attribute: 'area' }
            ]}
            onChange={(newValue) => {
                try {
                    expect(newValue).toEqual({ color: { name: 'property', args: [ 'color' ] } });
                    done();
                } catch (e) {
                    done(e);
                }
            }}
        />, document.getElementById('container'));
        const selectorNode = document.querySelector('.ms-symbolizer-property-selector');
        expect(selectorNode).toBeTruthy();
        const selectFields = document.querySelectorAll('.Select-input > input');
        expect(selectFields.length).toBe(1);
        Simulate.focus(selectFields[0]);
        Simulate.keyDown(selectFields[0], { key: 'ArrowDown', keyCode: 40 });
        Simulate.keyDown(selectFields[0], { key: 'Enter', keyCode: 13 });
    });
});
