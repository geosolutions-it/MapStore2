/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { testEpic } from './epicTestUtils';
import { exportMapContext as exportMapContextEpic } from '../mapexport';
import { exportMap } from '../../actions/mapexport';
import { SET_CONTROL_PROPERTY } from '../../actions/controls';
import { SHOW_NOTIFICATION } from '../../actions/notifications';

describe('Map Export Epics', () => {
    it('export map', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(SET_CONTROL_PROPERTY);
            expect(action.control).toBe('export');
            done();
        };
        const state = {
            map: {
                present: {
                    center: {
                        x: -71.88845339541245,
                        y: 37.25911173702324,
                        crs: 'EPSG:4326'
                    },
                    maxExtent: [
                        -20037508.34,
                        -20037508.34,
                        20037508.34,
                        20037508.34
                    ]
                }
            }
        };
        testEpic(exportMapContextEpic, 1, exportMap(), epicResult, state);
    });

    it('fail to export map', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(SHOW_NOTIFICATION);
            expect(action.level).toBe('error');
            done();
        };
        testEpic(exportMapContextEpic, 1, exportMap(), epicResult, {});
    });
});
