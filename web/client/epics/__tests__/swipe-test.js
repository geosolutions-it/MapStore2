/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { resetLayerSwipeSettingsEpic, updateSwipeToolConfigMapConfigRawData } from '../swipe';
import { selectNode } from '../../actions/layers';
import { testEpic } from './epicTestUtils';
import { SET_ACTIVE, SET_SWIPE_TOOL_CONFIG } from '../../actions/swipe';
import { configureMap } from '../../actions/config';

describe('SWIPE EPICS', () => {
    it('reset activation of layer swipe tool selected nodeType is group', done => {
        const state = {
            swipe: {
                active: true
            }
        };
        testEpic(
            resetLayerSwipeSettingsEpic,
            1,
            selectNode('groupId', 'group', false),
            actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toEqual(SET_ACTIVE);
                expect(actions[0].active).toEqual(false);
                done();
            }, state, done);
    });
    it('should update swipe tool state with config from map config raw data', done => {
        const state = {
            swipe: {}
        };
        const config = {
            swipe: {
                mode: "spy",
                spy: {radius: 50.00} }
        };
        testEpic(
            updateSwipeToolConfigMapConfigRawData,
            1,
            configureMap(config, 'map_id', undefined),
            actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toEqual(SET_SWIPE_TOOL_CONFIG);
                expect(actions[0].config).toEqual(config.swipe);
                done();
            }, state, done);
    });
});
