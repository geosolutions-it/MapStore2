/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { loadMapConfigAndConfigureMap } from '../config';
import {
    loadMapConfig,
    MAP_CONFIG_LOADED,
    MAP_CONFIG_LOAD_ERROR
} from '../../actions/config';

import { testEpic } from './epicTestUtils';

describe('config epics', () => {
    describe('loadMapConfigAndConfigureMap', () => {
        it('load existing configuration file', (done) => {
            const checkActions = ([a]) => {
                expect(a).toExist();
                expect(a.type).toBe(MAP_CONFIG_LOADED);
                done();
            };
            testEpic(loadMapConfigAndConfigureMap,
                1,
                [loadMapConfig('base/web/client/test-resources/testConfig.json')],
                checkActions
            );
        });
        it('does not load a missing configuration file', (done) => {
            const checkActions = ([a]) => {
                expect(a).toExist();
                expect(a.type).toBe(MAP_CONFIG_LOAD_ERROR);
                done();
            };
            testEpic(loadMapConfigAndConfigureMap,
                1,
                [loadMapConfig('missingConfig.json')],
                checkActions);
        });
        it('load broken configuration file', (done) => {
            const checkActions = ([a]) => {
                expect(a).toExist();
                expect(a.type).toBe(MAP_CONFIG_LOAD_ERROR);
                done();
            };
            testEpic(loadMapConfigAndConfigureMap,
                1,
                [loadMapConfig('base/web/client/test-resources/testConfig.broken.json')],
                checkActions);
        });
    });
});

