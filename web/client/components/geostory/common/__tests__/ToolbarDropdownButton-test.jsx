/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import expect from 'expect';
import ToolbarDropdownButton from '../ToolbarDropdownButton';
import { act, Simulate } from 'react-dom/test-utils';
describe('ToolbarDropdownButton component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ToolbarDropdownButton rendering with defaults', () => {
        ReactDOM.render(<ToolbarDropdownButton />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.square-button-md.no-border');
        expect(el).toBeTruthy();
    });
    it('should hide dropdown when disabled', () => {
        ReactDOM.render(<ToolbarDropdownButton
            glyph="small"
            options={[{
                value: 'value',
                label: 'Label'
            }]}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttonNode = container.querySelector('.square-button-md.no-border');
        expect(buttonNode).toBeTruthy();
        let dropdownMenuNode = container.querySelector('.dropdown.open');
        expect(dropdownMenuNode).toBeFalsy();

        // open dropdown
        act(() => {
            Simulate.click(buttonNode);
        });

        dropdownMenuNode = container.querySelector('.dropdown.open');
        expect(dropdownMenuNode).toBeTruthy();

        // disabled component
        act(() => {
            ReactDOM.render(<ToolbarDropdownButton
                disabled
                glyph="small"
                options={[{
                    value: 'value',
                    label: 'Label'
                }]}
            />, document.getElementById("container"));
        });

        dropdownMenuNode = container.querySelector('.dropdown.open');
        expect(dropdownMenuNode).toBeFalsy();
    });
});
