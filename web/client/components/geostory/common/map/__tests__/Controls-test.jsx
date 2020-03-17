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
});
