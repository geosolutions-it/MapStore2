/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { resetLayerSwipeSettingsEpic, deactivateSwipeToolOnSwitchMaps } from '../swipe';
import { selectNode } from '../../actions/layers';
import { onLocationChanged } from 'connected-react-router';
import { testEpic } from './epicTestUtils';
import { SET_ACTIVE } from '../../actions/swipe';

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
    it('reset activation of layer swipe tool when maps are switch', done => {
        const state = {
            swipe: {
                active: true
            }
        };
        testEpic(
            deactivateSwipeToolOnSwitchMaps,
            1,
            onLocationChanged({}),
            actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toEqual(SET_ACTIVE);
                expect(actions[0].active).toEqual(false);
                done();
            }, state, done);
    });
});
