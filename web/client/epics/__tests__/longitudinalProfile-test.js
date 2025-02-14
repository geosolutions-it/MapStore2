/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    LPonDockClosedEpic
} from '../longitudinalProfile';

import { testEpic } from './epicTestUtils';
import { setControlProperty } from '../../actions/controls';
import { CONTROL_DOCK_NAME, CONTROL_NAME, LONGITUDINAL_OWNER, LONGITUDINAL_VECTOR_LAYER_ID, LONGITUDINAL_VECTOR_LAYER_ID_POINT } from '../../plugins/longitudinalProfile/constants';
import { CHANGE_GEOMETRY } from '../../actions/longitudinalProfile';
import { REMOVE_ADDITIONAL_LAYER } from '../../actions/additionallayers';
import { UNREGISTER_EVENT_LISTENER } from '../../actions/map';
import { CHANGE_DRAWING_STATUS } from '../../actions/draw';

describe('longitudinalProfile Epics', () => {
    it('test default LPonDockClosedEpic epic', (done) => {
        const epicResult = actions => {
            const action1 = actions[0];
            const action2 = actions[1];
            const action3 = actions[2];
            const action4 = actions[3];
            expect(action1).toExist();
            expect(action1.type).toEqual(CHANGE_GEOMETRY);
            expect(action1.geometry).toEqual(false);
            expect(action2).toExist();
            expect(action2.type).toEqual(REMOVE_ADDITIONAL_LAYER);
            expect(action2.owner).toEqual(LONGITUDINAL_OWNER);
            expect(action2.id).toEqual(LONGITUDINAL_VECTOR_LAYER_ID);
            expect(action3).toExist();
            expect(action3.type).toEqual(REMOVE_ADDITIONAL_LAYER);
            expect(action3.owner).toEqual(LONGITUDINAL_OWNER);
            expect(action3.id).toEqual(LONGITUDINAL_VECTOR_LAYER_ID_POINT);
            expect(action4).toExist();
            expect(action4.type).toEqual(UNREGISTER_EVENT_LISTENER);
            expect(action4.toolName).toEqual(CONTROL_NAME);
            done();
        };
        testEpic(LPonDockClosedEpic, 4, [setControlProperty(
            CONTROL_DOCK_NAME, 'enabled', false
        )], epicResult, {});
    });
    it('test LPonDockClosedEpic epic if the drawing mode is active', (done) => {
        const epicResult = actions => {
            const action1 = actions[0];
            const action2 = actions[1];
            const action3 = actions[2];
            const action4 = actions[3];
            const action5 = actions[4];
            const action6 = actions[5];
            expect(action1).toExist();
            expect(action1.type).toEqual(CHANGE_GEOMETRY);
            expect(action1.geometry).toEqual(false);
            expect(action2).toExist();
            expect(action2.type).toEqual(REMOVE_ADDITIONAL_LAYER);
            expect(action2.owner).toEqual(LONGITUDINAL_OWNER);
            expect(action2.id).toEqual(LONGITUDINAL_VECTOR_LAYER_ID);
            expect(action3).toExist();
            expect(action3.type).toEqual(REMOVE_ADDITIONAL_LAYER);
            expect(action3.owner).toEqual(LONGITUDINAL_OWNER);
            expect(action3.id).toEqual(LONGITUDINAL_VECTOR_LAYER_ID_POINT);
            // stop drawing
            expect(action4).toExist();
            expect(action4.type).toEqual(CHANGE_DRAWING_STATUS);
            expect(action4.status).toEqual('stop');
            expect(action5).toExist();
            expect(action5.type).toEqual(CHANGE_DRAWING_STATUS);
            expect(action5.status).toEqual('clean');
            expect(action6).toExist();
            expect(action6.type).toEqual(UNREGISTER_EVENT_LISTENER);
            expect(action6.toolName).toEqual(CONTROL_NAME);
            done();
        };
        testEpic(LPonDockClosedEpic, 6, [setControlProperty(
            CONTROL_DOCK_NAME, 'enabled', false
        )], epicResult, {
            "draw": {
                "drawMethod": "LineString",
                "drawStatus": "start",
                "drawOwner": CONTROL_NAME
            }
        });
    });
});
