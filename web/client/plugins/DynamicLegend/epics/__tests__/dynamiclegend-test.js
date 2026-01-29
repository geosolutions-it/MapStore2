/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from '../../../../epics/__tests__/epicTestUtils';
import { dynamicLegendMapLayoutEpic } from '../dynamiclegend';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '../../../../actions/maplayout';
import { CONTROL_NAME } from '../../constants';

describe('dynamiclegend epics', () => {

    it('should update map layout when dynamic legend is enabled, not floating and source is not dynamic-legend', (done) => {
        const layout = {
            right: 300,
            boundingSidebarRect: { right: 200 },
            boundingMapRect: { left: 0, top: 0 }
        };

        testEpic(
            addTimeoutEpic(dynamicLegendMapLayoutEpic, 10),
            1,
            updateMapLayout(layout),
            actions => {
                expect(actions[0].type).toBe(UPDATE_MAP_LAYOUT);
                expect(actions[0].source).toBe(CONTROL_NAME);
                expect(actions[0].layout.right).toBe(620);
                expect(actions[0].layout.rightPanel).toBe(true);
                expect(actions[0].layout.boundingMapRect.right).toBe(620);
                expect(actions[0].layout.boundingSidebarRect.right).toBe(200);
                done();
            },
            {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                },
                dynamiclegend: {
                    config: {
                        isFloating: false
                    }
                }
            }
        );
    });

    it('should not update map layout when dynamic-legend is disabled', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const layout = { right: 300 };

        testEpic(
            addTimeoutEpic(dynamicLegendMapLayoutEpic, 10),
            NUMBER_OF_ACTIONS,
            updateMapLayout(layout),
            actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            },
            {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: false
                    }
                },
                dynamiclegend: {
                    config: {
                        isFloating: false
                    }
                }
            }
        );
    });

    it('should not update map layout when source is dynamic-legend', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const layout = { right: 300 };

        testEpic(
            addTimeoutEpic(dynamicLegendMapLayoutEpic, 10),
            NUMBER_OF_ACTIONS,
            { ...updateMapLayout(layout), source: CONTROL_NAME },
            actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            },
            {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                },
                dynamiclegend: {
                    config: {
                        isFloating: false
                    }
                }
            }
        );
    });
});

