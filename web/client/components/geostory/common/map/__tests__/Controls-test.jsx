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
    expect(el).toBeTruthy();
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
        expect(spyChangeMap.mock.calls.length).toBe(2);
        expect(spyChangeMap.mock.calls[0]).toEqual(['zoomControl', false]);
        expect(spyChangeMap.mock.calls[1]).toEqual(['mapOptions.interactions', { doubleClickZoom: newZoomStatus, shiftDragZoom: newZoomStatus, pinchZoom: newZoomStatus } ]);
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
        expect(spyChangeMap.mock.calls.length).toBe(1);
        expect(spyChangeMap.mock.calls[0]).toEqual(['mapOptions.interactions', { dragPan: newDragPanStatus, keyboardPan: newDragPanStatus } ]);
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
        expect(spyChangeMap.mock.calls.length).toBe(1);
        expect(spyChangeMap.mock.calls[0]).toEqual(['mapInfoControl', true]);
    });
});
