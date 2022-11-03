/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function simulateMouseEvent(target, type, options) {
    target.setPointerCapture = () => {};
    target.dispatchEvent(new MouseEvent(type, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 10,
        clientY: 10,
        button: 0,
        ...options
    }));
}

export function simulateClick(target, options) {
    // cesium uses pointer events when available instead of native click
    simulateMouseEvent(target, 'pointerdown', options);
    simulateMouseEvent(target, 'pointerup', options);
}

export function simulateDoubleClick(target, options) {
    // in the browser the user trigger the double click and pointer down at the same time
    simulateClick(target, options);
    simulateClick(target, options);
    simulateMouseEvent(target, 'dblclick', options);
}
