/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {find} = require('lodash');

const configureMockStore = require('redux-mock-store').default;
const { createEpicMiddleware, combineEpics } = require('redux-observable');
const {ADD_LAYER, UPDATE_NODE, CHANGE_LAYER_PROPERTIES} = require('../../actions/layers');
const {CHANGE_DRAWING_STATUS, drawingFeatures, DRAWING_FEATURE, selectFeatures} = require('../../actions/draw');
const {set} = require('../../utils/ImmutableUtils');
const {HIDE_MAPINFO_MARKER, PURGE_MAPINFO_RESULTS, purgeMapInfoResults} = require('../../actions/mapInfo');
const {configureMap} = require('../../actions/config');
const {CLOSE_IDENTIFY} = require('../../actions/mapInfo');
const {editAnnotation, confirmRemoveAnnotation, saveAnnotation, startDrawing, cancelEditAnnotation,
    setStyle, highlight, cleanHighlight, download, loadAnnotations, SET_STYLE, toggleStyle,
    resetCoordEditor, changeRadius, changeText, changeSelected, confirmDeleteFeature, openEditor, SHOW_ANNOTATION,
    loadDefaultStyles, LOADING, SET_DEFAULT_STYLE, toggleVisibilityAnnotation, geometryHighlight
} = require('../../actions/annotations');
const {TOGGLE_CONTROL, toggleControl, SET_CONTROL_PROPERTY} = require('../../actions/controls');
const {STYLE_POINT_MARKER} = require('../../utils/AnnotationsUtils');
const {addAnnotationsLayerEpic, editAnnotationEpic, removeAnnotationEpic, saveAnnotationEpic, newAnnotationEpic, addAnnotationEpic,
    disableInteractionsEpic, cancelEditAnnotationEpic, startDrawingMultiGeomEpic, endDrawGeomEpic, endDrawTextEpic, cancelTextAnnotationsEpic,
    setAnnotationStyleEpic, restoreStyleEpic, highlighAnnotationEpic, cleanHighlightAnnotationEpic, closeAnnotationsEpic, confirmCloseAnnotationsEpic,
    downloadAnnotations, onLoadAnnotations, onChangedSelectedFeatureEpic, onBackToEditingFeatureEpic, redrawOnChangeRadiusEpic, redrawOnChangeTextEpic,
    editSelectedFeatureEpic, editCircleFeatureEpic, purgeMapInfoEpic, closeMeasureToolEpic, openEditorEpic, loadDefaultAnnotationsStylesEpic, showHideAnnotationEpic, highlightGeometryEpic
} = require('../annotations')({});
const rootEpic = combineEpics(addAnnotationsLayerEpic, editAnnotationEpic, removeAnnotationEpic, saveAnnotationEpic, newAnnotationEpic, addAnnotationEpic,
    disableInteractionsEpic, cancelEditAnnotationEpic, startDrawingMultiGeomEpic, endDrawGeomEpic, endDrawTextEpic, cancelTextAnnotationsEpic,
    setAnnotationStyleEpic, restoreStyleEpic, highlighAnnotationEpic, cleanHighlightAnnotationEpic, closeAnnotationsEpic, confirmCloseAnnotationsEpic,
    downloadAnnotations, onLoadAnnotations, onChangedSelectedFeatureEpic, onBackToEditingFeatureEpic, redrawOnChangeRadiusEpic, redrawOnChangeTextEpic,
    editSelectedFeatureEpic, editCircleFeatureEpic, purgeMapInfoEpic, closeMeasureToolEpic, openEditorEpic, loadDefaultAnnotationsStylesEpic, showHideAnnotationEpic, highlightGeometryEpic
);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);
const {testEpic, addTimeoutEpic, TEST_TIMEOUT} = require('./epicTestUtils');
const ft = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 1]
    },
    properties: {
        id: "is a point"
    }
};


const annotationsLayerWithTextFeature = {
    "flat": [
        {
            "id": "annotations",
            "features": [
                {
                    type: "FeatureCollection",
                    features: [{
                        "properties": {
                            "id": "1",
                            isText: true,
                            valueText: "my text"
                        },
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                1,
                                1
                            ]
                        }
                    }],
                    style: {
                        type: "Text",
                        id: "id.1.text.5",
                        "Text": {
                            color: "#FF0000",
                            font: "Arial 14px",
                            label: "my text"
                        }
                    }
                }
            ]
        }
    ]
};

const annotationsLayerWithCircleFeature = {
    "flat": [
        {
            "id": "annotations",
            "features": [
                {
                    type: "FeatureCollection",
                    features: [{
                        "properties": {
                            "id": "1",
                            isCircle: true,
                            center: []
                        },
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                1,
                                1
                            ]
                        }
                    }],
                    style: {
                        type: "Circle",
                        id: "id.1.2.3.4.5",
                        "Circle": {
                            color: "#FF0000"
                        }
                    }
                }
            ]
        }
    ]
};
const annotationsLayerWithLineStringFeature = {
    "flat": [
        {
            "id": "annotations",
            "features": [
                {
                    type: "FeatureCollection",
                    features: [{
                        "properties": {
                            "id": "1"
                        },
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                [ 1, 1 ],
                                [ 12, 12 ]
                            ]
                        }
                    }],
                    style: {
                        type: "LineString",
                        id: "id.1.2.3.4.5",
                        "LineString": {
                            color: "#FF0000"
                        }
                    }
                }
            ]
        }
    ]
};
const annotationsLayerWithPointFeatureAndSymbol = {
    "flat": [
        {
            "id": "annotations",
            "features": [
                {
                    type: "FeatureCollection",
                    features: [{
                        "properties": {
                            "id": "1"
                        },
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                [ 1, 1 ],
                                [ 12, 12 ]
                            ]
                        },
                        style: [{
                            type: "Point",
                            id: "id.1.2.3.4.5",
                            iconUrl: "/path/symbol.svg",
                            symbolUrlCustomized: "/path/symbol.svg"
                        }]
                    }]
                }
            ]
        }
    ]
};

const triangleSvg = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg
    id="triangle"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    x="0px"
    y="0px"
    class="svg-triangle"
    width="64px"
    height="64px"
    viewBox="0 0 100 100">
  <polygon points="50,0 100,100 0,100"/>
</svg>
`;

describe('annotations Epics', () => {
    let store;
    let mockAxios;
    const defaultState = {
        annotations: {
            config: {multiGeometry: false, defaultPointType: 'symbol'},
            editing: {
                style: {},
                features: [ft],
                type: "FeatureCollection",
                properties: {
                    id: "is a point"
                }
            },
            styling: false,
            drawingText: {
                drawing: true
            },
            featureType: "Point",
            originalStyle: {},
            selected: ft
        },
        layers: {
            flat: [{
                id: 'annotations',
                features: [{
                    properties: {
                        id: '1'
                    },
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [1, 1]
                    }
                }]
            }]
        },
        controls: {annotations: {enabled: true}}
    };
    beforeEach(() => {
        store = mockStore(defaultState);
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
        mockAxios.restore();
    });

    it('set style', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[0].type).toBe(SET_STYLE);
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[1].status).toBe("updateStyle");
                done();
            }
        });
        const action = setStyle({});
        store.dispatch(action);
    });
    it('MAP_CONFIG_LOADED with missing annotations layer', (done) => {
        const state = {
            annotations: {
                editing: {
                    style: {}
                },
                originalStyle: {}
            },
            layers: {
                flat: []
            }
        };
        testEpic(addTimeoutEpic(addAnnotationsLayerEpic, 88), 1, configureMap({}), actions => {
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
        }, state);
    });
    it('add annotations layer on first save', (done) => {
        store = mockStore({
            annotations: {
                editing: {
                    style: {}
                },
                originalStyle: {}
            },
            layers: {
                flat: []
            }
        });
        let action = saveAnnotation('1', {}, {}, {}, true, {});

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(ADD_LAYER);
                done();
            }
        });

        store.dispatch(action);
    });
    it('update annotations layer, MAP_CONFIG_LOADED', (done) => {
        let action = configureMap({});

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(UPDATE_NODE);
                done();
            }
        });

        store.dispatch(action);
    });
    it('edit annotation', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 4) {
                expect(actions[1].type).toBe(CHANGE_LAYER_PROPERTIES);
                expect(actions[2].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[3].type).toBe(HIDE_MAPINFO_MARKER);
                done();
            }
        });
        editAnnotation('1')(store.dispatch, store.getState);
    });
    it('update annotations layer with LineString Feature, with old style structure, MAP_CONFIG_LOADED', (done) => {
        let action = configureMap({});

        store = mockStore({
            annotations: {
                editing: {
                    style: {}
                },
                originalStyle: {}
            },
            layers: annotationsLayerWithLineStringFeature
        });
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(UPDATE_NODE);
                done();
            }
        });

        store.dispatch(action);
    });
    it('update annotations layer with text Feature, with old style structure, MAP_CONFIG_LOADED', (done) => {
        let action = configureMap({});

        store = mockStore({
            annotations: {
                editing: {
                    style: {}
                },
                originalStyle: {}
            },
            layers: annotationsLayerWithTextFeature
        });
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(UPDATE_NODE);
                done();
            }
        });

        store.dispatch(action);
    });
    it('update annotations layer with Point Feature, with new symbol style structure, MAP_CONFIG_LOADED', (done) => {
        let action = configureMap({});

        store = mockStore({
            annotations: {
                editing: {
                    style: {}
                },
                originalStyle: {}
            },
            layers: annotationsLayerWithPointFeatureAndSymbol
        });
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(UPDATE_NODE);
                expect(actions[1].options.features[0].features[0].style[0].symbolUrlCustomized).toBe(undefined);
                done();
            }
        });

        store.dispatch(action);
    });
    it('update annotations layer with Circle Feature, with old style structure, MAP_CONFIG_LOADED', (done) => {
        let action = configureMap({});

        store = mockStore({
            annotations: {
                editing: {
                    style: {}
                },
                originalStyle: {}
            },
            layers: annotationsLayerWithCircleFeature
        });
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(UPDATE_NODE);
                expect(actions[1].options.features[0].features[0].style.length).toBe(2);
                done();
            }
        });

        store.dispatch(action);
    });
    /**
    TOFIX:
        . some previous test seems to break this test, uncomment the following check about CLOSE_IDENTIFY when solved.
        . update the actions.length check to the proper number.
        . there are 2 CHANGE_DRAWING_STATUS actions that come between CONFIRM_REMOVE_ANNOTATION and UPDATE_NODE
    */
    it('remove annotation', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 6) {
                expect(actions[3].type).toBe(UPDATE_NODE); // if the previous test are commented out this is the first actions
                expect(actions[4].type).toBe(HIDE_MAPINFO_MARKER);
                expect(actions[5].type).toBe(PURGE_MAPINFO_RESULTS);
                // ensure it triggers identify
                // expect(actions.filter(({type}) => type === CLOSE_IDENTIFY).length).toBe(1);
                done();
            }
        });
        const action = confirmRemoveAnnotation('1', 'features');
        store.dispatch(action);
    });
    it('remove annotation geometry', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = confirmRemoveAnnotation('1', 'geometry');
        store.dispatch(action);
    });

    it('remove annotation geometry when initial state is not set', (done) => {
        const tempStore = mockStore({
            annotations: {
                editing: {
                    style: {},
                    features: [],
                    type: "FeatureCollection"
                }
            }
        });
        tempStore.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = confirmRemoveAnnotation('1', 'geometry');
        store.dispatch(action);
    });
    it('toggle annotation visibility', (done) => {
        const tempStore = mockStore({
            layers: {
                flat: [
                    {id: "annotations", features: [{properties: {id: '1'}}]}
                ]
            }
        });
        tempStore.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[0].type).toBe("ANNOTATIONS:VISIBILITY");
                expect(actions[1].type).toBe(UPDATE_NODE);
                done();
            }
        });
        const action = toggleVisibilityAnnotation('1');
        store.dispatch(action);
    });
    it('save annotation', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 4) {
                expect(actions[1].type).toBe(UPDATE_NODE);
                expect(actions[2].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[3].type).toBe(CHANGE_LAYER_PROPERTIES);
                done();
            }
        });
        const action = saveAnnotation('1', {}, {});
        store.dispatch(action);
    });
    it('cancel edit annotation', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 3) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[2].type).toBe(CHANGE_LAYER_PROPERTIES);
                done();
            }
        });
        const action = cancelEditAnnotation();
        store.dispatch(action);
    });
    it('highlight', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(UPDATE_NODE);
                done();
            }
        });
        const action = highlight('1');
        store.dispatch(action);
    });
    it('clean highlight', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(UPDATE_NODE);
                done();
            }
        });
        const action = cleanHighlight('1');
        store.dispatch(action);
    });
    it('clean highlight without layer', (done) => {
        const state = {
            annotations: {
                editing: {
                    style: {}
                },
                originalStyle: {}
            },
            layers: {
                flat: []
            }
        };
        testEpic(addTimeoutEpic(cleanHighlightAnnotationEpic, 88), 1, cleanHighlight('1'), actions => {
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
        }, state);
    });
    it('export annotations fail', (done) => {
        const state = {
            layers: {
                flat: []
            }
        };
        testEpic(downloadAnnotations, 1, download(), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case "SHOW_NOTIFICATION":
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, state);
    });
    it('load annotations', done => {

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(UPDATE_NODE);
                done();
            }
        });
        const action = loadAnnotations([{ "coordinates": [
            4.6142578125,
            45.67548217560647
        ],
        "type": "Point"
        }]);
        store.dispatch(action);

    });
    it('load annotations and create layer', done => {
        store = mockStore({
            layers: {
                flat: []
            }
        });
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(ADD_LAYER);
                done();
            }
        });
        const action = loadAnnotations([]);
        store.dispatch(action);
    });
    it('when the styler is opened, clicks on the map does not add new points to the feature, styling=true', (done) => {

        let newState = set("annotations.styling", true, defaultState);
        newState = set("annotations.selected", {style: {iconGliph: "comment", iconShape: "square", iconColor: "blue"}}, newState);
        newState = set("draw.drawMethod", "Polygon", newState);

        store = mockStore(
            newState
        );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = toggleStyle({});
        store.dispatch(action);
    });
    it('when the styler is opened, clicks on the map does not add new points to the feature, styling=false', (done) => {
        let newState = set("annotations.styling", true, defaultState);
        newState = set("annotations.selected", {style: {iconGliph: "comment", iconShape: "square", iconColor: "blue"}}, newState);
        newState = set("draw.drawMethod", "Polygon", newState);

        store = mockStore(
            set("annotations.styling", false, newState)
        );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = toggleStyle({});
        store.dispatch(action);

    });
    it('clicked on back from coord editor, should enabled only select ', (done) => {
        store = mockStore(
            set("annotations.styling", false, defaultState)
        );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[1].options.selectEnabled).toBe(true);
                expect(actions[1].options.drawEnabled).toBe(false);
                expect(actions[1].options.editEnabled).toBe(false);
                done();
            }
        });
        const action = resetCoordEditor({});
        store.dispatch(action);

    });
    it('clicked on confirm delete of a feature ', (done) => {
        store = mockStore(
            set("annotations.styling", false, defaultState)
        );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[1].options.selectEnabled).toBe(true);
                expect(actions[1].options.drawEnabled).toBe(false);
                expect(actions[1].options.editEnabled).toBe(false);
                done();
            }
        });
        const action = confirmDeleteFeature();
        store.dispatch(action);

    });
    it('clicked on map adding a point to Circle ', (done) => {
        store = mockStore( defaultState );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const polygonGeom = {
            type: "Polygon",
            coordinates: [[[1, 2]]]
        };
        const feature = {
            type: "Feature",
            geometry: polygonGeom,
            properties: {
                canEdit: true,
                isCircle: true,
                polygonGeom,
                id: "Sdfaf"
            }
        };
        const action = drawingFeatures([feature]);
        store.dispatch(action);

    });
    it('clicked on map adding a point to LineString ', (done) => {
        store = mockStore( defaultState );

        store.subscribe(() => {
            const actions = store.getActions();
            expect(actions[0].type).toBe(DRAWING_FEATURE);
            if (actions.length >= 0) {
                done();
            }
        });
        const lineGeom = {
            type: "LineString",
            coordinates: [[1, 2]]
        };
        const feature = {
            type: "Feature",
            geometry: lineGeom,
            properties: {
                canEdit: true,
                id: "Sdfaf"
            }
        };
        const action = drawingFeatures([feature]);
        store.dispatch(action);

    });
    it('clicked on map selecting a feature LineString ', (done) => {
        store = mockStore( defaultState );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 3) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[2].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = selectFeatures([ft]);
        store.dispatch(action);

    });
    it('changed the radius from the coordinate editor ', (done) => {
        store = mockStore( defaultState );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = changeRadius(500, [[1, 1]]);
        store.dispatch(action);

    });
    it('changed the text from the coordinate editor form', (done) => {
        store = mockStore( defaultState );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = changeText("500", [[1, 1]]);
        store.dispatch(action);
    });
    it('changed the coordinate value of a Polygon with an invalid coord', (done) => {
        let selected = ft;
        const polygonCoords = [[[1, 2], [1, 3], [1, undefined], [1, 5], [1, 2]]];
        selected = set("geometry", {
            type: "Polygon",
            coordinates: polygonCoords
        }, selected);
        selected = set("properties", { id: "Polygon1"}, selected);
        store = mockStore(
            set("annotations.selected", selected, set("annotations.editing.features", defaultState.annotations.editing.features.concat([selected]), defaultState))
        );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[1].features[0].features[1].geometry.coordinates[0].length).toBe(4);
                done();
            }
        });
        const action = changeSelected(polygonCoords, undefined, undefined);
        store.dispatch(action);
    });
    it('changed the coordinate value of a Text with a valid coord', (done) => {
        let selected = ft;
        const textCoords = [1, 3];
        selected = set("geometry", {
            type: "Text",
            coordinates: textCoords
        }, selected);
        selected = set("properties", { id: "text1", isText: true, isValidFeature: true, valueText: "text"}, selected);
        store = mockStore(
            set("annotations.selected", selected, set("annotations.editing.features", defaultState.annotations.editing.features.concat([selected]), defaultState))
        );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[1].features[0].features[1].properties.valueText).toBe("text");
                done();
            }
        });
        const action = changeSelected(textCoords, undefined, "text");
        store.dispatch(action);
    });
    it('changed the coordinate value of a Circle with a valid coord', (done) => {
        let selected = ft;
        const polygonCoords = [[[1, 2], [1, 3], [1, 5], [1, 2]]];
        const polygonGeom = {
            type: "Polygon",
            coordinates: polygonCoords
        };
        selected = set("geometry", polygonGeom, selected);
        selected = set("properties", { id: "text1", radius: 200, center: [2, 2], isCircle: true, polygonGeom}, selected);
        store = mockStore(
            set("annotations.selected", selected, set("annotations.editing.features", defaultState.annotations.editing.features.concat([selected]), defaultState))
        );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[1].features[0].features[1].properties.radius).toBe(200);
                expect(actions[1].features[0].features[1].geometry.type).toBe("Polygon");
                done();
            }
        });
        const action = changeSelected(polygonCoords, 200, undefined);
        store.dispatch(action);
    });
    it('opening annotations closing measure tool', (done) => {
        store = mockStore({
            controls: {
                annotations: {
                    enabled: true
                },
                measure: {
                    enabled: true
                }
            }
        });

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(TOGGLE_CONTROL);
                expect(actions[1].control).toBe("measure");
                done();
            }
        });
        const action = toggleControl("annotations");
        store.dispatch(action);
    });

    it('purgeMapInfoEpic', (done) => {
        let action = purgeMapInfoResults();

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });

        store.dispatch(action);
    });
    it('should safely start drawing annotation when no annotation config provided', (done) => {
        store = mockStore({
            annotations: {
                editing: {
                    features: [{}]
                }
            }
        });

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = startDrawing();
        store.dispatch(action);
    });
    it('openEditorEpic', (done) => {
        let action = openEditor("1");

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 4) {
                expect(actions[1].type).toBe(CLOSE_IDENTIFY);
                expect(actions[2].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[3].type).toBe(SHOW_ANNOTATION);
                done();
            }
        });

        store.dispatch(action);
    });
    it('default styles are loaded on loadDefaultStyles', (done) => {
        store = mockStore({
            annotations: {}
        });
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 5) {
                try {
                    expect(actions[1].type).toBe(LOADING);
                    expect(actions[1].value).toBe(true);
                    expect(actions[2].type).toBe(SET_DEFAULT_STYLE);
                    expect(actions[3].type).toBe(SET_DEFAULT_STYLE);

                    const styleActions = actions.slice(2, 4);
                    const symbol = find(styleActions, {path: 'POINT.symbol'});
                    const marker = find(styleActions, {path: 'POINT.marker'});
                    expect(symbol).toExist();
                    expect(symbol.style).toExist();
                    expect(symbol.style.size).toBe(24);
                    expect(symbol.style.fillColor).toBe('#0000FF');
                    expect(symbol.style.color).toBe('#00FF00');
                    expect(marker).toExist();
                    expect(marker.style).toExist();
                    expect(marker.style).toEqual(STYLE_POINT_MARKER);

                    expect(actions[4].type).toBe(LOADING);
                    expect(actions[4].value).toBe(false);

                    done();
                } catch (e) {
                    done(e);
                }
            }
        });
        mockAxios.onGet('/path/to/symbols/triangle.svg').reply(200, triangleSvg);
        store.dispatch(loadDefaultStyles('triangle', 24, '#0000FF', '#00FF00', '/path/to/symbols/'));
    });
    it('highlightGeometryEpic', (done) => {
        store = mockStore({
            annotations: {
                config: {multiGeometry: false, defaultPointType: 'symbol'},
                editing: {
                    style: {},
                    features: [{...ft, properties: {id: '1'}}],
                    type: "FeatureCollection",
                    properties: {id: "1"}
                },
                styling: false,
                featureType: "Point"
            }
        });
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 3) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[1].status).toBe('clean');
                expect(actions[2].type).toBe(CHANGE_DRAWING_STATUS);
                expect(actions[2].status).toBe('drawOrEdit');
                const [feature] = actions[2].features[0].features;
                expect(feature.style[0].highlight).toBe(true);
                done();
            }
        });
        const action = geometryHighlight("1");
        store.dispatch(action);
    });
});
