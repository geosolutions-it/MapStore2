/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { CALL_HISTORY_METHOD } from 'connected-react-router';

import {
    MAPS_LIST_LOADING,
    MAPS_LIST_LOADED,
    MAPS_LIST_LOAD_ERROR,
    loadMaps,
    MAPS_GET_MAP_RESOURCES_BY_CATEGORY,
    getMapResourcesByCategory,
    MAP_DELETING,
    MAP_DELETED,
    deleteMap,
    mapDeleted,
    saveMapResource,
    MAP_CREATED,
    SAVING_MAP,
    MAP_UPDATING,
    MAPS_LOAD_MAP,
    LOADING,
    LOAD_CONTEXTS
} from '../../actions/maps';

import { MAP_SAVED, LOAD_MAP_INFO, MAP_CONFIG_LOADED } from '../../actions/config';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import { TOGGLE_CONTROL, SET_CONTROL_PROPERTY } from '../../actions/controls';
import { loginSuccess, logout } from '../../actions/security';

import {
    loadMapsEpic,
    getMapsResourcesByCategoryEpic,
    deleteMapAndAssociatedResourcesEpic,
    mapsSetupFilterOnLogin,
    mapSaveMapResourceEpic,
    reloadMapsEpic
} from '../maps';

import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import { EMPTY_RESOURCE_VALUE } from '../../utils/MapInfoUtils';
import ConfigUtils from '../../utils/ConfigUtils';
const params = {start: 0, limit: 12 };
const baseUrl = "base/web/client/test-resources/geostore/";

const locale = {
    messages: {
        maps: {
            feedback: {
                allResDeleted: "allResDeleted ",
                errorFetchingDetailsOfMap: "errorFetchingDetailsOfMap ",
                errorDeletingDetailsOfMap: "errorDeletingDetailsOfMap ",
                errorDeletingThumbnailOfMap: "errorDeletingThumbnailOfMap ",
                errorDeletingMap: "errorDeletingMap "
            }
        }
    }
};
const mapId = 1;
const mapId8 = 8;
let map1 = {
    id: mapId,
    name: "name"
};
let map8 = {
    id: mapId8,
    name: "name"
};

// category is required to support details map
const testMap = {
    "success": true,
    "totalCount": 13,
    "results": [
        {
            "canDelete": false,
            "canEdit": false,
            "canCopy": true,
            "creation": "2014-04-04 12:14:21.17",
            "lastUpdate": "2017-05-17 10:18:11.455",
            "description": "",
            "id": 464,
            "context": "2100",
            "category": {name: "MAP"},
            "contextName": "test-context",
            "name": "TEST MAP",
            "thumbnail": "base%2Fweb%2Fclient%2Ftest-resources%2Fimg%2Fblank.jpg",
            "owner": "mapstore"
        }
    ]
};

const testMap2 = {
    "success": true,
    "totalCount": 13,
    "results": [
        {
            "canDelete": false,
            "canEdit": false,
            "canCopy": true,
            "creation": "2014-04-04 12:14:21.17",
            "lastUpdate": "2017-05-17 10:18:11.455",
            "description": "",
            "id": 464,
            "category": {name: "MAP"},
            "context": "2134",
            "contextName": null,
            "name": "TEST MAP",
            "thumbnail": "base%2Fweb%2Fclient%2Ftest-resources%2Fimg%2Fblank.jpg",
            "owner": "mapstore"
        }
    ]
};

describe('maps Epics', () => {
    const oldGetDefaults = ConfigUtils.getDefaults;
    beforeEach(() => {
        ConfigUtils.getDefaults = () => ({
            geoStoreUrl: baseUrl
        });
    });

    afterEach(() => {
        ConfigUtils.getDefaults = oldGetDefaults;
    });
    it('test deleteMapAndAssociatedResourcesEpic, with map, details, thumbnail errors', (done) => {
        map1.thumbnail = "wronguri/data/5/";
        map1.details = "wronguri/data/6/";
        testEpic(deleteMapAndAssociatedResourcesEpic, 5, deleteMap(mapId, {}), actions => {
            expect(actions.length).toBe(5);
            actions.map((action, i) => {
                switch (action.type) {
                case SHOW_NOTIFICATION:
                    if (i === 1) {
                        expect(action.message).toBe("maps.feedback.errorDeletingDetailsOfMap");
                    }
                    if (i === 2) {
                        expect(action.message).toBe("maps.feedback.errorDeletingThumbnailOfMap");
                    }
                    if (i === 3) {
                        expect(action.message).toBe("maps.feedback.errorDeletingMap");
                    }
                    break;
                case MAP_DELETING:
                    expect(action.resourceId).toBe(mapId);
                    break;
                case MAP_DELETED:
                    expect(action.resourceId).toBe(mapId);
                    expect(action.result).toBe("failure");
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            locale,
            maps: {
                results: [map1],
                totalCount: 1,
                start: 1
            },
            currentMap: {
                id: mapId,
                details: "wrong/data/uri/4"
            }
        });
    });
    it('test deleteMapAndAssociatedResourcesEpic, only map deleted, details and thumbnail not provided', (done) => {
        testEpic(addTimeoutEpic(deleteMapAndAssociatedResourcesEpic, 50), 3, deleteMap(mapId8, {}), actions => {
            map8.thumbnail = EMPTY_RESOURCE_VALUE;
            map8.details = EMPTY_RESOURCE_VALUE;
            expect(actions.length).toBe(3);
            actions.map((action) => {
                switch (action.type) {
                case SHOW_NOTIFICATION:
                    expect(action.message).toBe("maps.feedback.allResDeleted");
                    break;
                case MAP_DELETING:
                    expect(action.resourceId).toBe(mapId8);
                    break;
                case MAP_DELETED:
                    expect(action.resourceId).toBe(mapId8);
                    expect(action.result).toBe("success");
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            locale,
            maps: {
                results: [map8],
                totalCount: 2,
                start: 1
            },
            currentMap: {
                id: mapId8
            }
        });
    });
    it('test deleteMapAndAssociatedResourcesEpic, map deleted, but details, thumbnail errors', (done) => {
        map8.thumbnail = "wronguri/data/5/";
        map8.details = "wronguri/data/6/";
        testEpic(addTimeoutEpic(deleteMapAndAssociatedResourcesEpic, 50), 5, deleteMap(mapId8, {}), actions => {
            expect(actions.length).toBe(5);
            actions.filter(a => !!a.type).map((action, i) => {
                switch (action.type) {
                case SHOW_NOTIFICATION:
                    if (i === 1) {
                        expect(action.message).toBe("maps.feedback.errorDeletingDetailsOfMap");
                    }
                    if (i === 2) {
                        expect(action.message).toBe("maps.feedback.errorDeletingThumbnailOfMap");
                    }
                    break;
                case MAP_DELETING:
                    expect(action.resourceId).toBe(mapId8);
                    break;
                case MAP_DELETED:
                    expect(action.resourceId).toBe(mapId8);
                    expect(action.result).toBe("success");
                    break;
                case TEST_TIMEOUT:
                    expect(action.type).toBe(TEST_TIMEOUT);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            locale,
            maps: {
                results: [map8]
            },
            currentMap: {
                id: mapId8,
                details: "wrong/uri/data/4"
            }
        });
    });
    it('test deleteMapAndAssociatedResourcesEpic, map, details, thumbnail deleted', (done) => {
        map8.thumbnail = "wronguri/9/";
        map8.details = "wronguri/10/";
        testEpic(addTimeoutEpic(deleteMapAndAssociatedResourcesEpic), 3, deleteMap(mapId8, {}), actions => {
            expect(actions.length).toBe(3);
            actions.filter(a => !!a.type).map((action) => {
                switch (action.type) {
                case SHOW_NOTIFICATION:
                    expect(action.message).toBe("maps.feedback.allResDeleted");
                    break;
                case MAP_DELETING:
                    expect(action.resourceId).toBe(mapId8);
                    break;
                case MAP_DELETED:
                    expect(action.resourceId).toBe(mapId8);
                    expect(action.result).toBe("success");
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            locale,
            maps: {
                results: [map8]
            },
            currentMap: {
                id: mapId8,
                details: "wrong/uri/4"
            }
        });
    });
    it('it test loadMapsEpic when search text is a special character', (done) => {
        const searchText = 'tes/t\?:;@=&';
        testEpic(loadMapsEpic, 2, loadMaps(baseUrl, searchText, params), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case MAPS_LIST_LOADING:
                    expect(action.searchText).toBe('test');
                    expect(action.params).toEqual(params);
                    break;
                case MAPS_GET_MAP_RESOURCES_BY_CATEGORY:
                    expect(action.map).toBe('MAP');
                    expect(action.searchText).toBe('test');
                    expect(action.opts).toEqual({baseUrl, params});
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
        });
        done();
    });
    it('mapsSetupFilterOnLogin on LOGIN_SUCCESS', (done) => {
        testEpic(mapsSetupFilterOnLogin, 2, loginSuccess({}, '', ''), actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
            expect(actions[0].control).toBe('advancedsearchpanel');
            expect(actions[0].property).toBe('enabled');
            expect(actions[0].value).toBe(false);
            expect(actions[1].type).toBe(LOAD_CONTEXTS);
        }, {}, done);
    });
    it('mapsSetupFilterOnLogin on LOGOUT', (done) => {
        testEpic(mapsSetupFilterOnLogin, 2, logout(), actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
            expect(actions[0].control).toBe('advancedsearchpanel');
            expect(actions[0].property).toBe('enabled');
            expect(actions[0].value).toBe(false);
            expect(actions[1].type).toBe(LOAD_CONTEXTS);
        }, {}, done);
    });
});
describe('Get Map Resource By Category Epic', () => {
    it('test getMapsResourcesByCategoryEpic', () =>
        axios.get('base/web/client/test-resources/geostore/extjs/search/category/MAP/test.json').then(({data: testJson}) => new Promise(resolve => {
            const mock = new MockAdapter(axios);
            mock.onGet('/extjs/resource/2100').reply(200, {
                ShortResource: {
                    canDelete: true,
                    canEdit: true,
                    creation: "2020-01-09T11:29:17.935+01:00",
                    description: "",
                    id: 2100,
                    lastUpdate: "2020-01-09T15:26:57.611+01:00",
                    name: "test-context"
                }
            });
            mock.onGet().reply(200, testJson);
            testEpic(addTimeoutEpic(getMapsResourcesByCategoryEpic), 3, getMapResourcesByCategory('MAP', 'test', {
                baseUrl,
                params: { start: 0, limit: 12 }
            }), actions => {
                expect(actions.length).toBe(3);
                expect(actions[0].type).toBe(LOADING);
                expect(actions[0].value).toBe(true);
                expect(actions[0].name).toBe('loadingMaps');
                expect(actions[1].type).toBe(MAPS_LIST_LOADED);
                expect(actions[1].maps).toEqual(testMap);
                expect(actions[1].params).toEqual(params);
                expect(actions[1].searchText).toBe('test');
                expect(actions[2].type).toBe(LOADING);
                expect(actions[2].value).toBe(false);
                expect(actions[2].name).toBe('loadingMaps');
                mock.restore();
                resolve();
            });
        }))
    );
    it('test getMapsResourcesByCategoryEpic with a map that belongs to a deleted context', () =>
        axios.get('base/web/client/test-resources/geostore/extjs/search/category/MAP/test2.json').then(({data: testJson}) => new Promise(resolve => {
            const mock = new MockAdapter(axios);
            mock.onGet('/extjs/resource/2134').reply(404);
            mock.onGet().reply(200, testJson);
            testEpic(addTimeoutEpic(getMapsResourcesByCategoryEpic), 3, getMapResourcesByCategory('MAP', 'test', {
                baseUrl,
                params: { start: 0, limit: 12 }
            }), actions => {
                expect(actions.length).toBe(3);
                expect(actions[0].type).toBe(LOADING);
                expect(actions[0].value).toBe(true);
                expect(actions[0].name).toBe('loadingMaps');
                expect(actions[1].type).toBe(MAPS_LIST_LOADED);
                expect(actions[1].maps).toEqual(testMap2);
                expect(actions[1].params).toEqual(params);
                expect(actions[1].searchText).toBe('test');
                expect(actions[2].type).toBe(LOADING);
                expect(actions[2].value).toBe(false);
                expect(actions[2].name).toBe('loadingMaps');
                mock.restore();
                resolve();
            });
        }))
    );
    it('test getMapsResourcesByCategoryEpic with empty results string', (done) => {
        const mock = new MockAdapter(axios);
        mock.onGet().reply(200, {success: true, totalCount: 0, results: ""});
        testEpic(addTimeoutEpic(getMapsResourcesByCategoryEpic), 3, getMapResourcesByCategory('MAP', 'test', {
            baseUrl,
            params: { start: 0, limit: 12 }
        }), actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].value).toBe(true);
            expect(actions[0].name).toBe('loadingMaps');
            expect(actions[1].type).toBe(MAPS_LIST_LOADED);
            expect(actions[1].maps).toEqual({success: true, totalCount: 0, results: []});
            expect(actions[1].params).toEqual(params);
            expect(actions[1].searchText).toBe('test');
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].value).toBe(false);
            expect(actions[2].name).toBe('loadingMaps');
            mock.restore();
            done();
        });
    });
    it('test getMapsResourcesByCategoryEpic with an error', (done) => {
        const mock = new MockAdapter(axios);
        mock.onPost().reply(404);
        testEpic(addTimeoutEpic(getMapsResourcesByCategoryEpic), 3, getMapResourcesByCategory('MAP', 'test', {
            baseUrl,
            params: { start: 0, limit: 12 }
        }), actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].value).toBe(true);
            expect(actions[0].name).toBe('loadingMaps');
            expect(actions[1].type).toBe(MAPS_LIST_LOAD_ERROR);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].value).toBe(false);
            expect(actions[2].name).toBe('loadingMaps');
            mock.restore();
            done();
        });
    });
});
import Persistence from '../../api/persistence';
import Rx from 'rxjs';
const api = {
    createResource: () => Rx.Observable.of(10),
    updateResource: () => Rx.Observable.of(10)
};

describe('Create and update flow using persistence api', () => {
    Persistence.addApi("testMaps", api);
    beforeEach(() => {
        Persistence.setApi("testMaps");
    });
    afterEach(() => {
        Persistence.setApi("geostore");
    });
    it('test create flow ', done => {
        testEpic(addTimeoutEpic(mapSaveMapResourceEpic), 6, saveMapResource({}), actions => {
            expect(actions.length).toBe(6);
            actions.map((action) => {
                switch (action.type) {
                case SAVING_MAP:
                case TOGGLE_CONTROL:
                case MAP_SAVED:
                case SHOW_NOTIFICATION:
                case MAP_CREATED:
                case CALL_HISTORY_METHOD:
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        });
    });
    it('test update flow ', done => {
        testEpic(addTimeoutEpic(mapSaveMapResourceEpic), 6, saveMapResource( {id: 10}), actions => {
            expect(actions.length).toBe(6);
            actions.map((action) => {
                switch (action.type) {
                case MAP_UPDATING:
                case TOGGLE_CONTROL:
                case MAP_SAVED:
                case SHOW_NOTIFICATION:
                case LOAD_MAP_INFO:
                case MAP_CONFIG_LOADED:
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        });
    });
    it('test create with a null attribute', done => {
        testEpic(addTimeoutEpic(mapSaveMapResourceEpic), 6, saveMapResource({id: 10, attributes: {context: null}}), actions => {
            expect(actions.length).toBe(6);
            actions.map((action) => {
                switch (action.type) {
                case MAP_UPDATING:
                case TOGGLE_CONTROL:
                case MAP_SAVED:
                case SHOW_NOTIFICATION:
                case LOAD_MAP_INFO:
                case MAP_CONFIG_LOADED:
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        });
    });
    it('test thumbnail attribute is ignored', done => {
        const attributeTestApi = {
            ...api,
            updateResourceAttribute: ({name}) => name === 'thumbnail' ? done(new Error('thumbnail update request was issued!')) : Rx.Observable.of(10)
        };
        Persistence.addApi('attributeTest', attributeTestApi);
        Persistence.setApi('attributeTest');

        testEpic(addTimeoutEpic(mapSaveMapResourceEpic), 6, saveMapResource({id: 10, metadata: {name: 'resource'}, attributes: {thumbnail: 'thumb', someAttribute: 'value'}}), actions => {
            try {
                expect(actions.length).toBe(6);
                actions.map((action) => {
                    switch (action.type) {
                    case MAP_UPDATING:
                    case TOGGLE_CONTROL:
                    case MAP_SAVED:
                    case SHOW_NOTIFICATION:
                    case LOAD_MAP_INFO:
                    case MAP_CONFIG_LOADED:
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            } catch (e) {
                done(e);
            }
        }, {});
    });

    it('test reloadMaps', function(done) {
        const callback = actions => {
            expect(actions.length).toEqual(1);
            expect(actions[0].type).toEqual(MAPS_LOAD_MAP);
            done();
        };
        testEpic(reloadMapsEpic, 1, mapDeleted(9, 'success'), callback);
    });
});
