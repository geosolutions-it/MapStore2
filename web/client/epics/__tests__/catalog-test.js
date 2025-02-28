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
    updateGroupSelectedMetadataExplorerEpic,
    newCatalogServiceAdded
} = catalog(API);
import { ZOOM_TO_EXTENT } from '../../actions/map';
import {SHOW_NOTIFICATION} from '../../actions/notifications';
import {SET_CONTROL_PROPERTY, toggleControl} from '../../actions/controls';
import {ADD_LAYER, CHANGE_LAYER_PROPERTIES, selectNode, SHOW_LAYER_METADATA} from '../../actions/layers';
import {PURGE_MAPINFO_RESULTS, HIDE_MAPINFO_MARKER} from '../../actions/mapInfo';
import {testEpic, addTimeoutEpic, TEST_TIMEOUT} from './epicTestUtils';
import {
    addLayersMapViewerUrl,
    getMetadataRecordById as initAction,
    changeText,
    textSearch,
    TEXT_SEARCH,
    RECORD_LIST_LOADED,
    RECORD_LIST_LOAD_ERROR,
    SET_LOADING,
    ADD_LAYER_AND_DESCRIBE,
    addLayerAndDescribe,
    DESCRIBE_ERROR,
    SAVING_SERVICE,
    NEW_SERVICE_STATUS,
    ADD_CATALOG_SERVICE,
    addService
} from '../../actions/catalog';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';

let mockAxios;

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
    it('should return metadata TC211 with getMetadataRecordById (mapserver)', (done) => {

        testEpic(getMetadataRecordById, 2, initAction({
            xmlNamespaces: {
                gmd: 'http://www.isotc211.org/2005/gmd',
                srv: 'http://www.isotc211.org/2005/srv',
                gco: 'http://www.isotc211.org/2005/gco',
                gmx: 'http://www.isotc211.org/2005/gmx',
                gfc: 'http://www.isotc211.org/2005/gfc',
                gts: 'http://www.isotc211.org/2005/gts',
                gml: 'http://www.opengis.net/gml'
            },
            extractors: [{
                layersRegex: '^opendata_raw$',
                properties: {
                    title: '/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString'
                }
            }]
        }), (actions) => {
            try {
                const [
                    showLayerMetadataEmptyAction,
                    showLayerMetadataResponseAction
                ] = actions;
                expect(showLayerMetadataEmptyAction.type).toBe(SHOW_LAYER_METADATA);
                expect(showLayerMetadataEmptyAction.maskLoading).toBe(true);
                expect(showLayerMetadataEmptyAction.metadataRecord).toEqual({});
                expect(showLayerMetadataResponseAction.type).toBe(SHOW_LAYER_METADATA);
                expect(showLayerMetadataResponseAction.maskLoading).toBe(false);
                expect(showLayerMetadataResponseAction.metadataRecord).toEqual({ title: 'Images brutes en open data' });
            } catch (e) {
                done(e);
            }
            done();
        }, {
            layers: {
                selected: ["opendata_raw"],
                flat: [{
                    id: "opendata_raw",
                    name: "opendata_raw",
                    type: "wms",
                    url: "base/web/client/test-resources/wms/getCapabilities-mapserver.xml"
                }]
            }
        });
    });

    it('should return metadata TC211 with getMetadataRecordById (mapproxy single)', (done) => {
        testEpic(getMetadataRecordById, 2, initAction({
            xmlNamespaces: {
                gmd: 'http://www.isotc211.org/2005/gmd',
                srv: 'http://www.isotc211.org/2005/srv',
                gco: 'http://www.isotc211.org/2005/gco',
                gmx: 'http://www.isotc211.org/2005/gmx',
                gfc: 'http://www.isotc211.org/2005/gfc',
                gts: 'http://www.isotc211.org/2005/gts',
                gml: 'http://www.opengis.net/gml'
            },
            extractors: [{
                layersRegex: '^cadastre$',
                properties: {
                    title: '/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString'
                }
            }]
        }), (actions) => {
            try {
                const [
                    showLayerMetadataEmptyAction,
                    showLayerMetadataResponseAction
                ] = actions;
                expect(showLayerMetadataEmptyAction.type).toBe(SHOW_LAYER_METADATA);
                expect(showLayerMetadataEmptyAction.maskLoading).toBe(true);
                expect(showLayerMetadataEmptyAction.metadataRecord).toEqual({});
                expect(showLayerMetadataResponseAction.type).toBe(SHOW_LAYER_METADATA);
                expect(showLayerMetadataResponseAction.maskLoading).toBe(false);
                expect(showLayerMetadataResponseAction.metadataRecord).toEqual({
                    metadataUrl: 'https://ids.craig.fr/geocat/srv/api/records/3bedb35a-a9ba-4f48-8796-de127becd578',
                    title: 'Plan Cadastral Informatisé (PCI) au format vecteur - Auvergne-Rhône-Alpes - 01/2022'
                });
            } catch (e) {
                done(e);
            }
            done();
        }, {
            layers: {
                selected: ["cadastre"],
                flat: [{
                    id: "cadastre",
                    name: "cadastre",
                    type: "wms",
                    url: "base/web/client/test-resources/wms/getCapabilities-mapproxy-singlelayer.xml"
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
    it('autoSearchEpic - wms with domain aliases', (done) => {
        const NUM_ACTIONS = 1;
        const domainAliases = ['url1', 'url2'];
        testEpic(autoSearchEpic, NUM_ACTIONS, changeText(""), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            expect(actions[0].type).toBe(TEXT_SEARCH);
            expect(actions[0].url).toBe("url,url1,url2");
            expect(actions[0].options).toEqual({
                service: {
                    type: "wms",
                    url: "url",
                    filter: "test",
                    domainAliases
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
                        url: "url",
                        filter: "test",
                        domainAliases
                    }
                },
                pageSize: 2
            },
            layers: {
                selected: ["TEST"],
                flat: [{
                    id: "TEST"
                }]
            }
        });
    });
    it('openCatalogEpic', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(openCatalogEpic, NUM_ACTIONS, toggleControl("metadataexplorer", "enabled"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            expect(actions[0].type).toBe(PURGE_MAPINFO_RESULTS);
            expect(actions[1].type).toBe(HIDE_MAPINFO_MARKER);
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
    it('recordSearchEpic with new service', (done) => {
        const NUM_ACTIONS = 7;
        const service = {type: "csw", url: "some_url"};
        testEpic(addTimeoutEpic(recordSearchEpic), NUM_ACTIONS, textSearch({
            format: "csw",
            url: "base/web/client/test-resources/csw/getRecordsResponseDC.xml",
            startPosition: 1,
            maxRecords: 1,
            text: "a",
            options: {service, isNewService: true}
        }), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
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
                case NEW_SERVICE_STATUS:
                    expect(action.status).toBeTruthy();
                    break;
                case ADD_CATALOG_SERVICE:
                    expect(action.service).toEqual(service);
                    break;
                case SHOW_NOTIFICATION:
                    expect(action.level).toEqual('success');
                    break;
                case SAVING_SERVICE:
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
    it('newCatalogServiceAdded', (done) => {
        const NUM_ACTIONS = 2;
        const service = {type: "csw", url: "base/web/client/test-resources/csw/getRecordsResponseDC.xml"};
        testEpic(addTimeoutEpic(newCatalogServiceAdded), NUM_ACTIONS, addService(), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case TEXT_SEARCH:
                    expect(action.format).toBe(service.type);
                    expect(action.url).toBe(service.url);
                    expect(action.startPosition).toBe(1);
                    expect(action.maxRecords).toBe(4);
                    expect(action.text).toBe("");
                    expect(action.options).toEqual({service, isNewService: true});
                    break;
                case TEST_TIMEOUT:
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, { catalog: {
            newService: service
        } });
    });
    it('recordSearchEpic with network error', (done) => {
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
            url: "base/web/client/test-resources/csw/getRecordsResponseException.xml",
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
                    expect(action.error).toContain('IllegalArgumentException');
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
    it('recordSearchEpic with exception with new service', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(recordSearchEpic), NUM_ACTIONS, textSearch({
            format: "csw",
            url: "base/web/client/test-resources/csw/getRecordsResponseEsxception.xml",
            startPosition: 1,
            maxRecords: 1,
            text: "a",
            options: {isNewService: true}
        }), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case SAVING_SERVICE:
                    expect(action.status).toBe(true);
                    break;
                case SHOW_NOTIFICATION:
                    expect(action.message).toBe('catalog.notification.errorServiceUrl');
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
    it('addLayerAndDescribeEpic for wms layer with remoteTileGrids = true', (done) => {
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
            },
            remoteTileGrids: true
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
                        expect(action.newProperties.tileGridStrategy).toEqual('custom');
                        expect(action.newProperties.tileGrids).toExist();
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

    describe('addLayersFromCatalogsEpic 3d tiles', () => {

        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        it('should add layer with title', (done) => {
            const NUM_ACTIONS = 1;
            const tileset = {
                "asset": {
                    "version": "1.0"
                },
                "properties": {
                    "Height": {
                        "minimum": 0,
                        "maximum": 7
                    }
                },
                "geometricError": 70,
                "root": {
                    "refine": "ADD",
                    "boundingVolume": {
                        "region": [
                            -1.3197004795898053,
                            0.6988582109,
                            -1.3196595204101946,
                            0.6988897891,
                            0,
                            20
                        ]
                    },
                    "geometricError": 0,
                    "content": {
                        "uri": "model.b3dm"
                    }
                }
            };
            mockAxios.onGet(/tileset\.json/).reply(() => ([ 200, tileset ]));
            testEpic(
                addLayersFromCatalogsEpic,
                NUM_ACTIONS,
                addLayersMapViewerUrl(["Title"], [{ url: 'https://server.org/name/tileset.json', type: '3dtiles' }]),
                (actions) => {
                    try {
                        const [
                            addLayerAndDescribeAction
                        ] = actions;
                        expect(addLayerAndDescribeAction.type).toBe(ADD_LAYER_AND_DESCRIBE);
                        expect(addLayerAndDescribeAction.layer).toBeTruthy();
                        expect(addLayerAndDescribeAction.layer.type).toBe("3dtiles");
                        expect(addLayerAndDescribeAction.layer.url).toBe("https://server.org/name/tileset.json");
                        expect(addLayerAndDescribeAction.layer.title).toBe("Title");
                    } catch (e) {
                        done(e);
                    }
                    done();
                }, {});
        });
        it('should add layer with catalog id', (done) => {
            const NUM_ACTIONS = 1;
            const tileset = {
                "asset": {
                    "version": "1.0"
                },
                "properties": {
                    "Height": {
                        "minimum": 0,
                        "maximum": 7
                    }
                },
                "geometricError": 70,
                "root": {
                    "refine": "ADD",
                    "boundingVolume": {
                        "region": [
                            -1.3197004795898053,
                            0.6988582109,
                            -1.3196595204101946,
                            0.6988897891,
                            0,
                            20
                        ]
                    },
                    "geometricError": 0,
                    "content": {
                        "uri": "model.b3dm"
                    }
                }
            };
            mockAxios.onGet(/tileset\.json/).reply(() => ([ 200, tileset ]));
            testEpic(
                addLayersFromCatalogsEpic,
                NUM_ACTIONS,
                addLayersMapViewerUrl(["name"], ["3dTilesCatalog"]),
                (actions) => {
                    try {
                        const [
                            addLayerAndDescribeAction
                        ] = actions;
                        expect(addLayerAndDescribeAction.type).toBe(ADD_LAYER_AND_DESCRIBE);
                        expect(addLayerAndDescribeAction.layer).toBeTruthy();
                        expect(addLayerAndDescribeAction.layer.type).toBe("3dtiles");
                        expect(addLayerAndDescribeAction.layer.url).toBe("https://server.org/name/tileset.json");
                        expect(addLayerAndDescribeAction.layer.title).toBe("name");
                    } catch (e) {
                        done(e);
                    }
                    done();
                }, {
                    catalog: {
                        selectedService: "3dTilesCatalog",
                        services: {
                            "3dTilesCatalog": {
                                url: 'https://server.org/name/tileset.json',
                                type: '3dtiles'
                            }
                        }
                    }
                });
        });
    });

    describe('addLayerAndDescribeEpic wfs and arcgis layers', () => {

        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });

        it('wfs layer polygon', (done) => {
            const layer = {
                type: 'wfs',
                url: '/geoserver/wfs',
                visibility: true,
                name: 'workspace:vector_layer',
                title: 'workspace:vector_layer',
                bbox: {"crs": "EPSG:4326", "bounds": {"minx": "-103.87791475407893", "miny": "44.37246687108142", "maxx": "-103.62278893469492", "maxy": "44.50235105543566"}}
            };
            mockAxios.onGet().reply(() => ([ 200, {
                "elementFormDefault": "qualified",
                "targetNamespace": "/geoserver/geoserver",
                "targetPrefix": "gs",
                "featureTypes": [
                    {
                        "typeName": "workspace:vector_layer",
                        "properties": [
                            {
                                "name": "the_geom",
                                "maxOccurs": 1,
                                "minOccurs": 0,
                                "nillable": true,
                                "type": "gml:MultiPolygon",
                                "localType": "MultiPolygon"
                            }
                        ]
                    }
                ]
            } ]));
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
                            expect(action.layer.type).toBe("wfs");
                            expect(action.layer.url).toEqual(layer.url);
                            break;
                        case CHANGE_LAYER_PROPERTIES:
                            expect(action.newProperties.style).toBeTruthy();
                            expect(action.newProperties.style.body.rules.length).toBe(1);
                            expect(action.newProperties.style.body.rules[0].symbolizers.length).toBe(1);
                            expect(action.newProperties.style.body.rules[0].symbolizers[0].kind).toBe('Fill');
                            break;
                        case TEST_TIMEOUT:
                            break;
                        default:
                            expect(true).toBe(false);
                        }
                    });
                    done();
                }, {});
        });
        it('wfs layer line', (done) => {
            const layer = {
                type: 'wfs',
                url: '/geoserver/wfs',
                visibility: true,
                name: 'workspace:vector_layer',
                title: 'workspace:vector_layer',
                bbox: {"crs": "EPSG:4326", "bounds": {"minx": "-103.87791475407893", "miny": "44.37246687108142", "maxx": "-103.62278893469492", "maxy": "44.50235105543566"}}
            };
            mockAxios.onGet().reply(() => ([ 200, {
                "elementFormDefault": "qualified",
                "targetNamespace": "/geoserver/geoserver",
                "targetPrefix": "gs",
                "featureTypes": [
                    {
                        "typeName": "workspace:vector_layer",
                        "properties": [
                            {
                                "name": "the_geom",
                                "maxOccurs": 1,
                                "minOccurs": 0,
                                "nillable": true,
                                "type": "gml:LineString",
                                "localType": "LineString"
                            }
                        ]
                    }
                ]
            } ]));
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
                            expect(action.layer.type).toBe("wfs");
                            expect(action.layer.url).toEqual(layer.url);
                            break;
                        case CHANGE_LAYER_PROPERTIES:
                            expect(action.newProperties.style).toBeTruthy();
                            expect(action.newProperties.style.body.rules.length).toBe(1);
                            expect(action.newProperties.style.body.rules[0].symbolizers.length).toBe(1);
                            expect(action.newProperties.style.body.rules[0].symbolizers[0].kind).toBe('Line');
                            break;
                        case TEST_TIMEOUT:
                            break;
                        default:
                            expect(true).toBe(false);
                        }
                    });
                    done();
                }, {});
        });
        it('wfs layer point', (done) => {
            const layer = {
                type: 'wfs',
                url: '/geoserver/wfs',
                visibility: true,
                name: 'workspace:vector_layer',
                title: 'workspace:vector_layer',
                bbox: {"crs": "EPSG:4326", "bounds": {"minx": "-103.87791475407893", "miny": "44.37246687108142", "maxx": "-103.62278893469492", "maxy": "44.50235105543566"}}
            };
            mockAxios.onGet().reply(() => ([ 200, {
                "elementFormDefault": "qualified",
                "targetNamespace": "/geoserver/geoserver",
                "targetPrefix": "gs",
                "featureTypes": [
                    {
                        "typeName": "workspace:vector_layer",
                        "properties": [
                            {
                                "name": "the_geom",
                                "maxOccurs": 1,
                                "minOccurs": 0,
                                "nillable": true,
                                "type": "gml:Point",
                                "localType": "Point"
                            }
                        ]
                    }
                ]
            } ]));
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
                            expect(action.layer.type).toBe("wfs");
                            expect(action.layer.url).toEqual(layer.url);
                            break;
                        case CHANGE_LAYER_PROPERTIES:
                            expect(action.newProperties.style).toBeTruthy();
                            expect(action.newProperties.style.body.rules.length).toBe(1);
                            expect(action.newProperties.style.body.rules[0].symbolizers.length).toBe(1);
                            expect(action.newProperties.style.body.rules[0].symbolizers[0].kind).toBe('Mark');
                            break;
                        case TEST_TIMEOUT:
                            break;
                        default:
                            expect(true).toBe(false);
                        }
                    });
                    done();
                }, {});
        });

        it('should send request with arcgis layer with name and options layers', (done) => {
            const layer = {
                type: 'arcgis',
                url: '/arcgis/rest/services/Map/MapServer',
                title: 'Map',
                description: 'MapServer',
                visibility: true,
                name: '1'
            };
            mockAxios.onGet().reply(() => ([200, {
                extent: {
                    xmin: -119.97727829597589,
                    ymin: 34.75019112370114,
                    xmax: -119.10884666994308,
                    ymax: 35.69641644201112,
                    spatialReference: {
                        wkid: 4326,
                        latestWkid: 4326
                    }
                }
            }]));
            const NUM_ACTIONS = 2;
            testEpic(addTimeoutEpic(addLayerAndDescribeEpic, 0), NUM_ACTIONS,
                addLayerAndDescribe(layer),
                (actions) => {
                    try {
                        expect(actions.map(action => action.type)).toEqual([
                            ADD_LAYER,
                            ZOOM_TO_EXTENT
                        ]);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }, {});
        });

        it('should send request with arcgis layer without name and options layers', (done) => {
            const layer = {
                type: 'arcgis',
                url: '/arcgis/rest/services/Map/MapServer',
                title: 'Map',
                description: 'MapServer',
                visibility: true
            };
            mockAxios.onGet().reply(() => ([200, {
                layers: [],
                currentVersion: 10.91,
                serviceDescription: 'Description',
                capabilities: 'Map,Query,Data',
                supportedImageFormatTypes: 'PNG32,PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,BMP',
                fullExtent: {
                    xmin: -119.97727829597589,
                    ymin: 34.75019112370114,
                    xmax: -119.10884666994308,
                    ymax: 35.69641644201112,
                    spatialReference: {
                        wkid: 4326,
                        latestWkid: 4326
                    }
                }
            }]));
            const NUM_ACTIONS = 2;
            testEpic(addTimeoutEpic(addLayerAndDescribeEpic, 0), NUM_ACTIONS,
                addLayerAndDescribe(layer),
                (actions) => {
                    try {
                        expect(actions.map(action => action.type)).toEqual([
                            ADD_LAYER,
                            ZOOM_TO_EXTENT
                        ]);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }, {});
        });

        it('should not send request with arcgis layer without name and options layers', (done) => {
            const layer = {
                type: 'arcgis',
                url: '/arcgis/rest/services/Map/MapServer',
                title: 'Map',
                description: 'MapServer',
                visibility: true,
                options: {
                    layers: [{ id: 1 }]
                }
            };
            const NUM_ACTIONS = 1;
            testEpic(addTimeoutEpic(addLayerAndDescribeEpic, 0), NUM_ACTIONS,
                addLayerAndDescribe(layer),
                (actions) => {
                    try {
                        expect(actions.map(action => action.type)).toEqual([
                            ADD_LAYER
                        ]);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }, {});
        });
    });
    describe('addLayersFromCatalogsEpic geojson', () => {
        it('should add layer with title from geojson', (done) => {
            const NUM_ACTIONS = 1;
            testEpic(
                addLayersFromCatalogsEpic,
                NUM_ACTIONS,
                addLayersMapViewerUrl(["Title"], [{ url: 'base/web/client/test-resources/geojson/example.geojson', type: 'GEOJSON' }]),
                (actions) => {
                    try {
                        const [
                            addLayerAndDescribeAction
                        ] = actions;
                        expect(addLayerAndDescribeAction.type).toBe(ADD_LAYER_AND_DESCRIBE);
                        expect(addLayerAndDescribeAction.layer).toBeTruthy();
                        expect(addLayerAndDescribeAction.layer.bbox.crs).toBe("EPSG:4326");
                        expect(addLayerAndDescribeAction.layer.type).toBe("vector");
                        expect(addLayerAndDescribeAction.layer.title).toBe("Title");
                    } catch (e) {
                        done(e);
                    }
                    done();
                }, {});
        });
    });

});
