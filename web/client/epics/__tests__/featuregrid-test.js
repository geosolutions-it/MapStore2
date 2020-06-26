/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const assign = require('object-assign');

const { set } = require('../../utils/ImmutableUtils');


const CoordinatesUtils = require('../../utils/CoordinatesUtils');
const { hideMapinfoMarker, featureInfoClick, HIDE_MAPINFO_MARKER} = require('../../actions/mapInfo');
const { createQuery } = require('../../actions/wfsquery');

const {
    toggleEditMode,
    toggleViewMode,
    openFeatureGrid,
    OPEN_FEATURE_GRID,
    SET_LAYER,
    DELETE_GEOMETRY_FEATURE,
    deleteGeometry,
    createNewFeatures,
    CLOSE_FEATURE_GRID,
    TOGGLE_MODE,
    MODES,
    closeFeatureGridConfirm,
    clearChangeConfirmed,
    CLEAR_CHANGES,
    TOGGLE_TOOL,
    closeFeatureGridConfirmed,
    zoomAll,
    START_SYNC_WMS,
    STOP_SYNC_WMS,
    startDrawingFeature,
    startEditingFeature,
    closeFeatureGrid,
    GEOMETRY_CHANGED,
    openAdvancedSearch,
    moreFeatures,
    GRID_QUERY_RESULT,
    changePage,
    sort,
    setTimeSync,
    updateFilter,
    UPDATE_FILTER,
    activateTemporaryChanges,
    DISABLE_TOOLBAR,
    DEACTIVATE_GEOMETRY_FILTER
} = require('../../actions/featuregrid');
const {SET_HIGHLIGHT_FEATURES_PATH} = require('../../actions/highlight');
const {CHANGE_DRAWING_STATUS} = require('../../actions/draw');
const {SHOW_NOTIFICATION} = require('../../actions/notifications');
const {RESET_CONTROLS, SET_CONTROL_PROPERTY, toggleControl} = require('../../actions/controls');
const {ZOOM_TO_EXTENT, clickOnMap} = require('../../actions/map');
const { CLOSE_IDENTIFY } = require('../../actions/mapInfo');
const {CHANGE_LAYER_PROPERTIES, changeLayerParams, browseData} = require('../../actions/layers');
const {geometryChanged} = require('../../actions/draw');
const { TOGGLE_CONTROL } = require('../../actions/controls');

const {
    toggleSyncWms, QUERY, querySearchResponse, query, QUERY_CREATE, FEATURE_TYPE_SELECTED,
    layerSelectedForSearch, UPDATE_QUERY} = require('../../actions/wfsquery');
const { LOAD_FILTER, QUERY_FORM_RESET} = require('../../actions/queryform');

const {
    featureGridBrowseData,
    setHighlightFeaturesPath,
    triggerDrawSupportOnSelectionChange,
    featureGridLayerSelectionInitialization,
    closeRightPanelOnFeatureGridOpen,
    deleteGeometryFeature,
    onFeatureGridCreateNewFeature,
    resetGridOnLocationChange,
    resetQueryPanel,
    autoCloseFeatureGridEpicOnDrowerOpen,
    askChangesConfirmOnFeatureGridClose,
    onClearChangeConfirmedFeatureGrid,
    onCloseFeatureGridConfirmed,
    onFeatureGridZoomAll,
    resetControlsOnEnterInEditMode,
    closeIdentifyWhenOpenFeatureGrid,
    startSyncWmsFilter,
    stopSyncWmsFilter,
    handleDrawFeature,
    handleEditFeature,
    resetEditingOnFeatureGridClose,
    onFeatureGridGeometryEditing,
    syncMapWmsFilter,
    onOpenAdvancedSearch,
    virtualScrollLoadFeatures,
    removeWmsFilterOnGridClose,
    autoReopenFeatureGridOnFeatureInfoClose,
    featureGridChangePage,
    featureGridSort,
    replayOnTimeDimensionChange,
    hideFeatureGridOnDrawerOpenMobile,
    hideDrawerOnFeatureGridOpenMobile,
    handleClickOnMap,
    featureGridUpdateGeometryFilter,
    activateTemporaryChangesEpic
} = require('../featuregrid');
const { onLocationChanged } = require('connected-react-router');

const {TEST_TIMEOUT, testEpic, addTimeoutEpic} = require('./epicTestUtils');
const {isEmpty, isNil} = require('lodash');
const filterObj = {
    featureTypeName: 'TEST',
    groupFields: [
        {
            id: 1,
            logic: 'OR',
            index: 0
        }
    ],
    filterFields: [],
    spatialField: {
        method: 'BBOX',
        attribute: 'GEOMETRY',
        operation: 'INTERSECTS',
        geometry: {
            id: 'a45697d0-cab1-11e7-a45c-3d37963eccab',
            type: 'Polygon',
            extent: [
                978438.5673027613,
                5527214.592597753,
                994987.1839265019,
                5533558.865945422
            ],
            center: [
                986712.8756146316,
                5530386.729271587
            ],
            coordinates: [
                [
                    [
                        978438.5673027613,
                        5533558.865945422
                    ],
                    [
                        978438.5673027613,
                        5527214.592597753
                    ],
                    [
                        994987.1839265019,
                        5527214.592597753
                    ],
                    [
                        994987.1839265019,
                        5533558.865945422
                    ],
                    [
                        978438.5673027613,
                        5533558.865945422
                    ]
                ]
            ],
            style: {},
            projection: 'EPSG:900913'
        }
    },
    pagination: {
        startIndex: 0,
        maxFeatures: 20
    },
    filterType: 'OGC',
    ogcVersion: '1.1.0',
    sortOptions: null,
    hits: false
};
const features = [{
    type: 'Feature',
    id: 'polygons.1',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-39,
                    39
                ],
                [-39,
                    38
                ],
                [-40,
                    38
                ],
                [-39,
                    39
                ]
            ]
        ]
    },
    geometry_name: 'geometry',
    properties: {
        name: 'test'
    }
},
{
    type: 'Feature',
    id: 'polygons.2',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-48.77929687,
                    37.54457732
                ],
                [-49.43847656,
                    36.06686213
                ],
                [-46.31835937,
                    35.53222623
                ],
                [-44.47265625,
                    37.40507375
                ],
                [-48.77929687,
                    37.54457732
                ]
            ]
        ]
    },
    geometry_name: 'geometry',
    properties: {
        name: 'poly2'
    }
},
{
    type: 'Feature',
    id: 'polygons.6',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-50.16357422,
                    28.90239723
                ],
                [-49.69116211,
                    28.24632797
                ],
                [-48.2409668,
                    28.56522549
                ],
                [-50.16357422,
                    28.90239723
                ]
            ]
        ]
    },
    geometry_name: 'geometry',
    properties: {
        name: 'ads'
    }
},
{
    type: 'Feature',
    id: 'polygons.7',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-64.46777344,
                    33.90689555
                ],
                [-66.22558594,
                    31.95216224
                ],
                [-63.32519531,
                    30.97760909
                ],
                [-64.46777344,
                    33.90689555
                ]
            ]
        ]
    },
    geometry_name: 'geometry',
    properties: {
        name: 'vvvv'
    }
}
];
const gmlFeatures = [{
    type: 'Feature',
    id: 'polygons.1',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-39,
                    39
                ],
                [-39,
                    38
                ],
                [-40,
                    38
                ],
                [-39,
                    39
                ]
            ]
        ]
    },
    geometry_name: 'geometry',
    properties: {
        name: 'test'
    }
},
{
    type: 'Feature',
    id: 'polygons.2',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-48.77929687,
                    37.54457732
                ],
                [-49.43847656,
                    36.06686213
                ],
                [-46.31835937,
                    35.53222623
                ],
                [-44.47265625,
                    37.40507375
                ],
                [-48.77929687,
                    37.54457732
                ]
            ]
        ]
    },
    geometry_name: 'geometry',
    properties: {
        name: 'poly2'
    }
},
{
    type: 'Feature',
    id: 'polygons.6',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-50.16357422,
                    28.90239723
                ],
                [-49.69116211,
                    28.24632797
                ],
                [-48.2409668,
                    28.56522549
                ],
                [-50.16357422,
                    28.90239723
                ]
            ]
        ]
    },
    geometry_name: 'geometry',
    properties: {
        name: 'ads'
    }
},
{
    type: 'Feature',
    id: 'polygons.7',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-64.46777344,
                    33.90689555
                ],
                [-66.22558594,
                    31.95216224
                ],
                [-63.32519531,
                    30.97760909
                ],
                [-64.46777344,
                    33.90689555
                ]
            ]
        ]
    },
    geometry_name: 'geometry',
    properties: {
        name: 'vvvv'
    }
}
];

const state = {
    query: {
        featureTypes: {
            'editing:polygons': {
                geometry: [{
                    label: 'geometry',
                    attribute: 'geometry',
                    type: 'geometry',
                    valueId: 'id',
                    valueLabel: 'name',
                    values: []
                }],
                original: {
                    elementFormDefault: 'qualified',
                    targetNamespace: 'http://geoserver.org/editing',
                    targetPrefix: 'editing',
                    featureTypes: [{
                        typeName: 'polygons',
                        properties: [{
                            name: 'name',
                            maxOccurs: 1,
                            minOccurs: 0,
                            nillable: true,
                            type: 'xsd:string',
                            localType: 'string'
                        },
                        {
                            name: 'geometry',
                            maxOccurs: 1,
                            minOccurs: 0,
                            nillable: true,
                            type: 'gml:Polygon',
                            localType: 'Polygon'
                        }
                        ]
                    }]
                },
                attributes: [{
                    label: 'name',
                    attribute: 'name',
                    type: 'string',
                    valueId: 'id',
                    valueLabel: 'name',
                    values: []
                }]
            }
        },
        data: {},
        result: {
            type: 'FeatureCollection',
            totalFeatures: 4,
            features,
            crs: {
                type: 'name',
                properties: {
                    name: 'urn:ogc:def:crs:EPSG::4326'
                }
            }
        },
        resultError: null,
        isNew: false,
        filterObj: {
            featureTypeName: 'editing:polygons',
            groupFields: [{
                id: 1,
                logic: 'OR',
                index: 0
            }],
            filterFields: [],
            spatialField: {...filterObj.spatialField},
            pagination: {
                startIndex: 0,
                maxFeatures: 20
            },
            filterType: 'OGC',
            ogcVersion: '1.1.0',
            sortOptions: null,
            hits: false
        },
        searchUrl: 'http://localhost:8081/geoserver/wfs?',
        typeName: 'editing:polygons',
        url: 'http://localhost:8081/geoserver/wfs?',
        featureLoading: false
    },
    layers: {
        flat: [{
            id: "TEST_LAYER",
            title: "Test Layer",
            filterObj,
            nativeCrs: "EPSG:4326"
        }]
    },
    highlight: {
        featuresPath: "featuregrid.select"
    }
};

const stateWithGmlGeometry = {
    query: {
        featureTypes: {
            'editing:polygons': {
                geometry: [{
                    label: 'geometry',
                    attribute: 'geometry',
                    type: 'geometry',
                    valueId: 'id',
                    valueLabel: 'name',
                    values: []
                }],
                original: {
                    elementFormDefault: 'qualified',
                    targetNamespace: 'http://geoserver.org/editing',
                    targetPrefix: 'editing',
                    featureTypes: [{
                        typeName: 'polygons',
                        properties: [{
                            name: 'name',
                            maxOccurs: 1,
                            minOccurs: 0,
                            nillable: true,
                            type: 'xsd:string',
                            localType: 'string'
                        },
                        {
                            name: 'geometry',
                            maxOccurs: 1,
                            minOccurs: 0,
                            nillable: true,
                            type: 'gml:Geometry',
                            localType: 'Geometry'
                        }
                        ]
                    }]
                },
                attributes: [{
                    label: 'name',
                    attribute: 'name',
                    type: 'string',
                    valueId: 'id',
                    valueLabel: 'name',
                    values: []
                }]
            }
        },
        data: {},
        result: {
            type: 'FeatureCollection',
            totalFeatures: 4,
            gmlFeatures,
            crs: {
                type: 'name',
                properties: {
                    name: 'urn:ogc:def:crs:EPSG::4326'
                }
            }
        },
        resultError: null,
        isNew: false,
        filterObj: {
            featureTypeName: 'editing:polygons',
            groupFields: [{
                id: 1,
                logic: 'OR',
                index: 0
            }],
            filterFields: [],
            spatialField: {
                method: null,
                attribute: 'geometry',
                operation: 'INTERSECTS',
                geometry: null
            },
            pagination: {
                startIndex: 0,
                maxFeatures: 20
            },
            filterType: 'OGC',
            ogcVersion: '1.1.0',
            sortOptions: null,
            hits: false
        },
        searchUrl: 'http://localhost:8081/geoserver/wfs?',
        typeName: 'editing:polygons',
        url: 'http://localhost:8081/geoserver/wfs?',
        featureLoading: false
    },
    layers: {
        flat: [{
            id: "TEST_LAYER",
            title: "Test Layer"
        }]
    },
    highlight: {
        featuresPath: "featuregrid.select"
    }
};

describe('featuregrid Epics', () => {

    describe('featureGridBrowseData epic', () => {
        const LAYER = state.layers.flat[0];
        const checkInitActions = ([a1, a2, a3]) => {
            // close TOC
            expect(a1.type).toBe(SET_CONTROL_PROPERTY);
            expect(a1.control).toBe('drawer');
            expect(a1.property).toBe('enabled');
            expect(a1.value).toBe(false);
            // set feature grid layer
            expect(a2.type).toBe(SET_LAYER);
            expect(a2.id).toBe(LAYER.id);
            // open feature grid
            expect(a3.type).toBe(OPEN_FEATURE_GRID);
        };
        it('browseData action initializes featuregrid', done => {
            testEpic(featureGridBrowseData, 5, browseData(LAYER), ([ a1, a2, a3, a4, a5 ]) => {
                expect(a1.type).toBe(QUERY_FORM_RESET);
                checkInitActions([a2, a3, a4]);
                // sets the feature type selected for search
                expect(a5.type).toBe(FEATURE_TYPE_SELECTED);
                done();
            }, state);
        });
    });
    it('test startSyncWmsFilter', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST__6",
                mode: 'EDIT',
                select: [{id: 'polygons.1', _new: 'polygons._new'}],
                changes: []
            },
            layers: {
                flat: [{
                    id: "TEST__6",
                    name: "V_TEST",
                    title: "V_TEST",
                    filterObj,
                    url: "base/web/client/test-resources/wms/getCapabilitiesSingleLayer3044.xml"
                }]
            },
            query: {
                syncWmsFilter: true
            }
        };
        CoordinatesUtils.getProjUrl = () => "base/web/client/test-resources/wms/projDef_3044.txt";

        const newState = assign({}, state, stateFeaturegrid);
        testEpic(startSyncWmsFilter, 1, toggleSyncWms(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case START_SYNC_WMS:
                    expect(action.type).toBe(START_SYNC_WMS);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });

    it('set highlight feature path with geometry not supported EDIT MODE', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            actions.map((action) => {
                switch (action.type) {
                case SET_HIGHLIGHT_FEATURES_PATH:
                    expect(action.featuresPath).toBe('featuregrid.select');
                    break;
                case CHANGE_DRAWING_STATUS:
                    expect(action.status).toBe("clean");
                    expect(action.method).toBe("");
                    expect(action.features).toEqual([]);
                    expect(action.options).toEqual({});
                    expect(action.style).toBe(undefined);
                    break;
                case SHOW_NOTIFICATION:
                    expect(action.uid).toBe("notSupportedGeometryWarning");
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        };

        testEpic(setHighlightFeaturesPath, 3, toggleEditMode(), epicResult, stateWithGmlGeometry);
    });

    it('set highlight feature path VIEW MODE', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(2);
                actions.map((action) => {
                    switch (action.type) {
                    case SET_HIGHLIGHT_FEATURES_PATH:
                        expect(action.featuresPath).toBe('featuregrid.select');
                        break;
                    case CHANGE_DRAWING_STATUS:
                        expect(action.status).toBe("clean");
                        expect(action.method).toBe("");
                        expect(action.features).toEqual([]);
                        expect(action.options).toEqual({});
                        expect(action.style).toBe(undefined);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
            } catch (e) {
                done(e);
            }
            done();
        };

        testEpic(setHighlightFeaturesPath, 2, toggleViewMode(), epicResult, state);
    });

    it('set highlight feature path EDIT MODE', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    switch (action.type) {
                    case SET_HIGHLIGHT_FEATURES_PATH:
                        expect(action.featuresPath).toBe(undefined);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        testEpic(setHighlightFeaturesPath, 1, toggleEditMode(), epicResult, state);
    });

    it('trigger draw support on selection change', (done) => {

        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: 'EDIT',
                select: [],
                changes: [],
                features
            }
        };

        const newState = assign({}, state, stateFeaturegrid);
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    switch (action.type) {
                    case CHANGE_DRAWING_STATUS:
                        expect(action.status).toBe("clean");
                        expect(action.method).toBe("");
                        expect(action.features).toEqual([]);
                        expect(action.options).toEqual({});
                        expect(action.style).toBe(undefined);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        testEpic(triggerDrawSupportOnSelectionChange, 1, toggleEditMode(), epicResult, newState);
    });

    it('trigger draw support on selection change with not supported geometry', (done) => {

        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: 'EDIT',
                select: [],
                changes: []
            }
        };

        const newState = assign({}, stateWithGmlGeometry, stateFeaturegrid);

        testEpic(addTimeoutEpic(triggerDrawSupportOnSelectionChange, 50), 1, toggleEditMode(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
        }, newState);
    });

    it('test featureGridLayerSelectionInitialization', (done) => {
        testEpic(featureGridLayerSelectionInitialization, 1, layerSelectedForSearch('layer001'), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SET_LAYER:
                    expect(action.id).toBe('layer001');
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });

    it('test closeRightPanelOnFeatureGridOpen', (done) => {
        testEpic(closeRightPanelOnFeatureGridOpen, 3, openFeatureGrid(), actions => {
            expect(actions.length).toBe(3);
            actions.map((action, i) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY: {
                    switch (i) {
                    case 0: {
                        expect(action.control).toBe('metadataexplorer');
                        expect(action.property).toBe('enabled');
                        expect(action.value).toBe(false);
                        expect(action.toggle).toBe(undefined);
                        break;
                    }
                    case 1: {
                        expect(action.control).toBe('annotations');
                        expect(action.property).toBe('enabled');
                        expect(action.value).toBe(false);
                        expect(action.toggle).toBe(undefined);
                        break;
                    }
                    case 2: {
                        expect(action.control).toBe('details');
                        expect(action.property).toBe('enabled');
                        expect(action.value).toBe(false);
                        expect(action.toggle).toBe(undefined);
                        break;
                    }
                    default: expect(true).toBe(false);
                    }
                    break;
                }
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });

    it('test deleteGeometryFeature', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: 'EDIT',
                select: [{id: 'select001'}],
                changes: []
            }
        };
        testEpic(deleteGeometryFeature, 2, deleteGeometry(), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case DELETE_GEOMETRY_FEATURE:
                    expect(action.features).toEqual([{id: 'select001'}]);

                    break;
                case CHANGE_DRAWING_STATUS:
                    expect(action.status).toBe("clean");
                    expect(action.method).toBe("");
                    expect(action.features).toEqual([]);
                    expect(action.options).toEqual({});
                    expect(action.style).toBe(undefined);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, stateFeaturegrid);
    });

    it('test onFeatureGridCreateNewFeature', (done) => {

        testEpic(onFeatureGridCreateNewFeature, 1, createNewFeatures(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case CHANGE_DRAWING_STATUS:
                    expect(action.status).toBe("clean");
                    expect(action.method).toBe("");
                    expect(action.features).toEqual([]);
                    expect(action.options).toEqual({});
                    expect(action.style).toBe(undefined);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });

    it('test resetGridOnLocationChange', (done) => {
        testEpic(resetGridOnLocationChange, 2, [openFeatureGrid(), onLocationChanged({})], actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case CLOSE_FEATURE_GRID:
                    expect(action.features).toBe(undefined);
                    break;
                case TOGGLE_MODE:
                    expect(action.mode).toBe(MODES.VIEW);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });

    it('test resetQueryPanel', (done) => {
        const newState = {
            controls: {
                queryPanel: {
                    enabled: true
                }
            }
        };
        testEpic(resetQueryPanel, 1, onLocationChanged({}), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY:
                    expect(action.control).toBe('queryPanel');
                    expect(action.property).toBe('enabled');
                    expect(action.value).toBe(false);
                    expect(action.toggle).toBe(undefined);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });

    it('test autoCloseFeatureGridEpicOnDrowerOpen', (done) => {
        const newState = {
            featuregrid: {
                open: true
            }
        };
        testEpic(autoCloseFeatureGridEpicOnDrowerOpen, 1, [openFeatureGrid(), toggleControl('drawer')], actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case CLOSE_FEATURE_GRID:
                    expect(action.type).toBe(CLOSE_FEATURE_GRID);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });

    it('test askChangesConfirmOnFeatureGridClose', (done) => {
        testEpic(askChangesConfirmOnFeatureGridClose, 1, closeFeatureGridConfirm(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case CLOSE_FEATURE_GRID:
                    expect(action.type).toBe(CLOSE_FEATURE_GRID);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });

    it('test onClearChangeConfirmedFeatureGrid', (done) => {
        testEpic(onClearChangeConfirmedFeatureGrid, 2, clearChangeConfirmed(), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case TOGGLE_TOOL:
                    expect(action.tool).toBe('clearConfirm');
                    expect(action.value).toBe(false);
                    break;
                case CLEAR_CHANGES:
                    expect(action.type).toBe(CLEAR_CHANGES);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });

    it('test onCloseFeatureGridConfirmed', (done) => {
        testEpic(onCloseFeatureGridConfirmed, 2, closeFeatureGridConfirmed(), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case TOGGLE_TOOL:
                    expect(action.tool).toBe('featureCloseConfirm');
                    expect(action.value).toBe(false);
                    break;
                case SET_CONTROL_PROPERTY:
                    expect(action.control).toBe('drawer');
                    expect(action.property).toBe('enabled');
                    expect(action.value).toBe(false);
                    expect(action.toggle).toBe(undefined);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });


    it('test onFeatureGridZoomAll', (done) => {
        testEpic(onFeatureGridZoomAll, 1, zoomAll(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case ZOOM_TO_EXTENT:
                    expect(action.extent).toEqual([-66.22558594, 28.24632797, -39, 39]);
                    expect(action.crs).toBe('EPSG:4326');
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {...state, featuregrid: {features}});
    });

    it('test resetControlsOnEnterInEditMode', (done) => {
        testEpic(resetControlsOnEnterInEditMode, 1, toggleEditMode(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case RESET_CONTROLS:
                    expect(action.skip).toEqual(['query']);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });

    it('test closeIdentifyWhenOpenFeatureGrid', (done) => {
        testEpic(closeIdentifyWhenOpenFeatureGrid, 1, openFeatureGrid(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case CLOSE_IDENTIFY:
                    expect(action.type).toBe(CLOSE_IDENTIFY);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });


    it('test stopSyncWmsFilter', (done) => {
        testEpic(stopSyncWmsFilter, 2, toggleSyncWms(), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case STOP_SYNC_WMS:
                    expect(action.type).toBe(STOP_SYNC_WMS);
                    break;
                case CHANGE_LAYER_PROPERTIES:
                    expect(action.layer).toBe('TEST_LAYER');
                    expect(action.newProperties).toEqual({filterObj: undefined});
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            featuregrid: {
                selectedLayer: 'TEST_LAYER'
            }
        });
    });

    it('test handleDrawFeature', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: 'EDIT',
                select: [{id: 'TEST_LAYER'}, {id: 'layer002'}],
                changes: []
            }
        };
        const newState = assign({}, state, stateFeaturegrid);
        testEpic(handleDrawFeature, 1, startDrawingFeature(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case CHANGE_DRAWING_STATUS:
                    expect(action.status).toBe("drawOrEdit");
                    expect(action.method).toBe("Polygon");
                    expect(action.owner).toBe("featureGrid");
                    expect(action.features).toEqual([{id: 'TEST_LAYER', type: 'Feature'}]);
                    expect(action.style).toBe(undefined);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });

    it('test handleEditFeature', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: 'EDIT',
                select: [{id: 'TEST_LAYER'}, {id: 'layer002'}],
                changes: []
            }
        };
        const newState = assign({}, state, stateFeaturegrid);
        testEpic(handleEditFeature, 1, startEditingFeature(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case CHANGE_DRAWING_STATUS:
                    expect(action.status).toBe("drawOrEdit");
                    expect(action.method).toBe("Polygon");
                    expect(action.owner).toBe("featureGrid");
                    expect(action.features).toEqual([{id: 'TEST_LAYER', type: 'Feature'}]);
                    expect(action.style).toBe(undefined);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });
    it('test resetEditingOnFeatureGridClose', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: 'EDIT',
                select: [{id: 'TEST_LAYER'}, {id: 'layer002'}],
                changes: []
            }
        };
        const newState = assign({}, state, stateFeaturegrid);

        testEpic(resetEditingOnFeatureGridClose, 1, [openFeatureGrid(), toggleEditMode(), closeFeatureGrid()], actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case CHANGE_DRAWING_STATUS:
                    expect(action.status).toBe("clean");
                    expect(action.method).toBe("");
                    expect(action.features).toEqual([]);
                    expect(action.options).toEqual({});
                    expect(action.style).toBe(undefined);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });

    it('test onFeatureGridGeometryEditing', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: 'EDIT',
                select: [{id: 'polygons.1', _new: 'polygons._new'}],
                changes: []
            }
        };
        const newState = assign({}, state, stateFeaturegrid);

        testEpic(onFeatureGridGeometryEditing, 1, [geometryChanged([{id: 'polygons.1', geometry: { type: 'Polygon', coordinates: [[[-180, 90], [180, 90], [180, -90], [-180, 90]]]}, geometry_name: 'geometry' }], 'featureGrid', '')], actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case GEOMETRY_CHANGED:
                    expect(action.features).toEqual([{
                        id: 'polygons.1',
                        type: 'Feature',
                        _new: 'polygons._new',
                        geometry: { type: 'Polygon', coordinates: [[[-180, 90], [180, 90], [180, -90], [-180, 90]]]},
                        geometry_name: 'geometry'
                    }]);

                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });

    it('test onFeatureGridGeometryEditing with', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: 'EDIT',
                select: [{id: 'polygons.1', _new: 'polygons._new'}],
                changes: []
            }
        };
        const newState = assign({}, state, stateFeaturegrid);

        testEpic(onFeatureGridGeometryEditing, 2, [geometryChanged([{id: 'polygons.1', geometry: { type: 'Polygon', coordinates: [[[-180, 90], [180, 90], [180, -90], [-180, 90]]]}, geometry_name: 'geometry' }], 'featureGrid', 'enterEditMode')], actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case GEOMETRY_CHANGED:
                    expect(action.features).toEqual([{
                        id: 'polygons.1',
                        type: 'Feature',
                        _new: 'polygons._new',
                        geometry: { type: 'Polygon', coordinates: [[[-180, 90], [180, 90], [180, -90], [-180, 90]]]},
                        geometry_name: 'geometry'
                    }]);
                    break;
                case CHANGE_DRAWING_STATUS:
                    expect(action.status).toBe("drawOrEdit");
                    expect(action.method).toBe("Polygon");
                    expect(action.owner).toBe("featureGrid");
                    expect(action.features).toEqual([{
                        id: 'polygons.1',
                        type: 'Feature',
                        _new: 'polygons._new',
                        geometry: { type: 'Polygon', coordinates: [[[-180, 90], [180, 90], [180, -90], [-180, 90]]]},
                        geometry_name: 'geometry'
                    }]);
                    expect(action.style).toBe(undefined);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });

    it('test syncMapWmsFilter with only: nativeCrs', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: 'EDIT',
                select: [{id: 'polygons.1', _new: 'polygons._new'}],
                changes: []
            },
            layers: {
                flat: [{
                    id: "TEST_LAYER",
                    title: "Test Layer",
                    nativeCrs: "EPSG:4326"
                }]
            },
            query: {
                filterObj: {}
            }
        };
        const newState = assign({}, state, stateFeaturegrid);

        testEpic(addTimeoutEpic(syncMapWmsFilter), 1, [{type: UPDATE_QUERY}, {type: START_SYNC_WMS}], actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case CHANGE_LAYER_PROPERTIES: {
                    expect(isEmpty(action.newProperties.filterObj)).toBeTruthy();
                    expect(isNil(action.newProperties.nativeCrs)).toBeTruthy();
                    break;
                }
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });


    it('test startSyncWmsFilter with nativeCrs present in layer props', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST__6",
                mode: 'EDIT',
                select: [{id: 'polygons.1', _new: 'polygons._new'}],
                changes: []
            },
            layers: {
                flat: [{
                    id: "TEST__6",
                    name: "V_TEST",
                    title: "V_TEST",
                    filterObj,
                    nativeCrs: "EPSG:3044",
                    url: "base/web/client/test-resources/wms/getCapabilitiesSingleLayer3044.xml"
                }]
            },
            query: {
                syncWmsFilter: true
            }
        };
        const newState = assign({}, state, stateFeaturegrid);
        testEpic(startSyncWmsFilter, 1, toggleSyncWms(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case START_SYNC_WMS:
                    expect(action.type).toBe(START_SYNC_WMS);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });


    it('test onOpenAdvancedSearch', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                // layer id with `.` and `:`
                selectedLayer: "TEST:A.LAYER__6",
                mode: 'EDIT',
                select: [{id: 'polygons.1', _new: 'polygons._new'}],
                changes: [],
                advancedFilters: {
                    "TEST:A.LAYER__6": {
                        "someFilter": "something"
                    }
                }
            },
            layers: {
                flat: [{
                    id: "TEST:A.LAYER__6",
                    name: "V_TEST",
                    title: "V_TEST",
                    filterObj,
                    url: "base/web/client/test-resources/wms/getCapabilitiesSingleLayer3044.xml"
                }]
            },
            query: {
                syncWmsFilter: true
            }
        };

        const newState = assign({}, state, stateFeaturegrid);
        testEpic(onOpenAdvancedSearch, 4, [openAdvancedSearch(), toggleControl('queryPanel', 'enabled')], actions => {

            expect(actions.length).toBe(4);
            actions.map((action) => {
                switch (action.type) {
                case LOAD_FILTER:
                    // load filter, if present
                    expect(action.filter).toExist();
                    break;
                case CHANGE_DRAWING_STATUS:
                    //  throw drawstatechange if drawStatus is not clean on queryPanel close
                    expect(action.status).toBe('clean');
                    break;
                default:
                    expect(true).toBe(true);
                }
            });
            done();
        }, newState);
    });

    it('test virtualScrollLoadFeatures to dispatch query action', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST__6",
                mode: 'EDIT',
                select: [{id: 'polygons.1', _new: 'polygons._new'}],
                changes: [],
                pages: [],
                pagination: {
                    size: 10
                },
                features: []
            }
        };

        const newState = assign({}, state, stateFeaturegrid);
        testEpic(virtualScrollLoadFeatures, 1, [moreFeatures({startPage: 0, endPage: 2})], actions => {

            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case QUERY:
                    expect(action.filterObj.pagination.startIndex).toBe(0);
                    expect(action.filterObj.pagination.maxFeatures).toBe(30);
                    break;
                default:
                    expect(true).toBe(true);
                }
            });
            done();
        }, newState);
    });
    it('test virtualScrollLoadFeatures to dispatch also viewparams', (done) => {
        const stateFeaturegrid = {
            layers: {
                flat: [{
                    id: "TEST__6",
                    title: "Test Layer",
                    name: 'editing:polygons',
                    params: {
                        viewParams: "a:b"
                    }
                }]
            },
            featuregrid: {
                open: true,
                selectedLayer: "TEST__6",
                mode: 'EDIT',
                select: [{ id: 'polygons.1', _new: 'polygons._new' }],
                changes: [],
                pages: [],
                pagination: {
                    size: 10
                },
                features: []
            }
        };

        const newState = assign({}, state, stateFeaturegrid);
        testEpic(virtualScrollLoadFeatures, 1, [moreFeatures({ startPage: 0, endPage: 2 })], actions => {

            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case QUERY:
                    expect(action.filterObj.pagination.startIndex).toBe(0);
                    expect(action.filterObj.pagination.maxFeatures).toBe(30);
                    expect(action.queryOptions.viewParams).toBe("a:b");
                    break;
                default:
                    expect(true).toBe(true);
                }
            });
            done();
        }, newState);
    });
    it('test virtualScrollLoadFeatures to emit GRID_QUERY_RESULT on query success', (done) => {
        const stateFeaturegrid = {
            featuregrid: {
                open: true,
                selectedLayer: "TEST__6",
                mode: 'EDIT',
                select: [{id: 'polygons.1', _new: 'polygons._new'}],
                changes: [],
                pages: [],
                pagination: {
                    size: 10

                },
                features: []
            }
        };
        const newState = assign({}, state, stateFeaturegrid);
        testEpic(virtualScrollLoadFeatures, 2, [moreFeatures({startPage: 0, endPage: 2}), querySearchResponse({features: Array(30)}, " ", {pagination: {startIndex: 0, maxFeatures: 30}})], actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY:
                    expect(action.filterObj.pagination.startIndex).toBe(0);
                    expect(action.filterObj.pagination.maxFeatures).toBe(30);
                    break;
                case GRID_QUERY_RESULT:
                    expect(action.features.length).toBe(30);
                    expect(action.pages.length).toBe(3);
                    expect(action.pages[0]).toBe(0);
                    expect(action.pages[1]).toBe(10);
                    expect(action.pages[2]).toBe(20);
                    break;
                default:
                    expect(true).toBe(true);
                }
            });
            done();
        }, newState);
    });

    it('removeWmsFilterOnGridClose', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                if (action.type === CHANGE_LAYER_PROPERTIES) {
                    expect(action.layer).toBe("TEST");
                    done();
                }
            });
        };

        testEpic(addTimeoutEpic(removeWmsFilterOnGridClose), 1, [openFeatureGrid(), closeFeatureGrid()], epicResult, {
            query: { syncWmsFilter: true},
            featuregrid: { selectedLayer: "TEST"}
        });
    });
    it('removeWmsFilterOnGridClose does not remove filter on featureinfo open', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                if (action.type === TEST_TIMEOUT) {
                    done();
                }
            });
        };
        testEpic(addTimeoutEpic(removeWmsFilterOnGridClose, 60), 1, [openFeatureGrid(), featureInfoClick(), closeFeatureGrid()], epicResult, {
            query: { syncWmsFilter: true },
            featuregrid: { selectedLayer: "TEST" }
        });
    });
    it('removeWmsFilterOnGridClose does not remove filter on advanced search open', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                if (action.type === TEST_TIMEOUT) {
                    done();
                }
            });
        };
        testEpic(addTimeoutEpic(removeWmsFilterOnGridClose, 60), 1, [openFeatureGrid(), openAdvancedSearch(), closeFeatureGrid()], epicResult, {
            query: { syncWmsFilter: true },
            featuregrid: { selectedLayer: "TEST" }
        });
    });
    it('autoReopenFeatureGridOnFeatureInfoClose', done => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                if (action.type === OPEN_FEATURE_GRID) {
                    done();
                }
            });
        };
        testEpic(autoReopenFeatureGridOnFeatureInfoClose, 1, [openFeatureGrid(), featureInfoClick(), hideMapinfoMarker(), closeFeatureGrid()], epicResult );
    });
    it('autoReopenFeatureGridOnFeatureInfoClose: cancel ability to reopen feature grid on drawer toggle control', done => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(TEST_TIMEOUT);
            done();
        };
        testEpic(addTimeoutEpic(autoReopenFeatureGridOnFeatureInfoClose), 1, [openFeatureGrid(), featureInfoClick(), toggleControl('drawer'), hideMapinfoMarker(), closeFeatureGrid()], epicResult);
    });
    it('autoReopenFeatureGridOnFeatureInfoClose flow restarts on new open feature grid ', done => {
        // This prevents event loops with other epics
        // that trigger feature info hideMarker
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                if (action.type === TEST_TIMEOUT) {
                    done();
                }
            });
        };
        testEpic(addTimeoutEpic(autoReopenFeatureGridOnFeatureInfoClose), 1, [openFeatureGrid(), featureInfoClick(), openFeatureGrid(), hideMapinfoMarker(), closeFeatureGrid()], epicResult);
    });
    it('autoReopenFeatureGridOnFeatureInfoClose: other toggle control apart from drawer cannot cancel ability to open feature grid', done => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(OPEN_FEATURE_GRID);
            done();
        };
        testEpic(autoReopenFeatureGridOnFeatureInfoClose, 1, [openFeatureGrid(), featureInfoClick(), toggleControl('notdrawer'), hideMapinfoMarker(), closeFeatureGrid()], epicResult );
    });

    it('autoReopenFeatureGridOnFeatureInfoClose: feature info doesn\'t reopen feature grid after close', done => {
        const epicResult = actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(OPEN_FEATURE_GRID);
            expect(actions[1].type).toBe(TEST_TIMEOUT);
            done();
        };
        testEpic(addTimeoutEpic(autoReopenFeatureGridOnFeatureInfoClose, 20), 2, [
            openFeatureGrid(),
            featureInfoClick(),
            hideMapinfoMarker(),
            closeFeatureGrid(),
            featureInfoClick(),
            hideMapinfoMarker()],
        epicResult);
    });

    it('featureGridChangePage', done => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                if (action.type === QUERY) {
                    done();
                }
            });
        };
        testEpic(featureGridChangePage, 1, [changePage(0, 10)], epicResult);
    });
    it('featureGridChangePage manages queryOptions viewparams', done => {

        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                if (action.type === QUERY) {
                    expect(action.queryOptions.viewParams).toBe("a:b");
                    done();
                }
            });
        };
        testEpic(featureGridChangePage, 1, [changePage(0, 10)], epicResult, () => ({
            layers: {
                flat: [{
                    id: "TEST_LAYER",
                    title: "Test Layer",
                    name: 'editing:polygons',
                    params: {
                        viewParams: "a:b"
                    }
                }]
            }, featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                changes: []
            }
        }));
    });

    it('featureGridSort', done => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                if (action.type === QUERY) {
                    done();
                }
            });
        };
        testEpic(featureGridSort, 1, [sort("ATTR", "ASC")], epicResult, {
            featuregrid: {
                pagination: {
                    size: 10
                }
            }
        });
    });

    it('featureGridSort manages queryOptions viewparams', done => {

        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                if (action.type === QUERY) {
                    expect(action.queryOptions.viewParams).toBe("a:b");
                    done();
                }
            });
        };
        testEpic(featureGridSort, 1, [sort("ATTR", "ASC")], epicResult, () => ({
            layers: {
                flat: [{
                    id: "TEST_LAYER",
                    title: "Test Layer",
                    name: 'editing:polygons',
                    params: {
                        viewParams: "a:b"
                    }
                }]
            }, featuregrid: {
                pagination: {
                    size: 10
                },
                open: true,
                selectedLayer: "TEST_LAYER",
                changes: []
            }
        }));
    });
    describe('replayOnTimeDimensionChange', () => {
        const SEARCH_URL = '/test-url';
        const FILTER_OBJECT = { "dummy": "object" };
        const TEST_STATE_OPEN_BASE = {
            layers: {
                flat: [{
                    id: "TEST_LAYER",
                    title: "Test Layer",
                    name: 'editing:polygons',
                    params: {
                        viewParams: "a:b"
                    }
                }]
            },
            featuregrid: {
                pagination: {
                    size: 10
                },
                open: true,
                selectedLayer: "TEST_LAYER",
                changes: []
            }
        };
        const TEST_STATE_CLOSED = set('featuregrid.open', false, TEST_STATE_OPEN_BASE);
        const TEST_STATE_SYNC_ACTIVE = set('featuregrid.timeSync', true, TEST_STATE_OPEN_BASE);
        const isSameQuery = a => {
            expect(a.type).toBe(QUERY_CREATE);
            expect(a.searchUrl).toBe(SEARCH_URL);
            expect(a.filterObj).toBe(FILTER_OBJECT);
        };
        it('toggle on setTimeSync if FG is open', done => {
            testEpic(replayOnTimeDimensionChange, 1, [query(SEARCH_URL, FILTER_OBJECT), setTimeSync(false)], ([a]) => {
                isSameQuery(a);
                done();
            }, TEST_STATE_OPEN_BASE);
        });
        it('do not toggle if FG is closed', done => {
            testEpic(addTimeoutEpic(replayOnTimeDimensionChange, 10), 1, [query(SEARCH_URL, FILTER_OBJECT), setTimeSync(true)], ([a]) => {
                expect(a.type).toBe(TEST_TIMEOUT);
                done();
            }, TEST_STATE_CLOSED);
        });
        it('toggle with time change', done => {
            testEpic(replayOnTimeDimensionChange, 1, [query(SEARCH_URL, FILTER_OBJECT), changeLayerParams("TEST_LAYER", { time: '123' })], ([a]) => {
                isSameQuery(a);
                done();
            }, TEST_STATE_SYNC_ACTIVE);
        });
        it('do not toggle with time change, sync disabled', done => {
            testEpic(addTimeoutEpic(replayOnTimeDimensionChange, 10), 1, [query(SEARCH_URL, FILTER_OBJECT), changeLayerParams("TEST_LAYER", { time: '123' })], ([a]) => {
                expect(a.type).toBe(TEST_TIMEOUT);
                done();
            }, TEST_STATE_OPEN_BASE);
        });
        it('do not toggle with time change if layer do not change time', done => {
            testEpic(addTimeoutEpic(replayOnTimeDimensionChange, 10), 1, [query(SEARCH_URL, FILTER_OBJECT), changeLayerParams("OTHER_LAYER", { time: '123' })], ([a]) => {
                expect(a.type).toBe(TEST_TIMEOUT);
                done();
            }, TEST_STATE_SYNC_ACTIVE);
        });
        it('do not toggle with time change if param changed is not the time', done => {
            testEpic(addTimeoutEpic(replayOnTimeDimensionChange, 10), 1, [query(SEARCH_URL, FILTER_OBJECT), changeLayerParams("TEST_LAYER", { elevation: '123' })], ([a]) => {
                expect(a.type).toBe(TEST_TIMEOUT);
                done();
            }, TEST_STATE_SYNC_ACTIVE);
        });
        it('do not toggle with time change if feature grid is closed', done => {
            const TEST_STATE_TIME_ACTIVE_CLOSED = set('featuregrid.timeSync', true, TEST_STATE_CLOSED);
            testEpic(addTimeoutEpic(replayOnTimeDimensionChange, 10), 1, [query(SEARCH_URL, FILTER_OBJECT), changeLayerParams("TEST_LAYER", { time: '123' })], ([a]) => {
                expect(a.type).toBe(TEST_TIMEOUT);
                done();
            }, TEST_STATE_TIME_ACTIVE_CLOSED);
        });

    });
    describe('hideFeatureGridOnDrawerOpenMobile', () => {
        const TEST_STATE_BASE = {
            controls: {
                drawer: {
                    enabled: true
                }
            },
            browser: {
                mobile: true
            }
        };

        it('toggle featureGrid when drawer is opened - MOBILE ONLY', done => {
            const epicResult = actions => {
                expect(actions.length).toBe(2);
                expect(actions[0].type).toBe(HIDE_MAPINFO_MARKER);
                expect(actions[1].type).toBe(OPEN_FEATURE_GRID);
                done();
            };

            testEpic(hideFeatureGridOnDrawerOpenMobile, 2, toggleControl('drawer', null), epicResult, TEST_STATE_BASE);
        });
        it('do not toggle featureGrid when drawer is closed - MOBILE ONLY', done => {
            const TEST_STATE_CLOSED_DRAWER = set('controls.drawer.enabled', false, TEST_STATE_BASE);
            const epicResult = actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            };

            testEpic(addTimeoutEpic(hideFeatureGridOnDrawerOpenMobile, 10), 1, toggleControl('drawer', null), epicResult, TEST_STATE_CLOSED_DRAWER);
        });
        it('do not toggle featureGrid when drawer is opened - DESKTOP MODE', done => {
            const TEST_STATE_NOT_MOBILE = set('browser.mobile', false, TEST_STATE_BASE);
            const epicResult = actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            };

            testEpic(addTimeoutEpic(hideFeatureGridOnDrawerOpenMobile, 10), 1, toggleControl('drawer', null), epicResult, TEST_STATE_NOT_MOBILE);
        });
        it('do not toggle featureGrid when drawer is closed - DESKTOP MODE', done => {
            const TEST_STATE_CLOSED_DRAWER = set('controls.drawer.enabled', false, TEST_STATE_BASE);
            const TEST_STATE_NOT_MOBILE = set('browser.mobile', false, TEST_STATE_CLOSED_DRAWER);
            const epicResult = actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            };

            testEpic(addTimeoutEpic(hideFeatureGridOnDrawerOpenMobile, 10), 1, toggleControl('drawer', null), epicResult, TEST_STATE_NOT_MOBILE);
        });
        it('toggle drawer when featureGrid is opened - MOBILE ONLY', done => {
            const epicResult = actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TOGGLE_CONTROL);
                done();
            };

            testEpic(hideDrawerOnFeatureGridOpenMobile, 1, featureInfoClick(), epicResult, TEST_STATE_BASE);
        });
        it('open featureGrid shouldn\'t toggle closed drawer - MOBILE ONLY', done => {
            const TEST_STATE_CLOSED_DRAWER = set('controls.drawer.enabled', false, TEST_STATE_BASE);
            const epicResult = actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            };

            testEpic(addTimeoutEpic(hideDrawerOnFeatureGridOpenMobile, 10), 1, featureInfoClick(), epicResult, TEST_STATE_CLOSED_DRAWER);
        });
        it('open featureGrid shouldn\'t toggle opened drawer- DESKTOP ONLY', done => {
            const TEST_STATE_CLOSED_DRAWER = set('controls.drawer.enabled', false, TEST_STATE_BASE);
            const TEST_STATE_NOT_MOBILE = set('browser.mobile', false, TEST_STATE_CLOSED_DRAWER);
            const epicResult = actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            };

            testEpic(addTimeoutEpic(hideDrawerOnFeatureGridOpenMobile, 10), 1, featureInfoClick(), epicResult, TEST_STATE_NOT_MOBILE);
        });
        it('open featureGrid shouldn\'t toggle closed drawer - DESKTOP ONLY', done => {
            const TEST_STATE_NOT_MOBILE = set('browser.mobile', false, TEST_STATE_BASE);
            const epicResult = actions => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            };

            testEpic(addTimeoutEpic(hideDrawerOnFeatureGridOpenMobile, 10), 1, featureInfoClick(), epicResult, TEST_STATE_NOT_MOBILE);
        });
    });
    it('handleClickOnMap epic', (done) => {
        const startActions = [updateFilter({
            type: 'geometry',
            enabled: true
        }), clickOnMap({
            latlng: {
                lat: 1.0,
                lng: 8.0
            },
            pixel: {
                x: 10.0,
                y: 10.0
            }
        })];

        testEpic(handleClickOnMap, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(UPDATE_FILTER);
            expect(actions[0].update).toExist();
            expect(actions[0].update.value).toExist();
            expect(actions[0].update.value.attribute).toBe('the_geom');
            expect(actions[0].update.value.method).toBe('Circle');
            expect(actions[0].update.value.geometry).toExist();
            expect(actions[0].update.value.geometry.type).toBe('Polygon');
            expect(actions[0].update.value.geometry.radius).toExist();
        }, {
            featuregrid: {
                filters: [{
                    type: 'geometry',
                    attribute: 'the_geom',
                    enabled: true
                }]
            },
            map: {
                present: {
                    projection: 'EPSG:3857'
                }
            }
        }, done);
    });
    it('featureGridUpdateFilter with geometry filter', (done) => {
        const startActions = [openFeatureGrid(), createQuery(), updateFilter({
            type: 'geometry',
            enabled: true
        }), updateFilter({
            type: 'geometry',
            enabled: true,
            value: {}
        })];
        testEpic(featureGridUpdateGeometryFilter, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(UPDATE_QUERY);
            expect(actions[0].reason).toBe('geometry');
        }, {
            featuregrid: {
                selectedLayer: 'layer'
            },
            layers: [{
                id: 'layer',
                name: 'layer'
            }]
        }, done);
    });
    it('activateTemporaryChangesEpic', (done) => {
        const startActions = [activateTemporaryChanges(true)];
        testEpic(activateTemporaryChangesEpic, 2, startActions, actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(DISABLE_TOOLBAR);
            expect(actions[0].disabled).toBe(true);
            expect(actions[1].type).toBe(DEACTIVATE_GEOMETRY_FILTER);
            expect(actions[1].deactivated).toBe(true);
        }, {}, done);
    });
});
