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
    it('test layer visibility change for background', () => {
        const oldState = {
            layers: [{
                "type": "osm",
                "title": "Open Street Map",
                "name": "mapnik",
                "group": "background",
                "visibility": true
            }, {
                "type": "wms",
                "url": "http://213.215.135.196/reflector/open/service",
                "visibility": false,
                "title": "e-Geos Ortofoto RealVista 1.0",
                "name": "rv1",
                "group": "background",
                "format": "image/png"
            }]
        };
        var state = mapConfig(oldState, {
            type: 'CHANGE_LAYER_PROPERTIES',
            newProperties: {
                "type": "wms",
                "url": "http://213.215.135.196/reflector/open/service",
                "visibility": true,
                "title": "e-Geos Ortofoto RealVista 1.0",
                "name": "rv1",
                "group": "background",
                "format": "image/png"
            },
            position: 1
        });
        var layers = state.layers;
        expect(layers[0].visibility).toBe(false);
        expect(layers[1].visibility).toBe(true);
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
});
