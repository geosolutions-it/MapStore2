/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var mapConfig = require('../config');


describe('Test the mapConfig reducer', () => {
    it('creates a configuration object from loaded config', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', config: { map: { center: {x: 1, y: 1}, zoom: 11 }}});
        expect(state.zoom).toExist();
        expect(state.center).toExist();
        expect(state.center.crs).toExist();
    });

    it('creates a configuration object from legacy config', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', config: { map: { center: [1361886.8627049, 5723464.1181097], zoom: 11 }}}, true);
        expect(state.zoom).toExist();
        expect(state.center).toExist();
        expect(state.center.crs).toExist();
    });

    it('creates an error on wrongly loaded config', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOAD_ERROR', error: 'error'});
        expect(state.loadingError).toExist();
    });

    it('returns original state on unrecognized action', () => {
        var state = mapConfig(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });

    it('return an updated state with new values for both zoom and center', () => {
        const oldState = {
            a: 'zero',
            zoom: 'zero',
            center: 'zero'
        };
        var state = mapConfig(oldState, {
            type: 'CHANGE_MAP_VIEW',
            zoom: 0,
            center: 0,
            bbox: 0,
            size: 0
        });
        expect(state.a).toBe(oldState.a);
        expect(state.zoom).toBe(0);
        expect(state.center).toBe(0);
        expect(state.bbox).toBe(0);
        expect(state.size).toBe(0);
    });
});
