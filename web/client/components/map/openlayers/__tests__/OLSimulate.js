/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MapBrowserEvent from 'ol/MapBrowserEvent';
import Event from 'ol/events/Event';

// from https://github.com/openlayers/openlayers/blob/v7.5.1/test/browser/spec/ol/interaction/modify.test.js
export function simulateEvent({ map, type, x, y, modifiers = {}, button, width, height }) {
    const viewport = map.getViewport();
    // calculated in case body has top < 0 (test runner with small window)
    const position = viewport.getBoundingClientRect();
    const pointerEvent = new Event();
    pointerEvent.type = type;
    pointerEvent.target = viewport.firstChild;
    pointerEvent.clientX = position.left + x + width / 2;
    pointerEvent.clientY = position.top + y + height / 2;
    pointerEvent.shiftKey = modifiers.shift || false;
    pointerEvent.altKey = modifiers.alt || false;
    pointerEvent.pointerId = 1;
    pointerEvent.preventDefault = () => {};
    pointerEvent.button = button;
    pointerEvent.isPrimary = true;
    const event = new MapBrowserEvent(type, map, pointerEvent);
    map.handleMapBrowserEvent(event);
}

export function simulateDragEvent({ map, from, to, button, width, height }) {
    simulateEvent({ type: 'pointermove', map, x: from[0], y: from[1], button, width, height});
    simulateEvent({ type: 'pointerdown', map, x: from[0], y: from[1], button, width, height});
    simulateEvent({ type: 'pointermove', map, x: to[0], y: to[1], button, width, height});
    simulateEvent({ type: 'pointerdrag', map, x: to[0], y: to[1], button, width, height});
    simulateEvent({ type: 'pointerup', map, x: to[0], y: to[1], button, width, height});
}

export function simulatePointerClickEvent({ map, x, y, button, width, height }) {
    simulateEvent({ type: 'pointermove', map, x, y, button, width, height});
    simulateEvent({ type: 'pointerdown', map, x, y, button, width, height});
    simulateEvent({ type: 'pointerup', map, x, y, button, width, height});
}
