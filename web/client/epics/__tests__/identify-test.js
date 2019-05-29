/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const { ZOOM_TO_POINT, clickOnMap } = require('../../actions/map');
const { FEATURE_INFO_CLICK, UPDATE_CENTER_TO_MARKER, PURGE_MAPINFO_RESULTS, NEW_MAPINFO_REQUEST, LOAD_FEATURE_INFO, NO_QUERYABLE_LAYERS, ERROR_FEATURE_INFO, EXCEPTIONS_FEATURE_INFO, SHOW_MAPINFO_MARKER, HIDE_MAPINFO_MARKER, GET_VECTOR_INFO, loadFeatureInfo, featureInfoClick, closeIdentify } = require('../../actions/mapInfo');
const { getFeatureInfoOnFeatureInfoClick, zoomToVisibleAreaEpic, onMapClick, closeFeatureAndAnnotationEditing, handleMapInfoMarker } = require('../identify');
const { CLOSE_ANNOTATIONS } = require('../../actions/annotations');
const { testEpic, TEST_TIMEOUT, addTimeoutEpic } = require('./epicTestUtils');
const { registerHook } = require('../../utils/MapUtils');

const TEST_MAP_STATE = {
    present: {
        size: {
            width: 1581,
            height: 946
        },
        zoom: 4,
        projection: 'EPSG:3857',
        bbox: {
            bounds: {
                maxx: -5732165,
                maxy: 5722381,
                minx: -9599267,
                miny: 3408479
            },
            crs: 'EPSG:3857'
        }
    }
};

describe('identify Epics', () => {
    it('getFeatureInfoOnFeatureInfoClick, no queriable layers', (done) => {
        const state = {
            layers: {
                flat: [{
                    id: "TEST",
                    "title": "TITLE",
                    type: "wms",
                    url: 'base/web/client/test-resources/featureInfo-response.json'
                }]
            }
        };
        const sentActions = [featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } })];
        testEpic(getFeatureInfoOnFeatureInfoClick, 2, sentActions, ([a0, a1]) => {
            expect(a0.type).toBe(PURGE_MAPINFO_RESULTS);
            expect(a1.type).toBe(NO_QUERYABLE_LAYERS);

            done();
        }, state);
    });
    it('getFeatureInfoOnFeatureInfoClick WMS', (done) => {
        // remove previous hook
        registerHook('RESOLUTION_HOOK', undefined);
        const state = {
            map: TEST_MAP_STATE,
            mapInfo: {
                clickPoint: { latlng: { lat: 36.95, lng: -79.84 } }
            },
            layers: {
                flat: [{
                    id: "TEST",
                    "title": "TITLE",
                    type: "wms",
                    visibility: true,
                    url: 'base/web/client/test-resources/featureInfo-response.json'
                }]
            }
        };
        const sentActions = [featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } })];
        testEpic(getFeatureInfoOnFeatureInfoClick, 3, sentActions, ([a0, a1, a2]) => {
            try {
                expect(a0).toExist();
                expect(a0.type).toBe(PURGE_MAPINFO_RESULTS);
                expect(a1).toExist();
                expect(a1.type).toBe(NEW_MAPINFO_REQUEST);
                expect(a1.reqId).toExist();
                expect(a1.request).toExist();
                expect(a2).toExist();
                expect(a2.type).toBe(LOAD_FEATURE_INFO);
                expect(a2.data).toExist();
                expect(a2.requestParams).toExist();
                expect(a2.reqId).toExist();
                expect(a2.layerMetadata.title).toBe(state.layers.flat[0].title);
                done();
            } catch (ex) {
                done(ex);
            }
        }, state);
    });
    it('getFeatureInfoOnFeatureInfoClick with multiSelection', (done) => {
        // remove previous hook
        registerHook('RESOLUTION_HOOK', undefined);
        const CLICK_POINT = {
            latlng: { lat: 36.95, lng: -79.84},
            modifiers: {
                alt: false,
                ctrl: true,
                shift: false
            },
            // TODO: this should be moved in the application state to be configurable
            // now is supported this way, but the application do not manage it
            multiSelection: true
        };
        const state = {
            map: TEST_MAP_STATE,
            mapInfo: {
                clickPoint: CLICK_POINT
            },
            layers: {
                flat: [{
                    id: "TEST",
                    "title": "TITLE",
                    type: "wms",
                    visibility: true,
                    url: 'base/web/client/test-resources/featureInfo-response.json'
                }]
            }
        };
        const sentActions = [featureInfoClick(CLICK_POINT)];
        testEpic(getFeatureInfoOnFeatureInfoClick, 2, sentActions, ([a1, a2]) => {
            try {
                // no purge
                expect(a1).toExist();
                expect(a1.type).toBe(NEW_MAPINFO_REQUEST);
                expect(a1.reqId).toExist();
                expect(a1.request).toExist();
                expect(a2).toExist();
                expect(a2.type).toBe(LOAD_FEATURE_INFO);
                expect(a2.data).toExist();
                expect(a2.requestParams).toExist();
                expect(a2.reqId).toExist();
                expect(a2.layerMetadata.title).toBe(state.layers.flat[0].title);
                done();
            } catch (ex) {
                done(ex);
            }
        }, state);
    });
    it('getFeatureInfoOnFeatureInfoClick triggers ERROR_FEATURE_INFO on load error', (done) => {
        // remove previous hook
        registerHook('RESOLUTION_HOOK', undefined);
        const state = {
            map: TEST_MAP_STATE,
            mapInfo: {
                clickPoint: { latlng: { lat: 36.95, lng: -79.84 } }
            },
            layers: {
                flat: [{
                    id: "TEST",
                    "title": "TITLE",
                    type: "wms",
                    visibility: true,
                    url: 'requestError.json'
                }]
            }
        };
        const sentActions = [featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } })];
        testEpic(getFeatureInfoOnFeatureInfoClick, 3, sentActions, ([a0, a1, a2]) => {
            try {
                expect(a0).toExist();
                expect(a0.type).toBe(PURGE_MAPINFO_RESULTS);
                expect(a1).toExist();
                expect(a1.type).toBe(NEW_MAPINFO_REQUEST);
                expect(a1.reqId).toExist();
                expect(a1.request).toExist();
                expect(a2).toExist();
                expect(a2.type).toBe(ERROR_FEATURE_INFO);
                expect(a2).toExist();
                expect(a2.type).toBe(ERROR_FEATURE_INFO);
                expect(a2.error).toExist();
                expect(a2.reqId).toExist();
                expect(a2.requestParams).toExist();
                expect(a2.layerMetadata.title).toBe(state.layers.flat[0].title);
                done();
            } catch (ex) {
                done(ex);
            }
        }, state);
    });
    it('getFeatureInfoOnFeatureInfoClick handle server exception', (done) => {
        // remove previous hook
        registerHook('RESOLUTION_HOOK', undefined);
        const state = {
            map: TEST_MAP_STATE,
            mapInfo: {
                clickPoint: { latlng: { lat: 36.95, lng: -79.84 } }
            },
            layers: {
                flat: [{
                    id: "TEST",
                    "title": "TITLE",
                    type: "wms",
                    visibility: true,
                    url: 'base/web/client/test-resources/featureInfo-exception.json'
                }]
            }
        };
        const sentActions = [featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } })];
        testEpic(getFeatureInfoOnFeatureInfoClick, 3, sentActions, ([a0, a1, a2]) => {
            try {
                expect(a0).toExist();
                expect(a0.type).toBe(PURGE_MAPINFO_RESULTS);
                expect(a1).toExist();
                expect(a1.type).toBe(NEW_MAPINFO_REQUEST);
                expect(a1.reqId).toExist();
                expect(a1.request).toExist();
                expect(a2).toExist();
                expect(a2.type).toBe(EXCEPTIONS_FEATURE_INFO);
                expect(a2.exceptions).toExist();
                expect(a2.reqId).toExist();
                expect(a2.requestParams).toExist();
                expect(a2.layerMetadata.title).toBe(state.layers.flat[0].title);
                done();
            } catch (ex) {
                done(ex);
            }
        }, state);
    });
    it('Test local request, remote request and skip background layers', done => {
        const LAYERS = [{
            id: 'OpenTopoMap__3',
            group: 'background',
            source: 'OpenTopoMap',
            name: 'OpenTopoMap',
            title: 'OpenTopoMap',
            type: 'tileprovider',
            visibility: false,
            handleClickOnLayer: false,
            hidden: false
        },
        {
            id: 'topp:states__4',
            name: 'topp:states',
            title: 'USA Population',
            type: 'wms',
            url: 'base/web/client/test-resources/featureInfo-response.json',
            visibility: true,
            handleClickOnLayer: false,
            hidden: false
        },
        {
            id: 'annotations',
            features: [],
            name: 'Annotations',
            type: 'vector',
            visibility: true,
            handleClickOnLayer: true,
            hidden: false
        }];
        const state = {
            map: TEST_MAP_STATE,
            mapInfo: {
                clickPoint: { latlng: { lat: 36.95, lng: -79.84 } }
            },
            layers: LAYERS
        };
        const sentActions = [featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } })];
        testEpic(getFeatureInfoOnFeatureInfoClick, 4, sentActions, ([a0, a1, a2, a3]) => {
            try {
                expect(a0).toExist();
                expect(a0.type).toBe(PURGE_MAPINFO_RESULTS);
                expect(a1).toExist();
                expect(a1.type).toBe(NEW_MAPINFO_REQUEST);
                expect(a1.reqId).toExist();
                expect(a1.request).toExist();
                expect(a2.type).toBe(GET_VECTOR_INFO);
                expect(a3).toExist();
                expect(a3.type).toBe(LOAD_FEATURE_INFO);
                done();
            } catch (ex) {
                done(ex);
            }
        }, state);
    });

    it('handleMapInfoMarker show', done => {
        testEpic(handleMapInfoMarker, 1, featureInfoClick({}), ([ a ]) => {
            expect(a.type).toBe(SHOW_MAPINFO_MARKER);
            done();
        }, {});
    });
    it('handleMapInfoMarker hide when layer is present', done => {
        testEpic(handleMapInfoMarker, 1, featureInfoClick("POINT", "LAYER"), ([ a ]) => {
            expect(a.type).toBe(HIDE_MAPINFO_MARKER);
            done();
        }, {});
    });
    it('test center to visible area', (done) => {
        // remove previous hook
        registerHook('RESOLUTION_HOOK', undefined);

        const state = {
            mapInfo: {
                centerToMarker: true
            },
            map: TEST_MAP_STATE,
            maplayout: {
                boundingMapRect: {
                    left: 500,
                    bottom: 250
                }
            }
        };

        const sentActions = [featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } }), loadFeatureInfo()];

        const expectedAction = actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                    case ZOOM_TO_POINT:
                        expect(action.zoom).toBe(4);
                        expect({ x: parseFloat(action.pos.x.toFixed(2)), y: parseFloat(action.pos.y.toFixed(2)) }).toEqual({ x: -101.81, y: 27.68 });
                        expect(action.crs).toBe('EPSG:4326');
                        break;
                    case UPDATE_CENTER_TO_MARKER:
                        expect(action.status).toBe('enabled');
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        };

        testEpic(zoomToVisibleAreaEpic, 2, sentActions, expectedAction, state);
    });

    it('test no center to visible area', (done) => {

        // remove previous hook
        registerHook('RESOLUTION_HOOK', undefined);

        const state = {
            mapInfo: {
                centerToMarker: true
            },
            map: TEST_MAP_STATE,
            maplayout: {
                boundingMapRect: {
                    left: 0,
                    bottom: 0
                }
            }
        };

        const sentActions = [featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } }), loadFeatureInfo()];

        const expectedAction = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case UPDATE_CENTER_TO_MARKER:
                        expect(action.status).toBe('disabled');
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        };

        testEpic(zoomToVisibleAreaEpic, 1, sentActions, expectedAction, state);
    });
    it('onMapClick triggers featureinfo when selected', done => {
        testEpic(onMapClick, 1, [clickOnMap()], ([action]) => {
            expect(action.type === FEATURE_INFO_CLICK);
            done();
        }, {
                mapInfo: {
                    enabled: true,
                    disableAlwaysOn: false
                }
            });
    });
    it('onMapClick do not trigger when mapinfo is not elabled', done => {
        testEpic(addTimeoutEpic(onMapClick, 10), 1, [clickOnMap()], ([action]) => {
            if (action.type === TEST_TIMEOUT) {
                done();
            }
        }, {
                mapInfo: {
                    enabled: false,
                    disableAlwaysOn: false
                }
            });
    });
    it('closeFeatureAndAnnotationEditing closes annotations', (done) => {

        const sentActions = closeIdentify();

        const expectedAction = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case CLOSE_ANNOTATIONS:
                        done();
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
        };

        testEpic(closeFeatureAndAnnotationEditing, 1, sentActions, expectedAction, { annotations: { editing: true } });
    });
    it('closeFeatureAndAnnotationEditing purges mapinfo results', (done) => {

        const sentActions = closeIdentify();

        const expectedAction = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case PURGE_MAPINFO_RESULTS:
                        done();
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
        };

        testEpic(closeFeatureAndAnnotationEditing, 1, sentActions, expectedAction);
    });

});
