/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const assign = require('object-assign');
const {toggleEditMode, toggleViewMode} = require('../../actions/featuregrid');
const {SET_HIGHLIGHT_FEATURES_PATH} = require('../../actions/highlight');
const {CHANGE_DRAWING_STATUS} = require('../../actions/draw');
const {SHOW_NOTIFICATION} = require('../../actions/notifications');

const {setHighlightFeaturesPath, triggerDrawSupportOnSelectionChange} = require('../featuregrid');
const {testEpic} = require('./epicTestUtils');

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

});
