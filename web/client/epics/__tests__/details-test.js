/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware, combineEpics } from 'redux-observable';

import {
    closeDetailsPanelEpic,
    fetchDataForDetailsPanel
} from '../details';

import {
    CLOSE_DETAILS_PANEL,
    closeDetailsPanel,
    openDetailsPanel,
    UPDATE_DETAILS
} from '../../actions/details';

import { testEpic, addTimeoutEpic } from './epicTestUtils';
import ConfigUtils from '../../utils/ConfigUtils';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import { TOGGLE_CONTROL, SET_CONTROL_PROPERTY } from '../../actions/controls';

const baseUrl = "base/web/client/test-resources/geostore/";
const mapId = 1;
const detailsText = "<p>details of this map</p>";
const detailsUri = "data/2";
let map1 = {
    id: mapId,
    name: "name"
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
                expect(actions[1].type).toBe(SET_CONTROL_PROPERTY);
            } catch (e) {
                done(e);
            }
            done();
        }, 50);

    });
    it('test fetchDataForDetailsPanel', (done) => {
        map1.details = encodeURIComponent(detailsUri);
        testEpic(addTimeoutEpic(fetchDataForDetailsPanel), 2, openDetailsPanel(), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case TOGGLE_CONTROL:
                    expect(action.control).toBe("details");
                    expect(action.property).toBe("enabled");
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
});
