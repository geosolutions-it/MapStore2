/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import ChartSwitcher from '../ChartSwitcher';

const charts = [{chartId: 1, layer: {title: 'm1'}}, {chartId: 2, layer: {title: 'm2'}}];
describe('ChartSwitcher component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartSwitcher render default', () => {
        ReactDOM.render(<ChartSwitcher editorData={{charts}} withContainer/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeTruthy();
        const switcherLabel = container.querySelector('.widget-selector-label');
        expect(switcherLabel).toBeTruthy();
        const switcherDropdown = container.querySelector('.Select');
        expect(switcherDropdown).toBeTruthy();
        const switcherValue = container.querySelector('.Select-value-label');
        expect(switcherValue.textContent).toBe('m1');
    });
    it('ChartSwitcher render without container', () => {
        ReactDOM.render(<ChartSwitcher charts={charts}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeFalsy();
        const switcherLabel = container.querySelector('.widget-selector-label');
        expect(switcherLabel).toBeFalsy();
        const switcherDropdown = container.querySelector('.Select');
        expect(switcherDropdown).toBeTruthy();
    });
    it('ChartSwitcher render icon when map size is small', () => {
        ReactDOM.render(<ChartSwitcher width={400} charts={charts} value={1} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeFalsy();
        const switcherIcon = container.querySelector('.glyphicon-info-sign');
        expect(switcherIcon).toBeTruthy();
    });
    it('ChartSwitcher - wizard do not render select component', () => {
        ReactDOM.render(<ChartSwitcher withContainer editorData={{charts: charts[0]}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeFalsy();
        const selectArrow = container.querySelector('.Select-arrow');
        expect(selectArrow).toBeFalsy();
    });
    it('ChartSwitcher - widget do not render select component', () => {
        ReactDOM.render(<ChartSwitcher charts={[charts[0]]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeFalsy();
        const selectArrow = container.querySelector('.Select-arrow');
        expect(selectArrow).toBeFalsy();
    });
    it('ChartSwitcher onChange', () => {
        const action = { onChange: () => {} };
        const spyOnChange = expect.spyOn(action, 'onChange');
        ReactDOM.render(<ChartSwitcher charts={charts} value={1} onChange={action.onChange} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeFalsy();

        // Simulate selection
        const selectArrow = container.querySelector('.Select-arrow');
        const selectControl = container.querySelector('.Select-control');
        const inputs = container.querySelectorAll("input" );
        ReactTestUtils.Simulate.mouseDown(selectArrow, { button: 0 });
        ReactTestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
        ReactTestUtils.Simulate.keyDown(inputs[0], { keyCode: 13, key: 'Enter' });
        expect(spyOnChange.calls.length).toBe(1);
        expect(spyOnChange.calls[0].arguments).toEqual(['selectedChartId', 2]);
    });
    it('ChartSwitcher render child component', () => {
        ReactDOM.render(<ChartSwitcher withContainer><button>TEST</button></ChartSwitcher>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();

        const button = container.querySelector('button');
        expect(button.textContent).toBe('TEST');
    });
});
