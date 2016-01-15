/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var mapConfig = require('../map');


describe('Test the map reducer', () => {
    it('returns original state on unrecognized action', () => {
        var state = mapConfig(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });

    it('return an updated state with new values for both zoom and center', () => {
        const oldState = {
            a: 'zero',
            zoom: 'zero',
            center: 'zero',
            projection: 'EPSG:4326'
        };
        var state = mapConfig(oldState, {
            type: 'CHANGE_MAP_VIEW',
            zoom: 0,
            center: 0,
            bbox: 0,
            size: 0,
            projection: 'EPSG:3857'
        });
        expect(state.a).toBe(oldState.a);
        expect(state.zoom).toBe(0);
        expect(state.center).toBe(0);
        expect(state.bbox).toBe(0);
        expect(state.size).toBe(0);
        expect(state.projection).toBe('EPSG:3857');
    });

    it('sets a new mouse pointer used over the map', () => {
        const action = {
            type: 'CHANGE_MOUSE_POINTER',
            pointer: "testPointer"
        };

        var state = mapConfig({}, action);
        expect(state.mousePointer).toBe(action.pointer);

        state = mapConfig({prop: 'prop'}, action);
        expect(state.prop).toBe('prop');
        expect(state.mousePointer).toBe(action.pointer);
    });

    it('sets a new zoom level', () => {
        const action = {
            type: 'CHANGE_ZOOM_LVL',
            zoom: 9
        };

        var state = mapConfig({}, action);
        expect(state.zoom).toBe(9);

        state = mapConfig({prop: 'prop'}, action);
        expect(state.prop).toBe('prop');
        expect(state.zoom).toBe(9);
    });

    it('sets a new crs', () => {
        const action = {
            type: 'CHANGE_MAP_CRS',
            crs: 'EPSG:4326'
        };

        var state = mapConfig({}, action);
        expect(state.projection).toBe('EPSG:4326');

        state = mapConfig({prop: 'prop'}, action);
        expect(state.prop).toBe('prop');
        expect(state.projection).toBe('EPSG:4326');
    });
});
