/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from "expect";

import {CONTROL_DOCK_NAME} from '../../plugins/longitudinalProfile/constants';
import {SET_CONTROL_PROPERTY} from "../controls";
import {
    ADD_PROFILE_DATA,
    addProfileData,
    CHANGE_DISTANCE,
    CHANGE_GEOMETRY,
    CHANGE_REFERENTIAL,
    changeDistance,
    changeGeometry,
    changeReferential,
    closeDock,
    initialized,
    INITIALIZED,
    loading,
    LOADING,
    openDock,
    setupPlugin,
    SETUP,
    TEAR_DOWN,
    tearDown,
    TOGGLE_MAXIMIZE,
    TOGGLE_MODE,
    toggleMaximize,
    toggleMode
} from "../longitudinalProfile";

describe('Test correctness of the actions', () => {
    it('setup', () => {
        const config = {configProp1: 'example', configProp2: 'test'};
        const action = setupPlugin(config);
        expect(action).toExist();
        expect(action.type).toBe(SETUP);
        expect(action.config).toEqual(config);
    });

    it('initialized', () => {
        const action = initialized();
        expect(action).toExist();
        expect(action.type).toBe(INITIALIZED);
    });

    it('tearDown', () => {
        const action = tearDown();
        expect(action).toExist();
        expect(action.type).toBe(TEAR_DOWN);
    });

    it('openDock', () => {
        const action = openDock();
        expect(action).toExist();
        expect(action.type).toBe(SET_CONTROL_PROPERTY);
        expect(action.control).toBe(CONTROL_DOCK_NAME);
        expect(action.property).toBe('enabled');
        expect(action.value).toBe(true);
    });

    it('closeDock', () => {
        const action = closeDock();
        expect(action).toExist();
        expect(action.type).toBe(SET_CONTROL_PROPERTY);
        expect(action.control).toBe(CONTROL_DOCK_NAME);
        expect(action.property).toBe('enabled');
        expect(action.value).toBe(false);
    });

    it('toggleMode - no mode passed', () => {
        const action = toggleMode();
        expect(action).toExist();
        expect(action.type).toBe(TOGGLE_MODE);
        expect(action.mode).toBe(undefined);
    });

    it('toggleMode - mode passed', () => {
        const action = toggleMode('draw');
        expect(action).toExist();
        expect(action.type).toBe(TOGGLE_MODE);
        expect(action.mode).toBe('draw');
    });

    it('addProfileData', () => {
        const infos = { prop1: true, prop2: 10, prop3: 'test'};
        const points = [[[1, 2, 5], [2, 3, 5]]];
        const projection = 'EPSG:3857';
        const action = addProfileData(infos, points, projection);
        expect(action).toExist();
        expect(action.type).toBe(ADD_PROFILE_DATA);
        expect(action.infos).toEqual(infos);
        expect(action.points[0]).toEqual(points[0]);
        expect(action.points[1]).toEqual(points[1]);
        expect(action.projection).toEqual(projection);
    });

    it('loading', () => {
        const action = loading(true);
        expect(action).toExist();
        expect(action.type).toBe(LOADING);
        expect(action.state).toBe(true);
    });

    it('changeReferential', () => {
        const action = changeReferential('ref2');
        expect(action).toExist();
        expect(action.type).toBe(CHANGE_REFERENTIAL);
        expect(action.referential).toBe('ref2');
    });

    it('changeDistance', () => {
        const action = changeDistance(200);
        expect(action).toExist();
        expect(action.type).toBe(CHANGE_DISTANCE);
        expect(action.distance).toBe(200);
    });

    it('changeGeometry', () => {
        const geometry = { point: [2, 5], center: [1, 1]};
        const action = changeGeometry(geometry);
        expect(action).toExist();
        expect(action.type).toBe(CHANGE_GEOMETRY);
        expect(action.geometry).toExist();
        expect(action.geometry.point).toEqual([2, 5]);
        expect(action.geometry.center).toEqual([1, 1]);
    });

    it('toggleMaximize', () => {
        const action = toggleMaximize();
        expect(action).toExist();
        expect(action.type).toBe(TOGGLE_MAXIMIZE);
    });
});
