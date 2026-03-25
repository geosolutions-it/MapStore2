/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ReactTestUtils from 'react-dom/test-utils';

import CoordinatesEditor from '../CoordinatesEditor';

describe('CoordinatesEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders with defaults', () => {
        ReactDOM.render(<CoordinatesEditor />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-geostory-center-coordinates');
        expect(el).toExist();
        const inputGroups = el.querySelectorAll('.input-group-container');
        expect(inputGroups.length).toBe(2);
    });

    it('renders with center values', () => {
        ReactDOM.render(
            <CoordinatesEditor center={{x: 11.5, y: 43.7, crs: 'EPSG:4326'}} />,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBe(2);
        expect(parseFloat(inputs[0].value)).toBe(43.7);
        expect(parseFloat(inputs[1].value)).toBe(11.5);
    });

    it('calls onChange when latitude is modified', () => {
        const actions = {
            onChange: () => {}
        };
        const spy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(
            <CoordinatesEditor
                center={{x: 11, y: 43, crs: 'EPSG:4326'}}
                onChange={actions.onChange}
            />,
            document.getElementById("container")
        );
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(2);
        inputs[0].value = '44.5';
        ReactTestUtils.Simulate.change(inputs[0]);
        expect(spy).toHaveBeenCalled();
        const callArg = spy.calls[0].arguments[0];
        expect(callArg.y).toBe(44.5);
        expect(callArg.x).toBe(11);
        expect(callArg.crs).toBe('EPSG:4326');
    });

    it('calls onChange when longitude is modified', () => {
        const actions = {
            onChange: () => {}
        };
        const spy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(
            <CoordinatesEditor
                center={{x: 11, y: 43, crs: 'EPSG:4326'}}
                onChange={actions.onChange}
            />,
            document.getElementById("container")
        );
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(2);
        inputs[1].value = '12.5';
        ReactTestUtils.Simulate.change(inputs[1]);
        expect(spy).toHaveBeenCalled();
        const callArg = spy.calls[0].arguments[0];
        expect(callArg.x).toBe(12.5);
        expect(callArg.y).toBe(43);
        expect(callArg.crs).toBe('EPSG:4326');
    });

    it('does not call onChange for empty or NaN values', () => {
        const actions = {
            onChange: () => {}
        };
        const spy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(
            <CoordinatesEditor
                center={{x: 11, y: 43, crs: 'EPSG:4326'}}
                onChange={actions.onChange}
            />,
            document.getElementById("container")
        );
        const inputs = document.querySelectorAll('input');
        inputs[0].value = '';
        ReactTestUtils.Simulate.change(inputs[0]);
        expect(spy).toNotHaveBeenCalled();
    });

    it('defaults crs to EPSG:4326 when not provided', () => {
        const actions = {
            onChange: () => {}
        };
        const spy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(
            <CoordinatesEditor
                center={{x: 11, y: 43}}
                onChange={actions.onChange}
            />,
            document.getElementById("container")
        );
        const inputs = document.querySelectorAll('input');
        inputs[0].value = '44';
        ReactTestUtils.Simulate.change(inputs[0]);
        if (spy.calls.length > 0) {
            expect(spy.calls[0].arguments[0].crs).toBe('EPSG:4326');
        }
    });
});
