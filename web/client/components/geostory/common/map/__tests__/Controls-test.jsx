/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Controls from '../Controls';
import expect from 'expect';
import ReactTestUtils from 'react-dom/test-utils';


const doCommonTests = (document) => {
    const container = document.getElementById('container');
    const el = container.querySelector('.ms-geostory-map-controls');
    expect(el).toExist();
};

describe('Controls component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('rendering Controls comp with defaults', () => {
        ReactDOM.render(<Controls />, document.getElementById("container"));
        doCommonTests(document);
    });
    it('rendering Controls comp and triggering zoomControl update', () => {
        const actions = {
            onChangeMap: () => {}
        };
        const spyChangeMap = expect.spyOn(actions, 'onChangeMap');
        const oldZoomStatus = true;
        const newZoomStatus = !oldZoomStatus;
        ReactDOM.render(
            <Controls
                map={{zoomControl: oldZoomStatus}}
                onChangeMap={actions.onChangeMap}
            />, document.getElementById("container"));
        doCommonTests(document);
        const checkboxes = document.querySelectorAll("input[type=checkbox]");
        expect(checkboxes.length).toBe(3);
        ReactTestUtils.Simulate.change(checkboxes[0]);
        expect(spyChangeMap).toHaveBeenCalled();
        expect(spyChangeMap.calls.length).toBe(2);
        expect(spyChangeMap.calls[0].arguments).toEqual(['zoomControl', false]);
        expect(spyChangeMap.calls[1].arguments).toEqual(['mapOptions.interactions', { doubleClickZoom: newZoomStatus, shiftDragZoom: newZoomStatus, pinchZoom: newZoomStatus } ]);
    });
    it('rendering Controls comp and triggering pan interaction update', () => {
        const actions = {
            onChangeMap: () => {}
        };
        const spyChangeMap = expect.spyOn(actions, 'onChangeMap');
        const dragPan = true;
        const newDragPanStatus = !dragPan;
        ReactDOM.render(
            <Controls
                map={{mapOptions: {interactions: {dragPan}}}}
                onChangeMap={actions.onChangeMap}
            />, document.getElementById("container"));
        doCommonTests(document);
        const checkboxes = document.querySelectorAll("input[type=checkbox]");
        expect(checkboxes.length).toBe(3);
        ReactTestUtils.Simulate.change(checkboxes[1]);
        expect(spyChangeMap).toHaveBeenCalled();
        expect(spyChangeMap.calls.length).toBe(1);
        expect(spyChangeMap.calls[0].arguments).toEqual(['mapOptions.interactions', { dragPan: newDragPanStatus, keyboardPan: newDragPanStatus } ]);
    });
    it('rendering Controls comp and triggering mapInfoControl update', () => {
        const actions = {
            onChangeMap: () => {}
        };
        const spyChangeMap = expect.spyOn(actions, 'onChangeMap');
        const oldZoomStatus = true;
        ReactDOM.render(
            <Controls
                map={{zoomControl: oldZoomStatus}}
                onChangeMap={actions.onChangeMap}
            />, document.getElementById("container"));
        doCommonTests(document);
        const checkboxes = document.querySelectorAll("input[type=checkbox]");
        expect(checkboxes.length).toBe(3);
        ReactTestUtils.Simulate.change(checkboxes[2]);
        expect(spyChangeMap).toHaveBeenCalled();
        expect(spyChangeMap.calls.length).toBe(1);
        expect(spyChangeMap.calls[0].arguments).toEqual(['mapInfoControl', true]);
    });
    it('renders center controls and scale controls with Apply to other maps buttons', () => {
        ReactDOM.render(
            <Controls
                map={{
                    center: {x: 11, y: 43, crs: 'EPSG:4326'},
                    zoom: 5,
                    projection: 'EPSG:3857'
                }}
            />, document.getElementById("container"));
        doCommonTests(document);
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-geostory-map-controls-center')).toExist();
        expect(container.querySelector('.ms-geostory-map-controls-scale')).toExist();
        const buttons = container.querySelectorAll('.ms-geostory-map-controls button');
        expect(buttons.length).toBeGreaterThanOrEqualTo(2);
    });
    it('hides center controls when isCarouselSection is true', () => {
        ReactDOM.render(
            <Controls
                map={{
                    center: {x: 11, y: 43, crs: 'EPSG:4326'},
                    zoom: 5
                }}
                isCarouselSection
            />, document.getElementById("container"));
        doCommonTests(document);
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-geostory-map-controls-center')).toNotExist();
        expect(container.querySelector('.ms-geostory-map-controls-scale')).toExist();
    });
    it('calls onApplyToMaps with center when Apply to other maps button is clicked for center', () => {
        const actions = {
            onApplyToMaps: () => {}
        };
        const spy = expect.spyOn(actions, 'onApplyToMaps');
        const center = {x: 11, y: 43, crs: 'EPSG:4326'};
        ReactDOM.render(
            <Controls
                map={{ center, zoom: 5 }}
                onApplyToMaps={actions.onApplyToMaps}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const centerBtn = container.querySelector('.ms-geostory-map-controls-center button');
        expect(centerBtn).toExist();
        ReactTestUtils.Simulate.click(centerBtn);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toBe('center');
        expect(spy.calls[0].arguments[1]).toEqual(center);
    });
    it('calls onApplyToMaps with zoom when Apply to other maps button is clicked for scale', () => {
        const actions = {
            onApplyToMaps: () => {}
        };
        const spy = expect.spyOn(actions, 'onApplyToMaps');
        ReactDOM.render(
            <Controls
                map={{ center: {x: 0, y: 0}, zoom: 8 }}
                onApplyToMaps={actions.onApplyToMaps}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const scaleBtn = container.querySelector('.ms-geostory-map-controls-scale button');
        expect(scaleBtn).toExist();
        ReactTestUtils.Simulate.click(scaleBtn);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toBe('zoom');
        expect(spy.calls[0].arguments[1]).toBe(8);
    });
    it('renders scale options based on projection', () => {
        ReactDOM.render(
            <Controls
                map={{ zoom: 3, projection: 'EPSG:3857' }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const selectValue = container.querySelector('.Select-value-label');
        expect(selectValue).toExist();
        expect(selectValue.textContent).toContain('1 :');
    });
});
