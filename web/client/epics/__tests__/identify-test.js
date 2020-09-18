/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { LOCATION_CHANGE } = require('connected-react-router');
const { ZOOM_TO_POINT, clickOnMap, CHANGE_MAP_VIEW, UNREGISTER_EVENT_LISTENER, REGISTER_EVENT_LISTENER} = require('../../actions/map');
const { FEATURE_INFO_CLICK, UPDATE_CENTER_TO_MARKER, PURGE_MAPINFO_RESULTS, NEW_MAPINFO_REQUEST, LOAD_FEATURE_INFO, NO_QUERYABLE_LAYERS, ERROR_FEATURE_INFO, EXCEPTIONS_FEATURE_INFO, SHOW_MAPINFO_MARKER, HIDE_MAPINFO_MARKER, GET_VECTOR_INFO, SET_CURRENT_EDIT_FEATURE_QUERY, loadFeatureInfo, featureInfoClick, closeIdentify, toggleHighlightFeature, editLayerFeatures, updateFeatureInfoClickPoint, purgeMapInfoResults } = require('../../actions/mapInfo');
const { REMOVE_MAP_POPUP } = require('../../actions/mapPopups');
const { TEXT_SEARCH_CANCEL_ITEM } = require('../../actions/search');
const {
    getFeatureInfoOnFeatureInfoClick,
    zoomToVisibleAreaEpic,
    onMapClick,
    closeFeatureAndAnnotationEditing,
    handleMapInfoMarker,
    featureInfoClickOnHighligh,
    closeFeatureInfoOnCatalogOpenEpic,
    identifyEditLayerFeaturesEpic,
    hideMarkerOnIdentifyClose,
    onUpdateFeatureInfoClickPoint,
    removePopupOnLocationChangeEpic,
    removePopupOnUnregister,
    setMapTriggerEpic
} = require('../identify').default;
const { CLOSE_ANNOTATIONS } = require('../../actions/annotations');
const { testEpic, TEST_TIMEOUT, addTimeoutEpic } = require('./epicTestUtils');
const { registerHook, GET_COORDINATES_FROM_PIXEL_HOOK, GET_PIXEL_FROM_COORDINATES_HOOK } = require('../../utils/MapUtils');
const { setControlProperties } = require('../../actions/controls');
const { BROWSE_DATA } = require('../../actions/layers');
const { configureMap } = require('../../actions/config');

const TEST_MAP_STATE = {
    present: {
        size: {
            width: 1581,
            height: 946
        },
        center: { crs: "EPSG:4326", x: "17", y: "40"},
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
                    title: "TITLE",
                    type: "wms",
                    visibility: true,
                    url: 'base/web/client/test-resources/featureInfo-response.json'
                },
                {
                    id: "TEST2",
                    name: "TEST2",
                    title: "TITLE2",
                    type: "wms",
                    visibility: true,
                    url: 'base/web/client/test-resources/featureInfo-response.json'
                }]
            }
        };
        const sentActions = [featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } })];
        const NUM_ACTIONS = 5;
        testEpic(getFeatureInfoOnFeatureInfoClick, NUM_ACTIONS, sentActions, (actions) => {
            try {
                expect(actions.length).toBe(5);
                const [a0, a1, a2, a3, a4] = actions;
                expect(a0).toExist();
                expect(a0.type).toBe(PURGE_MAPINFO_RESULTS);
                expect(a1).toExist();
                expect(a1.type).toBe(NEW_MAPINFO_REQUEST);
                expect(a1.reqId).toExist();
                expect(a1.request).toExist();
                expect(a2).toExist();
                expect(a2.type).toBe(NEW_MAPINFO_REQUEST);
                expect(a2.reqId).toExist();
                expect(a2.request).toExist();
                expect(a3).toExist();
                expect(a3.type).toBe(LOAD_FEATURE_INFO);
                expect(a3.data).toExist();
                expect(a3.requestParams).toExist();
                expect(a3.reqId).toExist();
                expect(a3.layerMetadata.title).toBe(state.layers.flat[a3.requestParams.id === "TEST" ? 0 : 1].title);
                expect(a4).toExist();
                expect(a4.layerMetadata.title).toBe(state.layers.flat[a4.requestParams.id === "TEST" ? 0 : 1].title);
                done();
            } catch (ex) {
                done(ex);
            }
        }, state);
    });
    it('getFeatureInfoOnFeatureInfoClick WMS with filteredList and override params', (done) => {
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
                    name: "TEST",
                    "title": "TITLE",
                    type: "wms",
                    visibility: true,
                    url: 'base/web/client/test-resources/featureInfo-response.json'
                },
                {
                    id: "TEST2",
                    name: "TEST2",
                    "title": "TITLE2",
                    type: "wms",
                    visibility: true,
                    url: 'base/web/client/test-resources/featureInfo-response.json'
                }]
            }
        };
        const sentActions = [featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } }, "TEST", ["TEST"], {"TEST": {cql_filter: "id>1"}}, "province_view.5")];
        testEpic(getFeatureInfoOnFeatureInfoClick, 3, sentActions, ([a0, a1, a2]) => {
            try {
                expect(a0).toExist();
                expect(a0.type).toBe(PURGE_MAPINFO_RESULTS);
                expect(a1).toExist();
                expect(a1.type).toBe(NEW_MAPINFO_REQUEST);
                expect(a1.reqId).toExist();
                expect(a1.request).toExist();
                expect(a1.request.cql_filter).toExist();
                expect(a1.request.cql_filter).toBe("id>1");
                expect(a2).toExist();
                expect(a2.type).toBe(LOAD_FEATURE_INFO);
                expect(a2.data).toExist();
                expect(a2.data.features).toExist();
                expect(a2.data.features.length).toBe(1);
                expect(a2.requestParams).toExist();
                expect(a2.reqId).toExist();
                expect(a2.layerMetadata.title).toBe(state.layers.flat[0].title);
                done();
            } catch (ex) {
                done(ex);
            }
        }, {...state, mapInfo: {
            ...state.mapInfo,
            itemId: "province_view.5"
        }});
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
                expect(a1.request.cql_filter).toNotExist();
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
                expect(a1.type).toBe(GET_VECTOR_INFO);
                expect(a2.type).toBe(NEW_MAPINFO_REQUEST);
                expect(a2.reqId).toExist();
                expect(a2.request).toExist();
                expect(a3).toExist();
                expect(a3.type).toBe(LOAD_FEATURE_INFO);
                done();
            } catch (ex) {
                done(ex);
            }
        }, state);
    });
    it('getFeatureInfoOnFeatureInfoClick with highlight', (done) => {
        // remove previous hook
        registerHook('RESOLUTION_HOOK', undefined);
        const state = {
            map: TEST_MAP_STATE,
            mapInfo: {
                clickPoint: { latlng: { lat: 36.95, lng: -79.84 } },
                highlight: true
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

    it('test zoomToVisibleAreaEpic reset map to initial position on close identify', (done) => {
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

        const sentActions = [
            featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 } }),
            loadFeatureInfo(),
            closeIdentify()
        ];

        const expectedAction = actions => {
            try {
                expect(actions.length).toBe(3);
                actions.map((action) => {
                    switch (action.type) {
                    case ZOOM_TO_POINT:
                        done();
                        break;
                    case UPDATE_CENTER_TO_MARKER:
                        expect(action.status).toBe('enabled');
                        break;
                    case CHANGE_MAP_VIEW:
                        expect(action.zoom).toBe(4);
                        expect(action.bbox).toBe(null);
                        expect(action.size).toEqual({"width": 1581, "height": 946});
                        expect(action.mapStateSource).toBe(null);
                        expect(action.projection).toBe("EPSG:3857");
                        expect(action.center).toEqual({ crs: "EPSG:4326", x: "17", y: "40"});
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
            } catch (ex) {
                done(ex);
            }
            done();
        };

        testEpic(zoomToVisibleAreaEpic,  3, sentActions, expectedAction, state);
    });

    it('onMapClick triggers featureinfo when selected', done => {
        registerHook(GET_COORDINATES_FROM_PIXEL_HOOK, undefined);
        registerHook(GET_PIXEL_FROM_COORDINATES_HOOK, undefined);
        const NUM_ACTIONS = 2;
        testEpic(onMapClick, NUM_ACTIONS, [clickOnMap({latlng: {lat: 8, lng: 8}})], (actions) => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toEqual(FEATURE_INFO_CLICK);
            expect(actions[1].type).toEqual(TEXT_SEARCH_CANCEL_ITEM);
            done();
        }, {
            mapInfo: {
                enabled: true,
                disableAlwaysOn: false
            },
            map: {
                present: {
                    projection: 'EPSG:3857'
                }
            }
        });
    });

    it('onMapClick do not trigger when mapinfo is not enabled', done => {
        registerHook(GET_COORDINATES_FROM_PIXEL_HOOK, undefined);
        registerHook(GET_PIXEL_FROM_COORDINATES_HOOK, undefined);
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
    it('onMapClick do not trigger when Indentify is not in context', done => {
        testEpic(addTimeoutEpic(onMapClick, 10), 1, [clickOnMap()], ([action]) => {
            if (action.type === TEST_TIMEOUT) {
                done();
            }
        }, {
            mapInfo: {
                enabled: true,
                disableAlwaysOn: false
            },
            context: {
                currentContext: {
                    plugins: {
                        desktop: []
                    }
                }
            }
        });
    });
    it('onMapClick trigger when mapinfo is not enabled', done => {
        testEpic(onMapClick, 1, [clickOnMap({latlng: {lat: 8, lng: 8}})], ([action]) => {
            if (action.type === FEATURE_INFO_CLICK) {
                done();
            }
        }, {
            mapInfo: {
                enabled: true,
                disableAlwaysOn: false
            },
            context: {
                currentContext: {
                    plugins: {
                        desktop: [{name: "Identify"}]
                    }
                }
            },
            map: {
                present: {
                    projection: 'EPSG:3857'
                }
            }
        });

    });
    it('onMapClick generates geometricFilter', done => {
        const cleanUp = () => {
            registerHook(GET_COORDINATES_FROM_PIXEL_HOOK, undefined);
            registerHook(GET_PIXEL_FROM_COORDINATES_HOOK, undefined);
        };
        registerHook(GET_COORDINATES_FROM_PIXEL_HOOK, ([x, y]) => {
            expect(x).toBe(0);
            expect(y).toBe(5); // 5 is the radius
            return [0, 5];

        });
        registerHook(GET_PIXEL_FROM_COORDINATES_HOOK, () => {
            return [0, 0];
        });

        testEpic(onMapClick, 1, [clickOnMap({ latlng: { lat: 0, lng: 0 } })], ([action]) => {
            if (action.type === FEATURE_INFO_CLICK) {
                expect(action.point).toBeTruthy();
                expect(action.point.geometricFilter).toBeTruthy();
                const geometry = action.point.geometricFilter.value.geometry;
                // due to mock data coordinates of the extent should be ,ore or less -5 + 5, not check the coordinates of the circle to avoid float issues with test
                expect(Math.round(geometry.extent[0])).toEqual(-5);
                expect(Math.round(geometry.extent[1])).toEqual(-5);
                expect(Math.round(geometry.extent[2])).toEqual(5);
                expect(Math.round(geometry.extent[3])).toEqual(5);
                cleanUp();
                done();
            }
        }, {
            mapInfo: {
                enabled: true,
                disableAlwaysOn: false
            },
            context: {
                currentContext: {
                    plugins: {
                        desktop: [{ name: "Identify" }]
                    }
                }
            },
            map: {
                present: {
                    projection: 'EPSG:3857'
                }
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

    it('featureInfoClickOnHighligh with layer', (done) => {
        const sentActions = toggleHighlightFeature(true);
        const NUM_ACTIONS = 2;
        const expectedAction = actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case FEATURE_INFO_CLICK:
                    expect(action.point).toEqual({latlng: {lng: -110.05255, lat: 46.67685}});
                    break;
                case SHOW_MAPINFO_MARKER:
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        };

        testEpic(featureInfoClickOnHighligh, NUM_ACTIONS, sentActions, expectedAction, {
            mapInfo: {
                clickPoint: {
                    "latlng": {
                        lng: -110.05255,
                        lat: 46.67685
                    }
                },
                clickLayer: "gs:us_states"
            }
        });
    });

    it('enable metadataexplorer control is enabled', (done) => {
        const state = {controls: {}};
        const NUMBER_OF_ACTIONS = 2;
        const callback = actions => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            expect(actions[0].type).toEqual(PURGE_MAPINFO_RESULTS);
            expect(actions[1].type).toEqual(HIDE_MAPINFO_MARKER);
            done();
        };
        testEpic(
            closeFeatureInfoOnCatalogOpenEpic,
            NUMBER_OF_ACTIONS,
            setControlProperties('metadataexplorer', "enabled", true),
            callback,
            state
        );
    });

    it('disable metadataexplorer should not affect mapinfo', (done) => {
        const state = {controls: {}};
        const NUMBER_OF_ACTIONS = 1;
        const callback = actions => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            done();
        };
        testEpic(
            addTimeoutEpic(closeFeatureInfoOnCatalogOpenEpic),
            NUMBER_OF_ACTIONS,
            setControlProperties('metadataexplorer', "enabled", false),
            callback,
            state);
    });

    it('identifyEditLayerFeaturesEpic', (done) => {
        const startActions = [editLayerFeatures({id: 'layer'})];
        testEpic(identifyEditLayerFeaturesEpic, 2, startActions, actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_CURRENT_EDIT_FEATURE_QUERY);
            expect(actions[0].query).toEqual({type: 'geometry'});
            expect(actions[1].type).toBe(BROWSE_DATA);
        }, {
            mapInfo: {
                clickPoint: {
                    geometricFilter: {
                        type: 'geometry'
                    }
                }
            },
            map: {
                present: {
                    projection: 'EPSG:3857'
                }
            }
        }, done);
    });

    it('hideMapMarkerOnIdentifyClose', (done) => {
        const startActions = [closeIdentify()];
        testEpic(hideMarkerOnIdentifyClose, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(HIDE_MAPINFO_MARKER);
        }, {}, done);
    });
    it('onUpdateFeatureInfoClickPoint', done => {
        const cleanUp = () => {
            registerHook(GET_COORDINATES_FROM_PIXEL_HOOK, undefined);
            registerHook(GET_PIXEL_FROM_COORDINATES_HOOK, undefined);
        };
        registerHook(GET_COORDINATES_FROM_PIXEL_HOOK, ([x, y]) => {
            expect(x).toBe(0);
            expect(y).toBe(5);
            return [0, 5];

        });
        registerHook(GET_PIXEL_FROM_COORDINATES_HOOK, ([x, y]) => {
            expect(x).toBe(0);
            expect(y).toBe(0);
            return [0, 0];
        });
        const LAYER_NAME = "This is one sample additional argument of featureInfoClick that have to be replicated";
        const PROJECTION = 'EPSG:4326';
        testEpic(onUpdateFeatureInfoClickPoint, 1, [
            featureInfoClick({ latlng: { lat: 36.95, lng: -79.84 }}, LAYER_NAME),
            updateFeatureInfoClickPoint({latlng: {lat: 0, lng: 0}})
        ], ([{point, layer}]) => {
            expect(point.latlng.lat).toEqual(0);
            expect(point.latlng.lng).toEqual(0);
            expect(point.geometricFilter.type).toEqual('geometry');
            expect(point.geometricFilter.value.operation).toEqual("INTERSECTS");
            expect(point.geometricFilter.value.geometry.center).toEqual([0, 0]); // some checks to verify that a circle is created
            expect(point.geometricFilter.value.geometry.projection).toEqual(PROJECTION); // some checks to verify that a circle is created
            expect(point.geometricFilter.value.geometry.extent).toEqual([-5, -5, 5, 5]); // not check the coordinate to avoid issue with float, but the extent should be this accordingly with the mock data
            expect(layer).toBe(LAYER_NAME);
            cleanUp();
            done();
        }, {
            map: {
                present: {
                    projection: PROJECTION
                }
            }
        });
    });
    describe("removePopupOnLocationChangeEpic", () => {
        it('removePopupOnLocationChangeEpic with purgeMapInfoResults as trigger', done => {
            const NUM_ACTIONS = 1;
            testEpic(addTimeoutEpic(removePopupOnLocationChangeEpic, 50), NUM_ACTIONS, purgeMapInfoResults(), (actions) => {
                expect(actions.length).toBe(1);
                const [{type}] = actions;
                expect(type).toBe(TEST_TIMEOUT);
                done();
            }, {});
        });
        it('checks that all works with some popups with purgeMapInfoResults as trigger', done => {
            const NUM_ACTIONS = 1;
            testEpic(removePopupOnLocationChangeEpic, NUM_ACTIONS, purgeMapInfoResults(), (actions) => {
                expect(actions.length).toBe(1);
                const [{id, type}] = actions;
                expect(type).toBe(REMOVE_MAP_POPUP);
                expect(id).toBe("id");
                done();
            }, {
                mapPopups: {
                    popups: [{id: "id"}]
                }
            });
        });
        it('removePopupOnLocationChangeEpic with LOCATION_CHANGE as trigger', done => {
            const NUM_ACTIONS = 1;
            testEpic(addTimeoutEpic(removePopupOnLocationChangeEpic, 50), NUM_ACTIONS, {type: LOCATION_CHANGE}, (actions) => {
                expect(actions.length).toBe(1);
                const [{type}] = actions;
                expect(type).toBe(TEST_TIMEOUT);
                done();
            }, {});
        });
        it('checks that all works with some popups with LOCATION_CHANGE as trigger', done => {
            const NUM_ACTIONS = 1;
            testEpic(removePopupOnLocationChangeEpic, NUM_ACTIONS, {type: LOCATION_CHANGE}, (actions) => {
                expect(actions.length).toBe(1);
                const [{id, type}] = actions;
                expect(type).toBe(REMOVE_MAP_POPUP);
                expect(id).toBe("id");
                done();
            }, {
                mapPopups: {
                    popups: [{id: "id"}]
                }
            });
        });
    });
    describe("removePopupOnUnregister", () => {
        it('checks that all works with no popups', done => {
            const NUM_ACTIONS = 1;
            testEpic(addTimeoutEpic(removePopupOnUnregister, 50), NUM_ACTIONS, {type: UNREGISTER_EVENT_LISTENER}, (actions) => {
                expect(actions.length).toBe(1);
                const [{type}] = actions;
                expect(type).toBe(TEST_TIMEOUT);
                done();
            }, {});
        });
        it('checks that all works with some popups', done => {
            const NUM_ACTIONS = 1;
            testEpic(removePopupOnUnregister, NUM_ACTIONS, {type: UNREGISTER_EVENT_LISTENER}, (actions) => {
                expect(actions.length).toBe(1);
                const [{id, type}] = actions;
                expect(type).toBe(REMOVE_MAP_POPUP);
                expect(id).toBe("id");
                done();
            }, {
                mapPopups: {
                    popups: [{id: "id"}]
                }
            });
        });
    });
    describe('setMapTriggerEpic', () => {
        it('should register event if hover is trigger in mapInfo', (done) => {
            const epicResponse = actions => {
                expect(actions[0].type).toBe(REGISTER_EVENT_LISTENER);
                done();
            };
            testEpic(setMapTriggerEpic, 1, configureMap(), epicResponse, {mapInfo: {configuration: {trigger: 'hover'}}});
        });
        it('should unregister event if no mapInfo or no trigger is present in mapInfo', (done) => {
            const epicResponse = actions => {
                expect(actions[0].type).toBe(UNREGISTER_EVENT_LISTENER);
                done();
            };
            testEpic(setMapTriggerEpic, 1, configureMap(), epicResponse, {});
        });
    });
});
