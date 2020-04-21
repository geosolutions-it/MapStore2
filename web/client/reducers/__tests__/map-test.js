/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {round} = require('lodash');

var mapConfig = require('../map');
const { changeMapLimits, PAN_TO, SET_MAP_RESOLUTIONS } = require('../../actions/map');

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

    it('sets new map scales', () => {
        // set map scales
        const action = {
            type: 'CHANGE_MAP_SCALES',
            scales: [9600, 960]
        };
        const resolutions = [2.54, 0.254];
        const action2 = {
            type: 'CHANGE_MAP_SCALES',
            scales: [38400, 19200, 9600, 4800]
        };
        const resolutions2 = [10.16, 5.08, 2.54, 1.27];
        // reset map scales
        const actionReset = {
            type: 'CHANGE_MAP_SCALES'
        };

        // add map scales
        var state = mapConfig({projection: "EPSG:3857"}, action);
        expect(state.mapOptions).toExist();
        expect(state.mapOptions.view).toExist();
        expect(state.mapOptions.view.resolutions).toEqual(resolutions);
        expect(state.projection).toBe("EPSG:3857");

        // update map scales
        state = mapConfig(state, action2);
        expect(state.mapOptions).toExist();
        expect(state.mapOptions.view).toExist();
        expect(state.mapOptions.view.resolutions).toEqual(resolutions2);

        // remove state.mapOptions on map scales reset
        state = mapConfig({
            mapOptions: {
                view: {
                    resolutions: [8, 4, 2]
                }
            },
            prop: 'prop'
        }, actionReset);
        expect(state.mapOptions).toNotExist();
        expect(state.prop).toBe('prop');

        // remove only state.mapOptions.view on map scales reset
        state = mapConfig({
            mapOptions: {
                view: {
                    resolutions: [8, 4, 2]
                },
                prop: 'prop'
            }
        }, actionReset);
        expect(state.mapOptions).toExist();
        expect(state.mapOptions.view).toNotExist();
        expect(state.mapOptions.prop).toBe('prop');

        // remove only state.mapOptions.view.resolutions on map scales reset
        state = mapConfig({
            mapOptions: {
                view: {
                    resolutions: [8, 4, 2],
                    prop: 'prop'
                }
            }
        }, actionReset);
        expect(state.mapOptions).toExist();
        expect(state.mapOptions.view).toExist();
        expect(state.mapOptions.view.resolutions).toNotExist();
        expect(state.mapOptions.view.prop).toBe('prop');

        // add map scales with no initial state
        state = mapConfig(undefined, action);
        expect(state).toExist();
        expect(state.mapOptions).toExist();
        expect(state.mapOptions.view).toExist();
        expect(state.mapOptions.view.resolutions).toExist();
    });

    it('sets new resolutions', () => {
        const resolutions = [2.54, 0.254];
        const action = {
            type: SET_MAP_RESOLUTIONS,
            resolutions
        };
        const state = mapConfig({}, action);
        expect(state.resolutions).toEqual(resolutions);
    });

    it('pan to with center as array', () => {
        const action = {
            type: PAN_TO,
            center: [2, 2]
        };
        const state = mapConfig({}, action);
        expect(state.center).toEqual( { x: 2, y: 2, srs: "EPSG:4326", crs: "EPSG:4326" } );
    });
    it('pan to with center as object', () => {
        const action = {
            type: PAN_TO,
            center: { x: 1000, y: 1000, crs: "EPSG:3857" }
        };
        const state = mapConfig({}, action);
        expect(round(state.center.x, 8)).toEqual(0.00898315);
        expect(round(state.center.y, 8)).toEqual(0.00898315);
        expect(state.center.srs).toEqual("EPSG:4326");
    });
    it('change map style', () => {
        const action = {
            type: 'CHANGE_MAP_STYLE',
            style: {width: 100},
            mapStateSource: "test"
        };
        var state = mapConfig({projection: "EPSG:4326"}, action);
        expect(state.mapStateSource).toBe("test");
        expect(state.style.width).toBe(100);
    });
    it('change map rotation', () => {
        let rotation = 0.5235987755982989;
        const action = {
            type: 'CHANGE_ROTATION',
            rotation: rotation,
            mapStateSource: "test"
        };
        let state = mapConfig({}, action);
        expect(state.bbox.rotation).toEqual(rotation);
        expect(state.mapStateSource).toBe("test");
    });

    it('change map version', () => {
        let version = 2;
        const action = {
            type: 'UPDATE_VERSION',
            version
        };
        let state = mapConfig({}, action);
        expect(state.version).toEqual(version);
    });

    it('force resize update of map', () => {
        const action = {
            type: 'RESIZE_MAP'
        };
        let state = mapConfig({}, action);
        expect(state.resize).toEqual(1);
    });
    it('change the restricted extent of a map', () => {
        const action = changeMapLimits({
            restrictedExtent: [9, 9, 9, 9],
            crs: "EPSG:4326"
        });
        let state = mapConfig({}, action);
        expect(state.limits.restrictedExtent.length).toBe(4);
        expect(state.limits.restrictedExtent).toEqual([9, 9, 9, 9]);
    });
    it('change min zoom a map', () => {
        const action = changeMapLimits({
            minZoom: 1
        });
        let state = mapConfig({}, action);
        expect(state.limits.minZoom).toBe(1);
    });

    it('zoom to a point', () => {
        const pos = {x: 1, y: 2};
        const zoom = 12;
        const crs = "EPSG:4326";
        const action = {
            type: 'ZOOM_TO_POINT',
            pos,
            zoom,
            crs
        };
        let state = mapConfig({}, action);
        expect(state.center).toEqual({...pos, srs: crs, crs});
        expect(state.zoom).toEqual(zoom);
        expect(state.mapStateSource).toEqual(null);
    });
});
