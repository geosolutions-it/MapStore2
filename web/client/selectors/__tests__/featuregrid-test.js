/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const assign = require('object-assign');
const {
    isFeatureGridOpen,
    hasChangesSelector,
    getTitleSelector,
    newFeaturesSelector,
    hasNewFeaturesSelector,
    hasGeometrySelector,
    selectedFeatureSelector,
    selectedFeaturesSelector,
    modeSelector,
    selectedFeaturesCount,
    changesSelector,
    isDrawingSelector,
    isSimpleGeomSelector,
    editingAllowedRolesSelector,
    getCustomizedAttributes,
    isSavingSelector,
    isSavedSelector,
    canEditSelector,
    showAgainSelector,
    showPopoverSyncSelector,
    hasSupportedGeometry,
    getDockSize,
    selectedLayerNameSelector,
    queryOptionsSelector,
    showTimeSync,
    timeSyncActive
} = require('../featuregrid');

const idFt1 = "idFt1";
const idFt2 = "idFt2";
const modeEdit = "edit";
let feature1 = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    },
    id: idFt1,
    properties: {
        someProp: "someValue"
    }
};
let feature2 = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    },
    id: idFt2,
    properties: {
        someProp: "someValue"
    }
};
const featuregrid = require('../../reducers/featuregrid');
const { setUp, setTimeSync } = require('../../actions/featuregrid');

const dimension = require('../../reducers/dimension');
const { updateLayerDimensionData } = require('../../actions/dimension');

let initialState = {
    query: {
        featureTypes: {
            // use name with chars ":" and "."
            'editing:polygons.test': {
                geometry: [
                    {
                        label: 'geometry',
                        attribute: 'geometry',
                        type: 'geometry',
                        valueId: 'id',
                        valueLabel: 'name',
                        values: []
                    }
                ],
                original: {
                    elementFormDefault: 'qualified',
                    targetNamespace: 'http://geoserver.org/editing',
                    targetPrefix: 'editing',
                    featureTypes: [
                        {
                            typeName: 'poligoni',
                            properties: [
                                {
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
                        }
                    ]
                },
                attributes: [
                    {
                        label: 'name',
                        attribute: 'name',
                        type: 'string',
                        valueId: 'id',
                        valueLabel: 'name',
                        values: []
                    }
                ]
            }
        },
        data: {},
        result: {
            type: 'FeatureCollection',
            totalFeatures: 4,
            features: [
                {
                    type: 'Feature',
                    id: 'poligoni.1',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [
                                    -39,
                                    39
                                ],
                                [
                                    -39,
                                    38
                                ],
                                [
                                    -40,
                                    38
                                ],
                                [
                                    -39,
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
                                [
                                    -48.77929687,
                                    37.54457732
                                ],
                                [
                                    -49.43847656,
                                    36.06686213
                                ],
                                [
                                    -46.31835937,
                                    35.53222623
                                ],
                                [
                                    -44.47265625,
                                    37.40507375
                                ],
                                [
                                    -48.77929687,
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
                                [
                                    -50.16357422,
                                    28.90239723
                                ],
                                [
                                    -49.69116211,
                                    28.24632797
                                ],
                                [
                                    -48.2409668,
                                    28.56522549
                                ],
                                [
                                    -50.16357422,
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
                                [
                                    -64.46777344,
                                    33.90689555
                                ],
                                [
                                    -66.22558594,
                                    31.95216224
                                ],
                                [
                                    -63.32519531,
                                    30.97760909
                                ],
                                [
                                    -64.46777344,
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
            featureTypeName: 'editing:polygons.test',
            groupFields: [
                {
                    id: 1,
                    logic: 'OR',
                    index: 0
                }
            ],
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
        typeName: 'editing:polygons.test',
        url: 'http://localhost:8081/geoserver/wfs?',
        featureLoading: false
    },
    featuregrid: {
        open: true,
        selectedLayer: "TEST_LAYER",
        mode: modeEdit,
        select: [feature1, feature2],
        changes: [{id: feature2.id, updated: {geometry: null}}]
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


describe('Test featuregrid selectors', () => {
    afterEach(() => {
        initialState = assign({}, initialState, {
            featuregrid: {
                open: true,
                saving: false,
                saved: false,
                selectedLayer: "TEST_LAYER",
                drawing: true,
                mode: modeEdit,
                select: [feature1, feature2],
                changes: [{id: feature2.id, updated: {geometry: null}}],
                attributes: {
                    name: {
                        hide: true
                    }
                }
            }
        });
    });
    it('isFeatureGridOpen', () => {
        let isOpen = isFeatureGridOpen(initialState);
        expect(isOpen).toBe(true);
    });
    it('test feature changes', () => {
        let hasChanges = hasChangesSelector(initialState);
        expect(hasChanges).toBe(true);
        hasChanges = hasChangesSelector({
            featuregrid: {
                ...initialState.featuregrid,
                changes: []
            }
        });
        expect(hasChanges).toBe(false);
    });
    it('test newFeatures', () => {
        expect(hasNewFeaturesSelector(initialState)).toBeFalsy();
        const newFeaturesState = {
            featuregrid: {
                ...initialState.featuregrid,
                newFeatures: [{id: "test"}]
            }
        };
        expect(hasChangesSelector(newFeaturesState)).toBe(true);
        expect(newFeaturesSelector(newFeaturesState).length).toBe(1);
    });
    it('test if the feature has changes', () => {
        let hasChanges = hasChangesSelector(initialState);
        expect(hasChanges).toBe(true);
        hasChanges = hasChangesSelector({
            featuregrid: {
                ...initialState.featuregrid,
                changes: []
            }
        });
        expect(hasChanges).toBe(false);
    });
    it('test if the feature has some geometry (true)', () => {
        const bool = hasGeometrySelector(initialState);
        expect(bool).toExist();
        expect(bool).toBe(true);
    });
    it('test if the feature has not geometry (false)', () => {
        initialState.featuregrid.select = [feature2];
        const bool = hasGeometrySelector(initialState);
        expect(bool).toBe(false);
        initialState.featuregrid.select = [{id: "A", _new: true, geometry: null}];
        initialState.featuregrid.newFeatures = [{id: "A", _new: true, geometry: null}];
        initialState.featuregrid.changes = [];
        expect(hasGeometrySelector(initialState)).toBe(false);
        initialState.featuregrid.newFeatures = [{id: "A", _new: true, geometry: {}}];
        expect(hasGeometrySelector(initialState)).toBe(true);
    });
    it('test selectedFeatureSelector ', () => {
        const feature = selectedFeatureSelector(initialState);
        expect(feature).toExist();
        expect(feature.id).toBe(idFt1);
    });
    it('test showAgainSelector default ', () => {
        const val = showAgainSelector(initialState);
        expect(val).toBe(false);
    });
    it('test showPopoverSyncSelector default ', () => {
        const val = showPopoverSyncSelector(initialState);
        expect(val).toExist();
        expect(val).toBe(true);
    });
    it('test showAgainSelector ', () => {
        const val = showAgainSelector({featuregrid: {showAgain: false}});
        expect(val).toBe(false);
    });
    it('test showPopoverSyncSelector ', () => {
        const val = showPopoverSyncSelector({featuregrid: {showPopoverSync: false}});
        expect(val).toBe(false);
    });
    it('test selectedFeaturesSelector ', () => {
        const features = selectedFeaturesSelector(initialState);
        expect(features).toExist();
        expect(features.length).toBe(2);
    });
    it('test modeSelector ', () => {
        const mode = modeSelector(initialState);
        expect(mode).toExist();
        expect(mode).toBe(modeEdit);
    });
    it('test selectedFeaturesCount ', () => {
        const count = selectedFeaturesCount(initialState);
        expect(count).toExist();
        expect(count).toBe(2);
    });
    it('test changesSelector ', () => {
        const ftChanged = changesSelector(initialState);
        expect(ftChanged).toExist();
        expect(ftChanged.length).toBe(1);
    });
    it('test isDrawingSelector ', () => {
        const isdrawing = isDrawingSelector(initialState);
        expect(isdrawing).toExist();
        expect(isdrawing).toBe(true);
    });
    it('test isSimpleGeomSelector ', () => {
        const geomType = isSimpleGeomSelector(initialState);
        expect(geomType).toExist();
    });
    it('test titleSelector ', () => {
        expect(getTitleSelector(initialState)).toBe("Test Layer");
    });
    it('test customized Attributes ', () => {
        expect(getCustomizedAttributes(initialState)[0].hide).toBe(true);
    });
    it('test isSavingSelector', () => {
        expect(isSavingSelector(initialState)).toBe(false);
        expect(isSavingSelector({...initialState, featuregrid: { saving: true}})).toBe(true);
    });
    it('test editingAllowedRolesSelector', () => {
        expect(editingAllowedRolesSelector(initialState).length).toBe(1);
        expect(editingAllowedRolesSelector(initialState)[0]).toBe("ADMIN");
        expect(editingAllowedRolesSelector({...initialState, featuregrid: { editingAllowedRoles: ["USER", "ADMIN"]}}).length).toBe(2);
    });
    it('test isSavedSelector', () => {
        expect(isSavedSelector(initialState)).toBe(false);
        expect(isSavedSelector({...initialState, featuregrid: { saved: true}})).toBe(true);
    });
    it('test canEditSelector', () => {
        expect(canEditSelector(initialState)).toBeFalsy();
        expect(canEditSelector({featuregrid: {canEdit: true}})).toBe(true);
    });

    it('test hasSupportedGeometry', () => {
        expect(hasSupportedGeometry(initialState)).toBe(true);
        let initialStateWithGmlGeometry = assign({}, initialState);
        initialStateWithGmlGeometry.query.featureTypes['editing:polygons.test'].original.featureTypes[0].properties[1].type = 'gml:Geometry';
        initialStateWithGmlGeometry.query.featureTypes['editing:polygons.test'].original.featureTypes[0].properties[1].localType = 'Geometry';
        expect(hasSupportedGeometry(initialStateWithGmlGeometry)).toBe(false);
        initialStateWithGmlGeometry.query.featureTypes['editing:polygons.test'].original.featureTypes[0].properties[1].type = 'gml:GeometryCollection';
        initialStateWithGmlGeometry.query.featureTypes['editing:polygons.test'].original.featureTypes[0].properties[1].localType = 'GeometryCollection';
        expect(hasSupportedGeometry(initialStateWithGmlGeometry)).toBe(false);
        initialStateWithGmlGeometry.query.featureTypes['editing:polygons.test'].original.featureTypes[0].properties[1].type = 'gml:Polygon';
        initialStateWithGmlGeometry.query.featureTypes['editing:polygons.test'].original.featureTypes[0].properties[1].localType = 'Polygon';
        expect(hasSupportedGeometry(initialStateWithGmlGeometry)).toBe(true);

    });

    it('test getDockSize', () => {
        expect(getDockSize({ featuregrid: {dockSize: 0.5} })).toBe(0.5);
        expect(getDockSize({})).toBe(undefined);
    });

    it('showTimeSync', () => {
        expect(showTimeSync({featuregrid: initialState.featuregrid})).toBeFalsy();
        const state = {
            ...initialState,
            featuregrid: featuregrid(initialState.featuregrid, setUp({ showTimeSync: true })),
            dimension: dimension({}, updateLayerDimensionData('TEST_LAYER', 'time', {
                source: { // describes the source of dimension
                    type: 'multidim-extension',
                    url: 'http://domain.com:80/geoserver/wms'
                },
                name: 'time',
                domain: '2016-09-01T00:00:00.000Z--2017-04-11T00:00:00.000Z'
            }))
        };
        expect(showTimeSync(state)).toBeTruthy();
    });
    it('syncTimeActive', () => {
        expect(timeSyncActive({ featuregrid: initialState.featuregrid })).toBeFalsy();
        const state = {
            featuregrid: featuregrid(initialState.featureGrid, setTimeSync(true))
        };
        expect(timeSyncActive(state)).toBe(true);
    });
    it('test selectedLayerNameSelector', () => {
        const state = {...initialState, layers: {
            flat: [{
                id: "TEST_LAYER",
                title: "Test Layer",
                name: 'editing:polygons.test'
            }]
        }, featuregrid: {
            open: true,
            selectedLayer: "TEST_LAYER",
            mode: modeEdit,
            select: [feature1, feature2],
            changes: [{id: feature2.id, updated: {geometry: null}}]
        }};
        expect(selectedLayerNameSelector(state)).toBe('editing:polygons.test');
        expect(selectedLayerNameSelector({})).toBe('');
    });
    it('queryOptionsSelector gets viewParams', () => {
        const state = {
            ...initialState, layers: {
                flat: [{
                    id: "TEST_LAYER",
                    title: "Test Layer",
                    name: 'editing:polygons.test',
                    params: {
                        viewParams: "a:b"
                    }
                }]
            }, featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: modeEdit,
                select: [feature1, feature2],
                changes: [{ id: feature2.id, updated: { geometry: null } }]
            }
        };
        expect(queryOptionsSelector(state).viewParams).toBe("a:b");
    });
    it('queryOptionsSelector gets CQL_FILTER', () => {
        const state = {
            ...initialState, layers: {
                flat: [{
                    id: "TEST_LAYER",
                    title: "Test Layer",
                    name: 'editing:polygons.test',
                    params: {
                        CQL_FILTER: "a:b"
                    }
                }]
            }, featuregrid: {
                open: true,
                selectedLayer: "TEST_LAYER",
                mode: modeEdit,
                select: [feature1, feature2],
                changes: [{ id: feature2.id, updated: { geometry: null } }]
            }
        };
        expect(queryOptionsSelector(state).cqlFilter).toBe("a:b");
    });
});
