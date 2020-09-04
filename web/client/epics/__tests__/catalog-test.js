/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import csw from '../../api/CSW';
import wms from '../../api/WMS';
import wmts from '../../api/WMTS';
const API = {
    csw,
    wms,
    wmts
};
import catalog from '../catalog';
const {
    addLayersFromCatalogsEpic,
    getMetadataRecordById,
    autoSearchEpic,
    openCatalogEpic,
    recordSearchEpic
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
    textSearch, TEXT_SEARCH,
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
            expect(actions[0].type).toBe(TEXT_SEARCH);
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

    it('recordSearchEpic with two layers', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(recordSearchEpic), NUM_ACTIONS, textSearch({
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
                    const rec0 = action.result.records[0];
                    expect(rec0.boundingBox).toExist();
                    expect(rec0.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec0.boundingBox.extent).toEqual([45.542, 11.874, 46.026, 12.718]);
                    const rec1 = action.result.records[1];
                    expect(rec1.boundingBox).toExist();
                    expect(rec1.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec1.boundingBox.extent).toEqual([12.002717999999996, 45.760718, 12.429282000000002, 46.187282]);
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
    it('recordSearchEpic with exception', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(recordSearchEpic), NUM_ACTIONS, textSearch({
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

    it('addLayersFromCatalogsEpic csw', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(addLayersFromCatalogsEpic, 0), NUM_ACTIONS, addLayersMapViewerUrl(["gs:us_states"], ["cswCatalog"]), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case ADD_LAYER:
                    expect(action.layer.name).toBe("gs:us_states");
                    expect(action.layer.title).toBe("States of US");
                    expect(action.layer.type).toBe("wms");
                    expect(action.layer.url).toBe("https://sample.server/geoserver/wms");
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
    it('addLayersFromCatalogsEpic csw and wms both found', (done) => {
        const NUM_ACTIONS = 3;
        testEpic(addTimeoutEpic(addLayersFromCatalogsEpic, 10), NUM_ACTIONS, addLayersMapViewerUrl(["gs:us_states", "some_layer"], ["cswCatalog", "wmsCatalog"]), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case ADD_LAYER:
                    if (action.layer.name === "gs:us_states") {
                        expect(action.layer.title).toBe("States of US");
                        expect(action.layer.type).toBe("wms");
                        expect(action.layer.url).toBe("https://sample.server/geoserver/wms");
                    } else {
                        expect(action.layer.name).toBe("some_layer");
                        expect(action.layer.title).toBe("some layer");
                        expect(action.layer.type).toBe("wms");
                        expect(action.layer.url).toBe("base/web/client/test-resources/wms/attribution.xml");
                    }
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
                    },
                    "wmsCatalog": {
                        type: "wms",
                        url: "base/web/client/test-resources/wms/attribution.xml"
                    }
                },
                pageSize: 2
            }
        });
    });
    it('addLayersFromCatalogsEpic csw found and wms not found', (done) => {
        const NUM_ACTIONS = 3;
        testEpic(addTimeoutEpic(addLayersFromCatalogsEpic, 10), NUM_ACTIONS, addLayersMapViewerUrl(["gs:us_states", "not_found"], ["cswCatalog", "wmsCatalog"]), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case ADD_LAYER:
                    expect(action.layer.name).toBe("gs:us_states");
                    expect(action.layer.title).toBe("States of US");
                    expect(action.layer.type).toBe("wms");
                    expect(action.layer.url).toBe("https://sample.server/geoserver/wms");
                    break;
                case SHOW_NOTIFICATION:
                    expect(action.message).toBe("catalog.notification.errorSearchingRecords");
                    expect(action.values).toEqual({records: "not_found"});
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
                    },
                    "wmsCatalog": {
                        type: "wms",
                        url: "base/web/client/test-resources/wms/attribution.xml"
                    }
                },
                pageSize: 2
            }
        });
    });
    it('addLayersFromCatalogsEpic wmts', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(addLayersFromCatalogsEpic, 0), NUM_ACTIONS, addLayersMapViewerUrl(["topp:tasmania_cities_hidden"], ["cswCatalog"]), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case ADD_LAYER:
                    expect(action.layer.name).toBe("topp:tasmania_cities_hidden");
                    expect(action.layer.title).toBe("tasmania_cities");
                    expect(action.layer.type).toBe("wmts");
                    expect(action.layer.url).toBe("http://sample.server/geoserver/gwc/service/wmts");
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
                        url: "base/web/client/test-resources/wmts/GetCapabilities-1.0.0.xml"
                    }
                },
                pageSize: 2
            }
        });
    });
});
