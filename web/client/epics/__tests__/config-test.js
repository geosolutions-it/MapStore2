/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {head} from 'lodash';
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
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';
import configBroken from "raw-loader!../../test-resources/testConfig.broken.json.txt";

const api = {
    getResource: () => Promise.resolve({mapId: 1234})
};
let mockAxios;

describe('config epics', () => {
    describe('loadMapConfigAndConfigureMap', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });

        it('load existing configuration file', (done) => {
            mockAxios.onGet("/base/web/client/test-resources/testConfig.json").reply(() => ([ 200, {} ]));
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
        it('load existing configuration file, with unsupported projection 31468', (done) => {
            const checkActions = ([a]) => {
                expect(a).toExist();
                expect(a.type).toBe(MAP_CONFIG_LOAD_ERROR);
                expect(a.error).toEqual({errorMessageParams: {projection: "EPSG:31468"}, messageId: "map.errors.loading.projectionError"});
                done();
            };
            testEpic(loadMapConfigAndConfigureMap,
                1,
                [loadMapConfig('base/web/client/test-resources/testConfigEPSG31468.json')],
                checkActions
            );
        });
        it('load existing configuration file with mapId', (done) => {
            mockAxios.onGet("/base/web/client/test-resources/testConfig.json").reply(() => ([ 200, {} ]));
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
            mockAxios.onGet("missingConfig.json").reply(() => ([ 404, {} ]));
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
            mockAxios.onGet("/base/web/client/test-resources/testConfig.broken.json").reply(() => ([ 200, configBroken  ]));
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
        it('load new map as anonymous user', (done) => {
            mockAxios.onGet("/new.json").reply(() => ([ 200, {} ]));
            const NUM_ACTIONS = 1;
            testEpic(loadMapConfigAndConfigureMap, NUM_ACTIONS, loadMapConfig('new.json'), (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const action = head(actions);
                expect(action).toExist();
                expect(action.type).toBe(MAP_CONFIG_LOAD_ERROR);
                expect(action.error.status).toBe(403);
                done();
            });
        });
        it('load new map as ADMIN', (done) => {
            const NUM_ACTIONS = 1;
            mockAxios.onGet("/new.json").reply(() => ([ 200, {} ]));
            testEpic(loadMapConfigAndConfigureMap, NUM_ACTIONS, loadMapConfig('new.json'), (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [a1] = actions;
                expect(a1).toExist();
                expect(a1.type).toBe(MAP_CONFIG_LOADED);
                done();
            }, {
                security: {
                    user: {
                        role: "ADMIN",
                        name: "Saitama"
                    }
                }
            });
        });
        it('load new map as USER', (done) => {
            const NUM_ACTIONS = 1;
            mockAxios.onGet("/new.json").reply(() => {
                return [ 200, {} ];
            });
            testEpic(loadMapConfigAndConfigureMap, NUM_ACTIONS, loadMapConfig('new.json'), (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [a1] = actions;
                expect(a1).toExist();
                expect(a1.type).toBe(MAP_CONFIG_LOADED);
                done();
            }, {
                security: {
                    user: {
                        role: "USER",
                        name: "Saitama"
                    }
                }
            });
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

