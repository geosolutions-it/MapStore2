/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import csw from '../../api/CSW';
import wmts from '../../api/WMTS';
const API = {
    csw,
    wmts
};
import catalog from '../catalog';
const {
    addLayersMapViewerUrlEpic,
    getMetadataRecordById,
    autoSearchEpic,
    openCatalogEpic,
    layerSearchEpic
} = catalog(API);
import {SHOW_NOTIFICATION} from '../../actions/notifications';
import {CLOSE_FEATURE_GRID} from '../../actions/featuregrid';
import {setControlProperty} from '../../actions/controls';
import {ADD_LAYER} from '../../actions/layers';
import {PURGE_MAPINFO_RESULTS, HIDE_MAPINFO_MARKER} from '../../actions/mapInfo';
import {testEpic, addTimeoutEpic, TEST_TIMEOUT} from './epicTestUtils';
import {
    addLayersMapViewerUrl,
    getMetadataRecordById as initAction,
    changeText,
    layerSearch, LAYER_SEARCH,
    RECORD_LIST_LOADED,
    RECORD_LIST_LOAD_ERROR,
    SET_LOADING
} from '../../actions/catalog';

describe('catalog Epics', () => {
    it('getMetadataRecordById', (done) => {
        testEpic(getMetadataRecordById, 2, initAction(), (actions) => {
            actions.filter( ({type}) => type === SHOW_NOTIFICATION).map(({message}) => {
                expect(Array.isArray(message)).toBe(false);
                expect(typeof message).toBe("string");
                done();
            });
        }, {
            layers: {
                selected: ["TEST"],
                flat: [{
                    id: "TEST",
                    catalogURL: "base/web/client/test-resources/csw/getRecordsResponseException.xml"
                }]
            }
        });
    });

    it('autoSearchEpic', (done) => {
        const NUM_ACTIONS = 1;
        testEpic(autoSearchEpic, NUM_ACTIONS, changeText(""), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            expect(actions[0].type).toBe(LAYER_SEARCH);
            done();
        }, {
            catalog: {
                delayAutoSearch: 50,
                selectedService: "cswCatalog",
                services: {
                    "cswCatalog": {
                        type: "csw",
                        url: "url"
                    }
                },
                pageSize: 2
            },
            layers: {
                selected: ["TEST"],
                flat: [{
                    id: "TEST",
                    catalogURL: "base/web/client/test-resources/csw/getRecordsResponseException.xml"
                }]
            }
        });
    });
    it('openCatalogEpic', (done) => {
        const NUM_ACTIONS = 3;
        testEpic(openCatalogEpic, NUM_ACTIONS, setControlProperty("metadataexplorer", "enabled", true), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            expect(actions[0].type).toBe(CLOSE_FEATURE_GRID);
            expect(actions[1].type).toBe(PURGE_MAPINFO_RESULTS);
            expect(actions[2].type).toBe(HIDE_MAPINFO_MARKER);
            done();
        }, { });
    });

    it('layerSearchEpic with two layers', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(layerSearchEpic), NUM_ACTIONS, layerSearch({
            format: "csw",
            url: "base/web/client/test-resources/csw/getRecordsResponseDC.xml",
            startPosition: 1,
            maxRecords: 1,
            text: "a",
            options: {}
        }), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                    case SET_LOADING:
                        expect(action.loading).toBe(true);
                        break;
                    case RECORD_LIST_LOADED:
                        expect(action.result.records.length).toBe(2);
                        break;
                    case TEST_TIMEOUT:
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, { });
    });
    it('layerSearchEpic with exception', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(layerSearchEpic), NUM_ACTIONS, layerSearch({
            format: "csw",
            url: "base/web/client/test-resources/csw/getRecordsResponseEsxception.xml",
            startPosition: 1,
            maxRecords: 1,
            text: "a",
            options: {}
        }), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                    case SET_LOADING:
                        expect(action.loading).toBe(true);
                        break;
                    case RECORD_LIST_LOAD_ERROR:
                        expect(action.error.status).toBe(404);
                        expect(action.error.statusText).toBe("Not Found");
                        break;
                    case TEST_TIMEOUT:
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, { });
    });

    it('addLayersMapViewerUrlEpic csw', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(addLayersMapViewerUrlEpic, 0), NUM_ACTIONS, addLayersMapViewerUrl(["gs:us_states"], ["cswCatalog"]), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                    case ADD_LAYER:
                        expect(action.layer.name).toBe("gs:us_states");
                        expect(action.layer.title).toBe("States of US");
                        expect(action.layer.type).toBe("wms");
                        expect(action.layer.url).toBe("https://gs-stable.geo-solutions.it/geoserver/wms");
                        break;
                    case TEST_TIMEOUT:
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            catalog: {
                delayAutoSearch: 50,
                selectedService: "cswCatalog",
                services: {
                    "cswCatalog": {
                        type: "csw",
                        url: "base/web/client/test-resources/csw/getRecordsResponse-gs-us_states.xml"
                    }
                },
                pageSize: 2
            }
        });
    });
    it('addLayersMapViewerUrlEpic wmts', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(addLayersMapViewerUrlEpic, 0), NUM_ACTIONS, addLayersMapViewerUrl(["gs:us_states"], ["cswCatalog"]), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                    case ADD_LAYER:
                        expect(action.layer.name).toBe("gs:us_states");
                        expect(action.layer.title).toBe("States of US");
                        expect(action.layer.type).toBe("wmts");
                        expect(action.layer.url).toBe("https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts");
                        break;
                    case TEST_TIMEOUT:
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            catalog: {
                delayAutoSearch: 50,
                selectedService: "cswCatalog",
                services: {
                    "cswCatalog": {
                        type: "wmts",
                        url: "base/web/client/test-resources/csw/getRecordsResponse-gs-us_statesWMTS.xml"
                    }
                },
                pageSize: 2
            }
        });
    });
});
