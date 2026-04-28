/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';

import axios from '../../libs/ajax';
import {
    searchProjectionsEpic,
    loadProjectionDefEpic,
    registerDynamicProjectionDefEpic,
    unregisterDynamicProjectionDefEpic,
    restoreDynamicProjectionDefsEpic
} from '../projections';
import {
    SEARCH_PROJECTIONS_SUCCESS,
    SEARCH_PROJECTIONS_ERROR,
    ADD_PROJECTION_DEF,
    REMOVE_PROJECTION_DEF,
    LOAD_PROJECTION_DEF_ERROR,
    searchProjections,
    loadProjectionDef,
    addProjectionDef,
    removeProjectionDef
} from '../../actions/projections';
import { configureMap } from '../../actions/config';
import ProjectionRegistry from '../../utils/ProjectionRegistry';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';

const PROJ4_DEF = '+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl +towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs';

describe('projections epics', () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
        ProjectionRegistry.unRegisterAll();
    });

    describe('searchProjectionsEpic', () => {
        it('emits SEARCH_PROJECTIONS_SUCCESS with results from the endpoint', (done) => {
            const endpoint = 'http://x';
            mockAxios.onGet(`${endpoint}/rest/crs`).reply(200, {
                crs: [{ id: 'EPSG:3003' }, { id: 'EPSG:25832' }],
                page: { total: 2 }
            });
            testEpic(
                searchProjectionsEpic,
                1,
                searchProjections(endpoint, 'utm', 1),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(SEARCH_PROJECTIONS_SUCCESS);
                    expect(actions[0].results).toEqual([{ id: 'EPSG:3003' }, { id: 'EPSG:25832' }]);
                    expect(actions[0].total).toBe(2);
                    expect(actions[0].page).toBe(1);
                },
                {},
                done
            );
        });

        it('emits SEARCH_PROJECTIONS_ERROR when the endpoint fails', (done) => {
            const endpoint = 'http://x';
            mockAxios.onGet(`${endpoint}/rest/crs`).networkError();
            testEpic(
                searchProjectionsEpic,
                1,
                searchProjections(endpoint, 'utm', 1),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(SEARCH_PROJECTIONS_ERROR);
                    expect(actions[0].error).toBeTruthy();
                },
                {},
                done
            );
        });

        it('emits no actions when endpointUrl is empty', (done) => {
            // Page > 1 skips the 300ms debounce so the timeout fires fast.
            testEpic(
                addTimeoutEpic(searchProjectionsEpic, 200),
                1,
                searchProjections('', 'utm', 2),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                },
                {},
                done
            );
        });
    });

    describe('loadProjectionDefEpic', () => {
        it('emits ADD_PROJECTION_DEF on success with extents from the response', (done) => {
            const endpoint = 'http://x';
            mockAxios.onGet(`${endpoint}/rest/crs/EPSG:3003.json`).reply(200, {
                id: 'EPSG:3003',
                definition: PROJ4_DEF,
                bbox: { minX: 1241482, minY: 973563, maxX: 1830079, maxY: 5215189 },
                bboxWGS84: { minX: 6.65, minY: 8.8, maxX: 12, maxY: 47.05 }
            });
            testEpic(
                loadProjectionDefEpic,
                1,
                loadProjectionDef(endpoint, 'EPSG:3003'),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(ADD_PROJECTION_DEF);
                    expect(actions[0].def.code).toBe('EPSG:3003');
                    expect(actions[0].def.def).toContain('+proj=tmerc');
                    expect(actions[0].def.extent).toEqual([1241482, 973563, 1830079, 5215189]);
                    expect(actions[0].def.worldExtent).toEqual([6.65, 8.8, 12, 47.05]);
                },
                {},
                done
            );
        });

        it('emits LOAD_PROJECTION_DEF_ERROR when the API request fails', (done) => {
            const endpoint = 'http://x';
            mockAxios.onGet(`${endpoint}/rest/crs/EPSG:3003.json`).reply(500);
            testEpic(
                loadProjectionDefEpic,
                1,
                loadProjectionDef(endpoint, 'EPSG:3003'),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(LOAD_PROJECTION_DEF_ERROR);
                    expect(actions[0].id).toBe('EPSG:3003');
                    expect(actions[0].error).toBeTruthy();
                },
                {},
                done
            );
        });

        it('rejects antimeridian-crossing bbox up-front via LOAD_PROJECTION_DEF_ERROR', (done) => {
            // GeoServer occasionally returns minX > maxX for CRS that wrap; the
            // API guard prevents these from polluting the registry.
            const endpoint = 'http://x';
            mockAxios.onGet(`${endpoint}/rest/crs/CRS:83.json`).reply(200, {
                id: 'CRS:83',
                definition: '+proj=longlat +datum=WGS84 +no_defs',
                bbox: { minX: 167.65, minY: -50, maxX: -40.73, maxY: 50 },
                bboxWGS84: { minX: 167.65, minY: -50, maxX: -40.73, maxY: 50 }
            });
            testEpic(
                loadProjectionDefEpic,
                1,
                loadProjectionDef(endpoint, 'CRS:83'),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(LOAD_PROJECTION_DEF_ERROR);
                    expect(actions[0].error).toContain('Invalid coordinate bounds');
                },
                {},
                done
            );
        });
    });

    describe('registerDynamicProjectionDefEpic', () => {
        it('registers the def in ProjectionRegistry as a side-effect of ADD_PROJECTION_DEF', (done) => {
            const def = { code: 'EPSG:3003', def: PROJ4_DEF };
            expect(ProjectionRegistry.isRegistered('EPSG:3003')).toBe(false);
            // The epic itself emits no actions; addTimeoutEpic gives us a stop signal.
            testEpic(
                addTimeoutEpic(registerDynamicProjectionDefEpic, 100),
                1,
                addProjectionDef(def),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    expect(ProjectionRegistry.isRegistered('EPSG:3003')).toBe(true);
                },
                {},
                done
            );
        });

        it('does not double-register when the code is already in the registry', (done) => {
            const def = { code: 'EPSG:3003', def: PROJ4_DEF };
            ProjectionRegistry.register(def);
            expect(ProjectionRegistry.isRegistered('EPSG:3003')).toBe(true);
            testEpic(
                addTimeoutEpic(registerDynamicProjectionDefEpic, 100),
                1,
                addProjectionDef(def),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    // Still registered (the no-op preserves the existing entry)
                    expect(ProjectionRegistry.isRegistered('EPSG:3003')).toBe(true);
                },
                {},
                done
            );
        });
    });

    describe('unregisterDynamicProjectionDefEpic', () => {
        it('drops the code from ProjectionRegistry on REMOVE_PROJECTION_DEF', (done) => {
            ProjectionRegistry.register({ code: 'EPSG:3003', def: PROJ4_DEF });
            expect(ProjectionRegistry.isRegistered('EPSG:3003')).toBe(true);
            testEpic(
                addTimeoutEpic(unregisterDynamicProjectionDefEpic, 100),
                1,
                removeProjectionDef('EPSG:3003'),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    expect(ProjectionRegistry.isRegistered('EPSG:3003')).toBe(false);
                },
                {},
                done
            );
        });
    });

    describe('restoreDynamicProjectionDefsEpic', () => {
        it('on first load (no previous defs) emits one ADD_PROJECTION_DEF per persisted def', (done) => {
            const action = configureMap({
                map: {
                    projections: {
                        defs: [
                            { code: 'EPSG:3003', def: '+proj=tmerc' },
                            { code: 'EPSG:25832', def: '+proj=utm +zone=32' }
                        ]
                    }
                }
            });
            testEpic(
                restoreDynamicProjectionDefsEpic,
                2,
                action,
                (actions) => {
                    expect(actions.length).toBe(2);
                    expect(actions.map(a => a.type)).toEqual([ADD_PROJECTION_DEF, ADD_PROJECTION_DEF]);
                    expect(actions.map(a => a.def.code)).toEqual(['EPSG:3003', 'EPSG:25832']);
                },
                {},
                done
            );
        });

        it('drops the previous map\'s defs before adding the new map\'s defs (no leak across maps)', (done) => {
            const previousState = {
                projections: {
                    dynamicDefs: [
                        { code: 'EPSG:3003', def: '+proj=tmerc' },
                        { code: 'EPSG:25832', def: '+proj=utm +zone=32' }
                    ]
                }
            };
            const action = configureMap({
                map: {
                    projections: {
                        defs: [{ code: 'EPSG:4269', def: '+proj=longlat' }]
                    }
                }
            });
            testEpic(
                restoreDynamicProjectionDefsEpic,
                3,
                action,
                (actions) => {
                    // Two REMOVE actions (previous map) followed by one ADD (new map)
                    expect(actions.map(a => a.type)).toEqual([
                        REMOVE_PROJECTION_DEF,
                        REMOVE_PROJECTION_DEF,
                        ADD_PROJECTION_DEF
                    ]);
                    expect(actions[0].code).toBe('EPSG:3003');
                    expect(actions[1].code).toBe('EPSG:25832');
                    expect(actions[2].def.code).toBe('EPSG:4269');
                },
                previousState,
                done
            );
        });

        it('emits only REMOVE actions when the new map carries no dynamic defs', (done) => {
            const previousState = {
                projections: {
                    dynamicDefs: [{ code: 'EPSG:3003', def: '+proj=tmerc' }]
                }
            };
            testEpic(
                restoreDynamicProjectionDefsEpic,
                1,
                configureMap({}),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(REMOVE_PROJECTION_DEF);
                    expect(actions[0].code).toBe('EPSG:3003');
                },
                previousState,
                done
            );
        });

        it('emits no actions when neither the previous nor the new map has dynamic defs', (done) => {
            testEpic(
                addTimeoutEpic(restoreDynamicProjectionDefsEpic, 200),
                1,
                configureMap({}),
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                },
                {},
                done
            );
        });
    });
});
