/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import ChartType from '../ChartType';
describe('ChartType component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartType rendering with defaults', () => {
        ReactDOM.render(<ChartType />, document.getElementById("container"));
        const container = document.getElementById('container');
        const chartTypeEl = container.querySelector('.chart-type');
        expect(chartTypeEl).toBeTruthy();
        const switcherDropdown = container.querySelector('.Select');
        expect(switcherDropdown).toBeTruthy();
        const switcherValue = container.querySelector('.Select-value-label');
        expect(switcherValue).toBeFalsy();
    });
    it('ChartType selected', () => {
        ReactDOM.render(<ChartType type="bar"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        const switcherDropdown = container.querySelector('.Select');
        expect(switcherDropdown).toBeTruthy();
        const switcherValue = container.querySelector('.Select-value-label');
        expect(switcherValue.textContent).toContain('Bar Chart');
    });
    it('Test ChartType onSelect', () => {
        const actions = {
            onSelect: () => {}
        };
        const spyonSelect = expect.spyOn(actions, 'onSelect');
        ReactDOM.render(<ChartType type="bar" onSelect={actions.onSelect}  />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();

        // Simulate selection
        const selectArrow = container.querySelector('.Select-arrow');
        const selectControl = container.querySelector('.Select-control');
        const inputs = container.querySelectorAll("input" );
        ReactTestUtils.Simulate.mouseDown(selectArrow, { button: 0 });
        ReactTestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
        ReactTestUtils.Simulate.keyDown(inputs[0], { keyCode: 13, key: 'Enter' });
        expect(spyonSelect.calls.length).toBe(1);
        expect(spyonSelect).toHaveBeenCalled();
        expect(spyonSelect.calls[0].arguments[0]).toBe("pie");
    });
});
