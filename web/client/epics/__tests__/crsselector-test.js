/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { updateCrsSelectorConfigEpic } from '../crsselector';
import { configureMap } from '../../actions/config';
import { SET_PROJECTIONS_CONFIG } from '../../actions/crsselector';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';

describe('crsselector epics', () => {
    it('should dispatch setProjectionsConfig when MAP_CONFIG_LOADED has crsSelector config', (done) => {
        const action = configureMap({
            crsSelector: {
                projectionList: ['EPSG:4326', 'EPSG:3857']
            }
        });
        testEpic(
            updateCrsSelectorConfigEpic,
            1,
            action,
            (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(SET_PROJECTIONS_CONFIG);
                expect(actions[0].config.projectionList).toEqual(['EPSG:4326', 'EPSG:3857']);
            },
            {},
            done
        );
    });

    it('should not dispatch action when MAP_CONFIG_LOADED has no crsSelector config', (done) => {
        const action = configureMap({});
        testEpic(
            addTimeoutEpic(updateCrsSelectorConfigEpic),
            1,
            action,
            (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
            },
            {},
            done
        );
    });
});
