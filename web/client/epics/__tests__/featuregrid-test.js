/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const assign = require('object-assign');
const {toggleEditMode, toggleViewMode, openFeatureGrid, SET_LAYER, DELETE_GEOMETRY_FEATURE, deleteGeometry, createNewFeatures, CLOSE_FEATURE_GRID, TOGGLE_MODE, MODES, closeFeatureGridConfirm, clearChangeConfirmed, CLEAR_CHANGES, TOGGLE_TOOL, closeFeatureGridConfirmed, zoomAll, START_SYNC_WMS, STOP_SYNC_WMS, startDrawingFeature, startEditingFeature, closeFeatureGrid, GEOMETRY_CHANGED} = require('../../actions/featuregrid');
const {SET_HIGHLIGHT_FEATURES_PATH} = require('../../actions/highlight');
const {CHANGE_DRAWING_STATUS} = require('../../actions/draw');
const {SHOW_NOTIFICATION} = require('../../actions/notifications');
const {RESET_CONTROLS, SET_CONTROL_PROPERTY, toggleControl} = require('../../actions/controls');
const {ZOOM_TO_EXTENT} = require('../../actions/map');
const {PURGE_MAPINFO_RESULTS} = require('../../actions/mapInfo');
const {toggleSyncWms} = require('../../actions/wfsquery');
const {CHANGE_LAYER_PROPERTIES} = require('../../actions/layers');
const {geometryChanged} = require('../../actions/draw');

const {layerSelectedForSearch} = require('../../actions/wfsquery');

const {setHighlightFeaturesPath, triggerDrawSupportOnSelectionChange, featureGridLayerSelectionInitialization, closeCatalogOnFeatureGridOpen, deleteGeometryFeature, onFeatureGridCreateNewFeature, resetGridOnLocationChange, resetQueryPanel, autoCloseFeatureGridEpicOnDrowerOpen, askChangesConfirmOnFeatureGridClose, onClearChangeConfirmedFeatureGrid, onCloseFeatureGridConfirmed, onFeatureGridZoomAll, resetControlsOnEnterInEditMode, closeIdentifyEpic, startSyncWmsFilter, stopSyncWmsFilter, handleDrawFeature, handleEditFeature, resetEditingOnFeatureGridClose, onFeatureGridGeometryEditing} = require('../featuregrid');
const {TEST_TIMEOUT, testEpic, addTimeoutEpic} = require('./epicTestUtils');

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
                        typeName: 'poligoni',
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
            features: [{
                    type: 'Feature',
                    id: 'poligoni.1',
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
                    id: 'poligoni.2',
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
                    id: 'poligoni.6',
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
                    id: 'poligoni.7',
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
            ],
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
                        typeName: 'poligoni',
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
            features: [{
                    type: 'Feature',
                    id: 'poligoni.1',
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
                    id: 'poligoni.2',
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
                    id: 'poligoni.6',
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
                    id: 'poligoni.7',
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
            ],
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
                        expect(action.owner).toBe("featureGrid");
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
                            expect(action.owner).toBe("featureGrid");
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
                changes: []
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
                            expect(action.owner).toBe("featureGrid");
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

        testEpic(addTimeoutEpic(triggerDrawSupportOnSelectionChange), 1, toggleEditMode(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case TEST_TIMEOUT:
                        break;
                    default:
                        expect(false).toBe(true);
                }
            });
            done();
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

    it('test closeCatalogOnFeatureGridOpen', (done) => {
        testEpic(closeCatalogOnFeatureGridOpen, 1, openFeatureGrid(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case SET_CONTROL_PROPERTY:
                        expect(action.control).toBe('metadataexplorer');
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
                        expect(action.owner).toBe("featureGrid");
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
                        expect(action.owner).toBe("featureGrid");
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
        testEpic(resetGridOnLocationChange, 2, [openFeatureGrid(), {type: '@@router/LOCATION_CHANGE'}], actions => {
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
        testEpic(resetQueryPanel, 1, {type: '@@router/LOCATION_CHANGE'}, actions => {
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
        }, state);
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

    it('test closeIdentifyEpic', (done) => {
        testEpic(closeIdentifyEpic, 1, openFeatureGrid(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case PURGE_MAPINFO_RESULTS:
                        expect(action.type).toBe(PURGE_MAPINFO_RESULTS);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {});
    });


    it('test startSyncWmsFilter', (done) => {
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
        }, {
            query: {
                syncWmsFilter: true
            }
        });
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
                        expect(action.owner).toBe("featureGrid");
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
                select: [{id: 'poligoni.1', _new: 'poligoni._new'}],
                changes: []
            }
        };
        const newState = assign({}, state, stateFeaturegrid);

        testEpic(onFeatureGridGeometryEditing, 1, [geometryChanged([{id: 'poligoni.1', geometry: { type: 'Polygon', coordinates: [[[-180, 90], [180, 90], [180, -90], [-180, 90]]]}, geometry_name: 'geometry' }], 'featureGrid', '')], actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case GEOMETRY_CHANGED:
                        expect(action.features).toEqual([{
                            id: 'poligoni.1',
                            type: 'Feature',
                            _new: 'poligoni._new',
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
                select: [{id: 'poligoni.1', _new: 'poligoni._new'}],
                changes: []
            }
        };
        const newState = assign({}, state, stateFeaturegrid);

        testEpic(onFeatureGridGeometryEditing, 2, [geometryChanged([{id: 'poligoni.1', geometry: { type: 'Polygon', coordinates: [[[-180, 90], [180, 90], [180, -90], [-180, 90]]]}, geometry_name: 'geometry' }], 'featureGrid', 'enterEditMode')], actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                    case GEOMETRY_CHANGED:
                        expect(action.features).toEqual([{
                            id: 'poligoni.1',
                            type: 'Feature',
                            _new: 'poligoni._new',
                            geometry: { type: 'Polygon', coordinates: [[[-180, 90], [180, 90], [180, -90], [-180, 90]]]},
                            geometry_name: 'geometry'
                        }]);
                        break;
                    case CHANGE_DRAWING_STATUS:
                        expect(action.status).toBe("drawOrEdit");
                        expect(action.method).toBe("Polygon");
                        expect(action.owner).toBe("featureGrid");
                        expect(action.features).toEqual([{
                            id: 'poligoni.1',
                            type: 'Feature',
                            _new: 'poligoni._new',
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

});
