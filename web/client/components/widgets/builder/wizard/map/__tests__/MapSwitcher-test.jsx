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

import MapSwitcher from '../MapSwitcher';

const maps = [{mapId: 1, name: 'm1'}, {mapId: 2, name: 'm2'}];
describe('MapSwitcher component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MapSwitcher render default', () => {
        ReactDOM.render(<MapSwitcher editorData={{maps}} withContainer/>, document.getElementById("container"));
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
    it('MapSwitcher render without container', () => {
        ReactDOM.render(<MapSwitcher maps={maps}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeFalsy();
        const switcherLabel = container.querySelector('.widget-selector-label');
        expect(switcherLabel).toBeFalsy();
        const switcherDropdown = container.querySelector('.Select');
        expect(switcherDropdown).toBeTruthy();
    });
    it('MapSwitcher render icon when map size is small', () => {
        ReactDOM.render(<MapSwitcher maps={maps.map(m=> ({...m, size: {width: 400}}))} value={1} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeFalsy();
        const switcherIcon = container.querySelector('.glyphicon-info-sign');
        expect(switcherIcon).toBeTruthy();
    });
    it('MapSwitcher render empty map', () => {
        ReactDOM.render(<MapSwitcher withContainer emptyMap />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeTruthy();
        const fcEmptyName = container.querySelector('.widget-empty-map');
        expect(fcEmptyName).toBeTruthy();
        const button = container.querySelector('button');
        expect(button.classList.contains('disabled')).toBeTruthy();
        ReactTestUtils.Simulate.change(fcEmptyName, {target: {value: 'map1'}});
        expect(button.classList.contains('disabled')).toBeFalsy();
    });
    it('MapSwitcher render empty map onChange', () => {
        const action = { onChange: () => {} };
        const spyOnChange = expect.spyOn(action, 'onChange');
        ReactDOM.render(<MapSwitcher withContainer emptyMap onChange={action.onChange} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-selector');
        expect(el).toBeTruthy();
        const fcEmptyName = container.querySelector('.widget-empty-map');
        expect(fcEmptyName).toBeTruthy();
        const button = container.querySelector('button');
        ReactTestUtils.Simulate.change(fcEmptyName, {target: {value: 'map1'}});
        ReactTestUtils.Simulate.click(button);
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChange.calls.length).toBe(2);
    });
    it('MapSwitcher onChange', () => {
        const action = { onChange: () => {} };
        const spyOnChange = expect.spyOn(action, 'onChange');
        ReactDOM.render(<MapSwitcher maps={maps} value={1} onChange={action.onChange} />, document.getElementById("container"));
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
        expect(spyOnChange.calls[0].arguments).toEqual(['selectedMapId', 2]);
    });
});
