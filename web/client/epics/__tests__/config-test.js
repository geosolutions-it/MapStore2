/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {head} from 'lodash';
import {
    loadMapConfigAndConfigureMap, loadMapInfoEpic, storeDetailsInfoDashboardEpic, storeDetailsInfoEpic, backgroundsListInitEpic,    getSupportedFormatsEpic
} from '../config';
import {LOAD_USER_SESSION} from '../../actions/usersession';
import {
    loadMapConfig,
    MAP_CONFIG_LOADED,
    MAP_CONFIG_LOAD_ERROR,
    LOAD_MAP_INFO,
    MAP_INFO_LOADED,
    MAP_INFO_LOAD_START,
    loadMapInfo,
    mapInfoLoaded,
    configureMap
} from '../../actions/config';

import { TEST_TIMEOUT, addTimeoutEpic, testEpic } from './epicTestUtils';
import Persistence from '../../api/persistence';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';
import configBroken from "raw-loader!../../test-resources/testConfig.broken.json.txt";
import testConfigEPSG31468 from "raw-loader!../../test-resources/testConfigEPSG31468.json.txt";
import ConfigUtils from "../../utils/ConfigUtils";
import { DETAILS_LOADED } from '../../actions/details';
import { EMPTY_RESOURCE_VALUE } from '../../utils/MapInfoUtils';
import { dashboardLoaded } from '../../actions/dashboard';
import {
    formatOptionsFetch,
    FORMAT_OPTIONS_LOADING,
    SET_FORMAT_OPTIONS,
    SHOW_FORMAT_ERROR
} from '../../actions/catalog';
const api = {
    getResource: (id, {includeAttributes = true, withData = true}) => {
        if (!includeAttributes && !withData) {
            return Promise.resolve({mapId: id});
        }

        return Promise.resolve({data: {} });
    }
};
let mockAxios;

describe('config epics', () => {
    it('getSupportedFormatsEpic wms', (done) => {
        const NUM_ACTIONS = 4;
        const url = "base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml";
        testEpic(addTimeoutEpic(getSupportedFormatsEpic, 0), NUM_ACTIONS, formatOptionsFetch(url), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                    case SET_FORMAT_OPTIONS:
                        expect(action.formats).toBeTruthy();
                        expect(action.formats.imageFormats).toEqual(['image/png', 'image/gif', 'image/jpeg', 'image/png8', 'image/png; mode=8bit', 'image/vnd.jpeg-png']);
                        expect(action.formats.infoFormats).toEqual(['text/plain', 'text/html', 'application/json']);
                        break;
                    case SHOW_FORMAT_ERROR:
                        expect(action.status).toBeFalsy();
                        break;
                    case FORMAT_OPTIONS_LOADING:
                        break;
                    case TEST_TIMEOUT:
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
            } catch (e) {
                done(e);
            }
            done();
        }, {
            catalog: {}
        });
    });
    describe('loadMapConfigAndConfigureMap', () => {
        beforeEach(done => {
            ConfigUtils.setConfigProp("userSessions", {
                enabled: false
            });
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
            mockAxios.onGet("/base/web/client/test-resources/testConfigEPSG31468.json").reply(() => ([ 200, testConfigEPSG31468 ]));
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
        it('load existing configuration file with mapId and usersession', (done) => {
            ConfigUtils.setConfigProp("userSessions", {
                enabled: true
            });
            mockAxios.onGet("/base/web/client/test-resources/testConfig.json").reply(() => ([ 200, {} ]));
            mockAxios.onGet("/base/web/client/test-resources/testConfig.json").reply(() => ([ 200, {} ]));
            const checkActions = ([a]) => {
                expect(a).toExist();
                expect(a.type).toBe(LOAD_USER_SESSION);
                done();
            };
            testEpic(loadMapConfigAndConfigureMap,
                1,
                [loadMapConfig('base/web/client/test-resources/testConfig.json', 1398)],
                checkActions,
                {
                    security: {
                        user: {
                            role: "ADMIN",
                            name: "Saitama"
                        }
                    }
                }
            );
        });
        // this option is used by contexts (for loading their own session) and for context-manager (empty object, to not use a session at all)
        it('don\'t use the user session if the localConfig.json includes it\'s own overrides', (done) => {
            ConfigUtils.setConfigProp("userSessions", {
                enabled: true
            });
            mockAxios.onGet("/base/web/client/test-resources/testConfig.json").reply(() => ([ 200, {} ]));
            mockAxios.onGet("/base/web/client/test-resources/testConfig.json").reply(() => ([ 200, {} ]));
            const checkActions = ([a, b, c]) => {
                expect(a).toExist();
                expect(a.type).toNotEqual(LOAD_USER_SESSION);
                expect(b.type).toNotEqual(LOAD_USER_SESSION);
                expect(c.type).toNotEqual(LOAD_USER_SESSION);
                done();
            };
            testEpic(loadMapConfigAndConfigureMap,
                3,
                [loadMapConfig('base/web/client/test-resources/testConfig.json', 1398, undefined, undefined, {})],
                checkActions,
                {
                    security: {
                        user: {
                            role: "ADMIN",
                            name: "Saitama"
                        }
                    }
                }
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
        it('load a context with new map as anonymous user', (done) => {
            mockAxios.onGet("/new.json").reply(() => ([ 200, {} ]));
            const NUM_ACTIONS = 1;
            testEpic(loadMapConfigAndConfigureMap, NUM_ACTIONS, loadMapConfig('new.json', null, { version: 2}), (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [a] = actions;
                expect(a).toExist();
                expect(a.type).toBe(MAP_CONFIG_LOADED);
                done();
            });
        });
        it('load a context with new map with override', (done) => {
            mockAxios.onGet("/new.json").reply(() => ([ 200, {} ]));
            const NUM_ACTIONS = 1;
            testEpic(loadMapConfigAndConfigureMap, NUM_ACTIONS, loadMapConfig('new.json', null, { version: 2}, undefined, {myproperty: "myvalue"}), (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [a] = actions;
                expect(a).toExist();
                expect(a.type).toBe(MAP_CONFIG_LOADED);
                expect(a.config).toExist();
                expect(a.config.version).toBe(2);
                expect(a.config.myproperty).toBe("myvalue");
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
        it('load existing configuration file with alphanumeric mapId', (done) => {
            mockAxios.onGet("/base/web/client/test-resources/testConfig.json").reply(() => ([ 200, {} ]));
            const checkActions = ([a]) => {
                expect(a).toBeTruthy();
                expect(a.type).toBe(MAP_CONFIG_LOADED);
                done();
            };
            testEpic(loadMapConfigAndConfigureMap,
                1,
                [loadMapConfig('base/web/client/test-resources/testConfig.json', 'testConfig')],
                checkActions
            );
        });
    });

    describe('loadMapInfo', () => {
        const id = 1234;
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
                loadMapInfo(id),
                checkActions
            );
        });
        it('loadMapInfo will not fetch data', (done) => {
            const checkActions = ([a, b]) => {
                expect(a).toExist();
                expect(b).toExist();
                expect(b.type).toBe(MAP_INFO_LOADED);
                expect(b?.info?.data).toEqual({});
                done();
            };
            testEpic(loadMapInfoEpic,
                2,
                loadMapInfo(id),
                checkActions
            );
        });
    });
    describe("storeDetailsInfoEpic", () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        const mapId = 1;
        const map = {
            id: mapId,
            name: "name"
        };
        const mapWithAttr = {
            id: mapId,
            name: "name",
            attributes: {
                details: "blabla",
                detailsSettings: {}
            }
        };

        it('test storeDetailsInfoEpic', (done) => {
            const NUM_ACTION = 1;
            testEpic(storeDetailsInfoEpic, NUM_ACTION, mapInfoLoaded(mapWithAttr, mapId), actions => {
                expect(actions.length).toBe(NUM_ACTION);
                actions.map((action) => {

                    switch (action.type) {
                    case DETAILS_LOADED:
                        expect(action.id).toBe(mapId);
                        expect(action.detailsUri).toBe("blabla");
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {mapInitialConfig: {
                "mapId": mapId
            }});
        });
        it('test storeDetailsInfoEpic when api returns NODATA value', (done) => {
            // const mock = new MockAdapter(axios);
            const NUM_ACTION = 1;
            testEpic(addTimeoutEpic(storeDetailsInfoEpic), NUM_ACTION, mapInfoLoaded(map, mapId), actions => {
                expect(actions.length).toBe(NUM_ACTION);
                actions.map((action) => expect(action.type).toBe("EPICTEST:TIMEOUT"));
                done();
            }, {mapInitialConfig: {
                "mapId": mapId
            }});
        });
    });

    describe("storeDetailsInfoDashboardEpic", () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        const dashboardId = 1;
        const dashboardAttributesEmptyDetails = {
            "AttributeList": {
                "Attribute": [
                    {
                        "name": "details",
                        "type": "STRING",
                        "value": EMPTY_RESOURCE_VALUE
                    }
                ]
            }
        };

        const dashboardAttributesWithoutDetails = {
            "AttributeList": {
                "Attribute": []
            }
        };

        const dashboardAttributesWithDetails = {
            AttributeList: {
                Attribute: [
                    {
                        name: 'details',
                        type: 'STRING',
                        value: 'rest\/geostore\/data\/1\/raw?decode=datauri'
                    },
                    {
                        name: "thumbnail",
                        type: "STRING",
                        value: 'rest\/geostore\/data\/1\/raw?decode=datauri'
                    },
                    {
                        name: 'owner',
                        type: 'STRING',
                        value: 'admin'
                    }
                ]
            }
        };
        it('test storeDetailsInfoDashboardEpic', (done) => {
            mockAxios.onGet().reply(200, dashboardAttributesWithDetails);
            testEpic(addTimeoutEpic(storeDetailsInfoDashboardEpic), 1, dashboardLoaded("RES", "DATA"), actions => {
                expect(actions.length).toBe(1);
                actions.map((action) => {

                    switch (action.type) {
                    case DETAILS_LOADED:
                        expect(action.id).toBe(dashboardId);
                        expect(action.detailsUri).toBe("rest/geostore/data/1/raw?decode=datauri");
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {dashboard: {
                resource: {
                    id: dashboardId,
                    attributes: {}
                }
            }});
        });
        it('test storeDetailsInfoDashboardEpic when api returns NODATA value', (done) => {
            // const mock = new MockAdapter(axios);
            mockAxios.onGet().reply(200, dashboardAttributesWithoutDetails);
            testEpic(addTimeoutEpic(storeDetailsInfoDashboardEpic), 1, dashboardLoaded("RES", "DATA"), actions => {
                expect(actions.length).toBe(1);
                actions.map((action) => expect(action.type).toBe(TEST_TIMEOUT));
                done();
            }, {dashboard: {
                resource: {
                    id: dashboardId,
                    attributes: {}
                }
            }});
        });
        it('test storeDetailsInfoDashboardEpic when api doesnt return details', (done) => {
            mockAxios.onGet().reply(200, dashboardAttributesEmptyDetails);
            testEpic(addTimeoutEpic(storeDetailsInfoDashboardEpic), 1, dashboardLoaded("RES", "DATA"), actions => {
                expect(actions.length).toBe(1);
                actions.map((action) => expect(action.type).toBe(TEST_TIMEOUT));
                done();
            }, {dashboard: {
                resource: {
                    id: dashboardId,
                    attributes: {}
                }
            }});
        }, {});
    });
    describe("backgroundsListInitEpic", () => {
        const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII";
        it('test layer update with thumbnail on background init', (done) => {
            testEpic(addTimeoutEpic(backgroundsListInitEpic), 2, configureMap({
                map: {
                    backgrounds: [{id: "1", thumbnail: base64}],
                    layers: [{id: "1", group: "background", name: "layer_1", visibility: true}]
                }
            }), actions => {
                expect(actions.length).toBe(2);
                actions.map((action) => {
                    switch (action.type) {
                    case "CHANGE_LAYER_PROPERTIES":
                        expect(action.newProperties.thumbURL).toBeTruthy();
                        expect(action.layer).toBe("1");
                        break;
                    case "BACKGROUND_SELECTOR:CREATE_BACKGROUNDS_LIST":
                        expect(action.backgrounds.length).toBe(1);
                        expect(action.backgrounds[0].id).toBe("1");
                        expect(action.backgrounds[0].thumbnail).toBe(base64);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            });
        });
        it('test layer update with thumbnail with layer not visible', (done) => {
            testEpic(addTimeoutEpic(backgroundsListInitEpic), 2, configureMap({
                map: {
                    backgrounds: [{id: "1", thumbnail: base64}],
                    layers: [{id: "1", group: "background", name: "layer_1", visibility: false}]
                }
            }), actions => {
                expect(actions.length).toBe(2);
                actions.map((action) => {
                    switch (action.type) {
                    case "CHANGE_LAYER_PROPERTIES":
                        expect(action.newProperties.thumbURL).toBeTruthy();
                        expect(action.layer).toBe("1");
                        break;
                    case "BACKGROUND_SELECTOR:CREATE_BACKGROUNDS_LIST":
                        expect(action.backgrounds.length).toBe(1);
                        expect(action.backgrounds[0].id).toBe("1");
                        expect(action.backgrounds[0].thumbnail).toBe(base64);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {});
        });
        it('test backgroundsListInitEpic with no background layer', (done) => {
            testEpic(addTimeoutEpic(backgroundsListInitEpic), 1, configureMap({
                map: {
                    layers: [{id: "1", name: "layer_1", visibility: false}]
                }
            }), actions => {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    switch (action.type) {
                    case "BACKGROUND_SELECTOR:CREATE_BACKGROUNDS_LIST":
                        expect(action.backgrounds.length).toBe(0);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {});
        });
    });
});

