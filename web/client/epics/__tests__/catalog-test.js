/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import API from '../../api/catalog';
import catalog from '../catalog';
const {
    addLayersFromCatalogsEpic,
    addLayerAndDescribeEpic,
    getMetadataRecordById,
    autoSearchEpic,
    openCatalogEpic,
    recordSearchEpic,
    getSupportedFormatsEpic,
    updateGroupSelectedMetadataExplorerEpic
} = catalog(API);
import {SHOW_NOTIFICATION} from '../../actions/notifications';
import {CLOSE_FEATURE_GRID} from '../../actions/featuregrid';
import {SET_CONTROL_PROPERTY, toggleControl} from '../../actions/controls';
import {ADD_LAYER, CHANGE_LAYER_PROPERTIES, selectNode} from '../../actions/layers';
import {PURGE_MAPINFO_RESULTS, HIDE_MAPINFO_MARKER} from '../../actions/mapInfo';
import {testEpic, addTimeoutEpic, TEST_TIMEOUT} from './epicTestUtils';
import {
    addLayersMapViewerUrl,
    getMetadataRecordById as initAction,
    changeText,
    textSearch, TEXT_SEARCH,
    RECORD_LIST_LOADED,
    RECORD_LIST_LOAD_ERROR,
    SET_LOADING,
    formatOptionsFetch,
    FORMAT_OPTIONS_LOADING,
    SET_FORMAT_OPTIONS, ADD_LAYER_AND_DESCRIBE, addLayerAndDescribe, DESCRIBE_ERROR
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
            expect(actions[0].options).toEqual({
                filter: "test",
                service: {
                    type: "csw",
                    url: "url",
                    filter: "test"
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
                        url: "url",
                        filter: "test"
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
        testEpic(openCatalogEpic, NUM_ACTIONS, toggleControl("metadataexplorer", "enabled"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            expect(actions[0].type).toBe(CLOSE_FEATURE_GRID);
            expect(actions[1].type).toBe(PURGE_MAPINFO_RESULTS);
            expect(actions[2].type).toBe(HIDE_MAPINFO_MARKER);
            done();
        }, { controls: { metadataexplorer: { enabled: true } }});
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
                    expect(action.result.records.length).toBe(4);
                    const [rec0, rec1, rec2, rec3] = action.result.records;
                    expect(rec0.boundingBox).toExist();
                    expect(rec0.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec0.boundingBox.extent).toEqual([45.542, 11.874, 46.026, 12.718]);
                    expect(rec1.boundingBox).toExist();
                    expect(rec1.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec1.boundingBox.extent).toEqual([12.002717999999996, 45.760718, 12.429282000000002, 46.187282]);
                    expect(rec2.boundingBox).toExist();
                    expect(rec2.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec2.boundingBox.extent).toEqual([ -4.14168, 47.93257, -4.1149, 47.959353362144 ]);
                    expect(rec3.boundingBox).toExist();
                    expect(rec3.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec3.boundingBox.extent).toEqual([ 12.56, 47.46, 13.27, 48.13 ]);
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
                case ADD_LAYER_AND_DESCRIBE:
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
                case ADD_LAYER_AND_DESCRIBE:
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
                case ADD_LAYER_AND_DESCRIBE:
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
                case ADD_LAYER_AND_DESCRIBE:
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
    it('addLayersFromCatalogsEpic wmts via object definion', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(addLayersFromCatalogsEpic, 0), NUM_ACTIONS, addLayersMapViewerUrl(["topp:tasmania_cities_hidden"], [{"type": "wmts", "url": "base/web/client/test-resources/wmts/GetCapabilities-1.0.0.xml"}]), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case ADD_LAYER_AND_DESCRIBE:
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
                selectedService: "externalService",
                services: {
                    "externalService": {
                        type: "wmts",
                        url: "base/web/client/test-resources/wmts/GetCapabilities-1.0.0.xml"
                    }
                },
                pageSize: 2
            }
        });
    });
    it('addLayersFromCatalogsEpic wms with CQL_FILTER passed via "options"', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(addLayersFromCatalogsEpic, 0), NUM_ACTIONS,
            addLayersMapViewerUrl(["spearfish"], ["wmsCatalog"], [{"params": {"CQL_FILTER": "NAME='test'"}}]),
            (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case ADD_LAYER_AND_DESCRIBE:
                        expect(action.layer.name).toBe("spearfish");
                        expect(action.layer.title).toBe("spearfish");
                        expect(action.layer.type).toBe("wms");
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
                    selectedService: "wmsCatalog",
                    services: {
                        "wmsCatalog": {
                            type: "wms",
                            url: "base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml"
                        }
                    },
                    pageSize: 2
                }
            });
    });
    it('addLayerAndDescribeEpic', (done) => {
        const layer = {
            type: 'wms',
            url: 'base/web/client/test-resources/wms/DescribeLayers.xml',
            visibility: true,
            dimensions: [],
            name: 'workspace:vector_layer',
            title: 'workspace:vector_layer',
            bbox: {"crs": "EPSG:4326", "bounds": {"minx": "-103.87791475407893", "miny": "44.37246687108142", "maxx": "-103.62278893469492", "maxy": "44.50235105543566"}},
            links: [],
            params: {
                CQL_FILTER: 'NAME=\'Test\''
            },
            allowedSRS: {
                'EPSG:3857': true,
                'EPSG:4326': true
            }
        };
        const NUM_ACTIONS = 3;
        testEpic(addTimeoutEpic(addLayerAndDescribeEpic, 0), NUM_ACTIONS,
            addLayerAndDescribe(layer),
            (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case ADD_LAYER:
                        expect(action.layer.name).toBe("workspace:vector_layer");
                        expect(action.layer.title).toBe("workspace:vector_layer");
                        expect(action.layer.type).toBe("wms");
                        expect(action.layer.params).toEqual(layer.params);
                        break;
                    case CHANGE_LAYER_PROPERTIES:
                        expect(action.newProperties).toExist();
                        expect(action.newProperties.search).toExist();
                        expect(action.newProperties.search.url).toBe("http://some.geoserver.org:80/geoserver/wfs");
                        expect(action.newProperties.search.type).toBe("wfs");
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
                    selectedService: "wmsCatalog",
                    services: {
                        "wmsCatalog": {
                            type: "wms",
                            url: "base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml"
                        }
                    },
                    pageSize: 2
                }
            });
    });
    it('addLayerAndDescribeEpic multiple urls', (done) => {
        const layer = {
            type: 'wms',
            url: ['base/web/client/test-resources/wms/DescribeLayers.xml', 'base/web/client/test-resources/wms/DescribeLayers.xml'],
            visibility: true,
            dimensions: [],
            name: 'workspace:vector_layer',
            title: 'workspace:vector_layer',
            bbox: {"crs": "EPSG:4326", "bounds": {"minx": "-103.87791475407893", "miny": "44.37246687108142", "maxx": "-103.62278893469492", "maxy": "44.50235105543566"}},
            links: [],
            params: {
                CQL_FILTER: 'NAME=\'Test\''
            },
            allowedSRS: {
                'EPSG:3857': true,
                'EPSG:4326': true
            }
        };
        const NUM_ACTIONS = 3;
        testEpic(addTimeoutEpic(addLayerAndDescribeEpic, 0), NUM_ACTIONS,
            addLayerAndDescribe(layer),
            (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case ADD_LAYER:
                        expect(action.layer.name).toBe("workspace:vector_layer");
                        expect(action.layer.title).toBe("workspace:vector_layer");
                        expect(action.layer.type).toBe("wms");
                        expect(action.layer.params).toEqual(layer.params);
                        expect(action.layer.url).toEqual(layer.url);
                        break;
                    case CHANGE_LAYER_PROPERTIES:
                        expect(action.newProperties).toExist();
                        expect(action.newProperties.search).toExist();
                        expect(action.newProperties.search.url).toBe("http://some.geoserver.org:80/geoserver/wfs");
                        expect(action.newProperties.search.type).toBe("wfs");
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
                    selectedService: "wmsCatalog",
                    services: {
                        "wmsCatalog": {
                            type: "wms",
                            url: "base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml"
                        }
                    },
                    pageSize: 2
                }
            });
    });
    it('addLayerAndDescribeEpic with no describe layer', (done) => {
        const layer = {
            type: 'wms',
            url: 'base/web/client/test-resources/wms/DescribeMissing.xml',
            visibility: true,
            dimensions: [],
            name: 'workspace:vector_layer',
            title: 'workspace:vector_layer',
            bbox: {"crs": "EPSG:4326", "bounds": {"minx": "-103.87791475407893", "miny": "44.37246687108142", "maxx": "-103.62278893469492", "maxy": "44.50235105543566"}},
            links: [],
            params: {
                CQL_FILTER: 'NAME=\'Test\''
            },
            allowedSRS: {
                'EPSG:3857': true,
                'EPSG:4326': true
            }
        };
        const NUM_ACTIONS = 3;
        testEpic(addTimeoutEpic(addLayerAndDescribeEpic, 0), NUM_ACTIONS,
            addLayerAndDescribe(layer),
            (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case ADD_LAYER:
                        expect(action.layer.name).toBe("workspace:vector_layer");
                        expect(action.layer.title).toBe("workspace:vector_layer");
                        expect(action.layer.type).toBe("wms");
                        expect(action.layer.params).toEqual(layer.params);
                        expect(action.layer.url).toEqual(layer.url);
                        break;
                    case DESCRIBE_ERROR:
                        expect(action.layer).toExist();
                        expect(action.error).toExist();
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
                    selectedService: "wmsCatalog",
                    services: {
                        "wmsCatalog": {
                            type: "wms",
                            url: "base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml"
                        }
                    },
                    pageSize: 2
                }
            });
    });
    it('getSupportedFormatsEpic wms', (done) => {
        const NUM_ACTIONS = 3;
        const url = "base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml";
        testEpic(addTimeoutEpic(getSupportedFormatsEpic, 0), NUM_ACTIONS, formatOptionsFetch(url), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case SET_FORMAT_OPTIONS:
                    expect(action.formats).toBeTruthy();
                    expect(action.formats.imageFormats).toEqual([{"label": "image/png", "value": "image/png"}, {"label": "image/gif", "value": "image/gif"}, {"label": "image/jpeg", "value": "image/jpeg"}, {"label": "image/png8", "value": "image/png8"}, {"label": "image/vnd.jpeg-png", "value": "image/vnd.jpeg-png"}]);
                    expect(action.formats.infoFormats).toEqual(["text/plain", "text/html", "application/json"]);
                    break;
                case FORMAT_OPTIONS_LOADING:
                    break;
                case TEST_TIMEOUT:
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            catalog: {}
        });
    });

    it('updateGroupSelectedMetadataExplorerEpic allows clicking on group to set destination to current group', done => {
        const state = {
            layers: {
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'group'
                },
                groups: [{
                    id: 'layerId',
                    name: 'layerName'
                }],
                selected: ['layerId']
            },
            controls: {
                toolbar: {
                    active: 'metadataexplorer'
                },
                metadataexplorer: {
                    enabled: true,
                    group: 'layerId'
                }
            }
        };
        const id = state.layers.groups[0].id;
        const nodeType = state.layers.settings.nodeType;

        testEpic(updateGroupSelectedMetadataExplorerEpic, 1, selectNode(id, nodeType), actions => {
            try {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[0].control).toBe('metadataexplorer');
                expect(actions[0].property).toEqual('group');
            } catch (error) {
                done(error);
            }
        }, state, done);
    });
});
