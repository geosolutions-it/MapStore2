/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const configureMockStore = require('redux-mock-store').default;
const {createEpicMiddleware, combineEpics } = require('redux-observable');
const {
    saveDetails, SET_DETAILS_CHANGED,
    CLOSE_DETAILS_PANEL, closeDetailsPanel,
    openDetailsPanel, UPDATE_DETAILS, DETAILS_LOADED,
    MAP_DELETING, MAP_DELETED, deleteMap, TOGGLE_DETAILS_SHEET
} = require('../../actions/maps');
const { mapInfoLoaded } = require('../../actions/config');
const {SHOW_NOTIFICATION} = require('../../actions/notifications');
const {TOGGLE_CONTROL} = require('../../actions/controls');
const {RESET_CURRENT_MAP, editMap} = require('../../actions/currentMap');
const {CLOSE_FEATURE_GRID} = require('../../actions/featuregrid');

const {
    setDetailsChangedEpic,
    closeDetailsPanelEpic, fetchDataForDetailsPanel,
    fetchDetailsFromResourceEpic, deleteMapAndAssociatedResourcesEpic, storeDetailsInfoEpic} = require('../maps');
const rootEpic = combineEpics(setDetailsChangedEpic, closeDetailsPanelEpic);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);
const {testEpic, addTimeoutEpic, TEST_TIMEOUT} = require('./epicTestUtils');

const ConfigUtils = require('../../utils/ConfigUtils');
const baseUrl = "base/web/client/test-resources/geostore/";
ConfigUtils.getDefaults = () => ({
    geoStoreUrl: baseUrl
});
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
const mapId2 = 2;
const mapId8 = 8;
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
let map8 = {
    id: mapId8,
    name: "name"
};
const mapsState = {
    maps: {
        results: [map1]
    },
    mapInitialConfig: {
        mapId
    },
    map: {
        present: {
            info: {
                details: encodeURIComponent(detailsUri)
            }
        }
    }
};
describe('maps Epics', () => {
    let store;
    beforeEach(() => {
        store = mockStore();
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
    });

    it('test setDetailsChangedEpic', (done) => {

        store.dispatch(saveDetails("<p>some details</p>"));

        setTimeout( () => {
            try {
                const actions = store.getActions();
                expect(actions.length).toBe(3);
                expect(actions[1].type).toBe(TOGGLE_DETAILS_SHEET);
                expect(actions[2].type).toBe(SET_DETAILS_CHANGED);
            } catch (e) {
                return done(e);
            }
            done();
        }, 100);

    });
    it('test setDetailsChangedEpic with details resource present', (done) => {
        testEpic(setDetailsChangedEpic, 1, saveDetails(detailsText), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case SET_DETAILS_CHANGED:
                        expect(action.detailsChanged).toBe(false);
                        break;
                    case TOGGLE_DETAILS_SHEET:
                        expect(action.detailsSheetReadOnly).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            locale,
            currentMap: {
                id: mapId,
                details: "wrong/uri/4",
                detailsText,
                originalDetails: detailsText
            }
        });
    });

    it('test closeDetailsPanel', (done) => {

        store.dispatch(closeDetailsPanel());

        setTimeout( () => {
            try {
                const actions = store.getActions();
                expect(actions.length).toBe(3);
                expect(actions[0].type).toBe(CLOSE_DETAILS_PANEL);
                expect(actions[1].type).toBe(TOGGLE_CONTROL);
                expect(actions[2].type).toBe(RESET_CURRENT_MAP);
            } catch (e) {
                return done(e);
            }
            done();
        }, 100);

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
                        expect(action.originalDetails.indexOf(detailsText)).toNotBe(-1);
                        expect(action.doBackup).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, mapsState);
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
    it('test fetchDetailsFromResourceEpic, map without saved Details', (done) => {
        delete map1.details;
        testEpic(addTimeoutEpic(fetchDetailsFromResourceEpic), 1, editMap({}, true), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case UPDATE_DETAILS:
                        expect(action.detailsText).toBe("");
                        expect(action.originalDetails).toBe("");
                        expect(action.doBackup).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            currentMap: {
                id: mapId
            }
        });
    });

    it('test fetchDetailsFromResourceEpic, map with saved Details', (done) => {
        testEpic(addTimeoutEpic(fetchDetailsFromResourceEpic), 1, editMap({}, true), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case UPDATE_DETAILS:
                        expect(action.detailsText.indexOf(detailsText)).toNotBe(-1);
                        expect(action.originalDetails.indexOf(detailsText)).toNotBe(-1);
                        expect(action.doBackup).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            currentMap: {
                id: mapId,
                details: encodeURIComponent(detailsUri)
            }
        });
    });

    it('test fetchDetailsFromResourceEpic, withError', (done) => {
        testEpic(addTimeoutEpic(fetchDetailsFromResourceEpic), 1, editMap({}, true), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case SHOW_NOTIFICATION:
                        expect(action.message).toBe("maps.feedback.errorFetchingDetailsOfMap");
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            locale,
            currentMap: {
                id: mapId,
                details: "wrong/uri/sfdsdfs"
            },
            maps: {
                results: [map1]
            }
        });
    });
    it('test deleteMapAndAssociatedResourcesEpic, with map, details, thumbnail errors', (done) => {
        map1.thumbnail = "wronguri/data/5/";
        map1.details = "wronguri/data/6/";
        testEpic(addTimeoutEpic(deleteMapAndAssociatedResourcesEpic), 5, deleteMap(mapId, {}), actions => {
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
        testEpic(addTimeoutEpic(deleteMapAndAssociatedResourcesEpic), 3, deleteMap(mapId8, {}), actions => {
            map8.thumbnail = "NODATA";
            map8.details = "NODATA";
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
        testEpic(addTimeoutEpic(deleteMapAndAssociatedResourcesEpic), 6, deleteMap(mapId8, {}), actions => {
            expect(actions.length).toBe(6);
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
        testEpic(addTimeoutEpic(deleteMapAndAssociatedResourcesEpic), 4, deleteMap(mapId8, {}), actions => {
            expect(actions.length).toBe(4);
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
                details: "wrong/uri/4"
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


});
