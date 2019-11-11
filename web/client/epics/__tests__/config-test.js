/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { loadMapConfigAndConfigureMap, loadMapInfoEpic } from '../config';
import {
    loadMapConfig,
    MAP_CONFIG_LOADED,
    MAP_CONFIG_LOAD_ERROR,
    LOAD_MAP_INFO,
    MAP_INFO_LOADED,
    MAP_INFO_LOAD_START,
    loadMapInfo
} from '../../actions/config';

import { testEpic } from './epicTestUtils';
import Persistence from '../../api/persistence';

const api = {
    getResource: () => Promise.resolve({mapId: 1234})
};


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
        it('load existing configuration file with mapId', (done) => {
            const checkActions = ([a, b]) => {
                expect(a).toExist();
                expect(a.type).toBe(MAP_CONFIG_LOADED);
                expect(b.type).toBe(LOAD_MAP_INFO);
                done();
            };
            testEpic(loadMapConfigAndConfigureMap,
                2,
                [loadMapConfig('base/web/client/test-resources/testConfig.json', 1398)],
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

    describe('loadMapInfo', () => {
        Persistence.addApi("testConfig", api);
        beforeEach(() => {
            Persistence.setApi("testConfig");
        });
        afterEach(() => {
            Persistence.setApi("geostore");
        });

        it('load map info', (done) => {
            const checkActions = ([a, b]) => {
                expect(a).toExist();
                expect(a.type).toBe(MAP_INFO_LOAD_START);
                expect(b.type).toBe(MAP_INFO_LOADED);
                done();
            };
            testEpic(loadMapInfoEpic,
                2,
                loadMapInfo(1234),
                checkActions
            );
        });
    });
});

