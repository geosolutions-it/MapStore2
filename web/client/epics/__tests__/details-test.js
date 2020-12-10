/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware, combineEpics } from 'redux-observable';

import {
    closeDetailsPanelEpic,
    storeDetailsInfoEpic,
    fetchDataForDetailsPanel
} from '../../epics/details';

import {
    CLOSE_DETAILS_PANEL,
    closeDetailsPanel,
    openDetailsPanel,
    UPDATE_DETAILS,
    DETAILS_LOADED
} from '../../actions/details';
import { CLOSE_FEATURE_GRID } from '../../actions/featuregrid';
import { mapInfoLoaded } from '../../actions/config';

import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import ConfigUtils from '../../utils/ConfigUtils';
import { EMPTY_RESOURCE_VALUE } from '../../utils/MapInfoUtils';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import { TOGGLE_CONTROL } from '../../actions/controls';

const baseUrl = "base/web/client/test-resources/geostore/";
const mapId = 1;
const mapId2 = 2;
const detailsText = "<p>details of this map</p>";
const detailsUri = "data/2";
let map1 = {
    id: mapId,
    name: "name"
};
let map2 = {
    id: mapId2,
    name: "name2"
};
const testState = {
    mapInitialConfig: {
        mapId
    },
    map: {
        present: {
            info: {
                details: encodeURIComponent(detailsUri)
            }
        }
    },
    details: {}
};
const rootEpic = combineEpics(closeDetailsPanelEpic);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

const mapAttributesEmptyDetails = {
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

const mapAttributesWithoutDetails = {
    "AttributeList": {
        "Attribute": []
    }
};

describe('details epics tests', () => {
    const oldGetDefaults = ConfigUtils.getDefaults;
    let store;

    beforeEach(() => {
        store = mockStore();
        ConfigUtils.getDefaults = () => ({
            geoStoreUrl: baseUrl
        });
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
        ConfigUtils.getDefaults = oldGetDefaults;
    });

    it('test closeDetailsPanel', (done) => {

        store.dispatch(closeDetailsPanel());

        setTimeout( () => {
            try {
                const actions = store.getActions();
                expect(actions.length).toBe(2);
                expect(actions[0].type).toBe(CLOSE_DETAILS_PANEL);
                expect(actions[1].type).toBe(TOGGLE_CONTROL);
            } catch (e) {
                done(e);
            }
            done();
        }, 50);

    });
    it('test fetchDataForDetailsPanel', (done) => {
        map1.details = encodeURIComponent(detailsUri);
        testEpic(addTimeoutEpic(fetchDataForDetailsPanel), 3, openDetailsPanel(), actions => {
            expect(actions.length).toBe(3);
            actions.map((action) => {
                switch (action.type) {
                case TOGGLE_CONTROL:
                    expect(action.control).toBe("details");
                    expect(action.property).toBe("enabled");
                    break;
                case CLOSE_FEATURE_GRID:
                    expect(action.type).toBe(CLOSE_FEATURE_GRID);
                    break;
                case UPDATE_DETAILS:
                    expect(action.detailsText.indexOf(detailsText)).toNotBe(-1);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, testState);
    });
    it('test fetchDataForDetailsPanel with Error', (done) => {
        testEpic(addTimeoutEpic(fetchDataForDetailsPanel), 2, openDetailsPanel(), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case TOGGLE_CONTROL:
                    expect(action.control).toBe("details");
                    expect(action.property).toBe("enabled");
                    break;
                case SHOW_NOTIFICATION:
                    expect(action.message).toBe("maps.feedback.errorFetchingDetailsOfMap");
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            locale: {
                messages: {
                    maps: {
                        feedback: {
                            errorFetchingDetailsOfMap: "maps.feedback.errorFetchingDetailsOfMap"
                        }
                    }
                }
            },
            mapInitialConfig: {
                mapId
            },
            map: {
                present: {
                    info: {}
                }
            }
        });
    });
    it('test storeDetailsInfoEpic', (done) => {
        testEpic(addTimeoutEpic(storeDetailsInfoEpic), 1, mapInfoLoaded(map2, mapId2), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case DETAILS_LOADED:
                    expect(action.mapId).toBe(mapId2);
                    expect(action.detailsUri).toBe("rest%2Fgeostore%2Fdata%2F3983%2Fraw%3Fdecode%3Ddatauri");
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {mapInitialConfig: {
            "mapId": mapId2
        }});
    });
    it('test storeDetailsInfoEpic when api returns NODATA value', (done) => {
        const mock = new MockAdapter(axios);
        mock.onGet().reply(200, mapAttributesEmptyDetails);
        testEpic(addTimeoutEpic(storeDetailsInfoEpic), 1, mapInfoLoaded(map2, mapId2), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => expect(action.type).toBe(TEST_TIMEOUT));
            mock.restore();
            done();
        }, {mapInitialConfig: {
            "mapId": mapId2
        }});
    });
    it('test storeDetailsInfoEpic when api doesnt return details', (done) => {
        const mock = new MockAdapter(axios);
        mock.onGet().reply(200, mapAttributesWithoutDetails);
        testEpic(addTimeoutEpic(storeDetailsInfoEpic), 1, mapInfoLoaded(map2, mapId2), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => expect(action.type).toBe(TEST_TIMEOUT));
            mock.restore();
            done();
        }, {mapInitialConfig: {
            "mapId": mapId2
        }});
    });
});
