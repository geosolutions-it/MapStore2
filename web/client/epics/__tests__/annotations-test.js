/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');

const configureMockStore = require('redux-mock-store').default;
const { createEpicMiddleware, combineEpics } = require('redux-observable');
const {ADD_LAYER, UPDATE_NODE, CHANGE_LAYER_PROPERTIES} = require('../../actions/layers');
const {CHANGE_DRAWING_STATUS, drawingFeatures, DRAWING_FEATURE, selectFeatures} = require('../../actions/draw');
const {set} = require('../../utils/ImmutableUtils');
const {HIDE_MAPINFO_MARKER, PURGE_MAPINFO_RESULTS} = require('../../actions/mapInfo');
const {configureMap} = require('../../actions/config');
// const {TOGGLE_CONTROL} = require('../../actions/controls');
const {editAnnotation, confirmRemoveAnnotation, saveAnnotation, cancelEditAnnotation,
    setStyle, highlight, cleanHighlight, download, loadAnnotations, SET_STYLE, toggleStyle,
    resetCoordEditor, changeRadius, changeText, changeSelected
} = require('../../actions/annotations');
const {TOGGLE_CONTROL, toggleControl} = require('../../actions/controls');
const {addAnnotationsLayerEpic, editAnnotationEpic, removeAnnotationEpic, saveAnnotationEpic, newAnnotationEpic, addAnnotationEpic,
    disableInteractionsEpic, cancelEditAnnotationEpic, startDrawingMultiGeomEpic, endDrawGeomEpic, endDrawTextEpic, cancelTextAnnotationsEpic,
    setStyleEpic, restoreStyleEpic, highlighAnnotationEpic, cleanHighlightAnnotationEpic, closeAnnotationsEpic, confirmCloseAnnotationsEpic,
    downloadAnnotations, onLoadAnnotations, onChangedSelectedFeatureEpic, onBackToEditingFeatureEpic, redrawOnChangeRadiusTextEpic,
    editSelectedFeatureEpic, editCircleFeatureEpic, closeMeasureToolEpic
} = require('../annotations')({});
const rootEpic = combineEpics(addAnnotationsLayerEpic, editAnnotationEpic, removeAnnotationEpic, saveAnnotationEpic, newAnnotationEpic, addAnnotationEpic,
    disableInteractionsEpic, cancelEditAnnotationEpic, startDrawingMultiGeomEpic, endDrawGeomEpic, endDrawTextEpic, cancelTextAnnotationsEpic,
    setStyleEpic, restoreStyleEpic, highlighAnnotationEpic, cleanHighlightAnnotationEpic, closeAnnotationsEpic, confirmCloseAnnotationsEpic,
    downloadAnnotations, onLoadAnnotations, onChangedSelectedFeatureEpic, onBackToEditingFeatureEpic, redrawOnChangeRadiusTextEpic,
    editSelectedFeatureEpic, editCircleFeatureEpic, closeMeasureToolEpic
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
describe('annotations Epics', () => {
    let store;
    const defaultState = {
        annotations: {
            config: {multiGeometry: false},
            editing: {
                style: {},
                features: [ft],
                type: "FeatureCollection"
            },
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
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
    });

    it('set style', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[0].type).toBe(SET_STYLE);
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = setStyle({});
        store.dispatch(action);
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
    it('update annotations layer', (done) => {
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
        const action = editAnnotation('1')(store.dispatch, store.getState);
        store.dispatch(action);
    });
    it('remove annotation', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 8) {
                expect(actions[5].type).toBe(UPDATE_NODE);
                expect(actions[6].type).toBe(HIDE_MAPINFO_MARKER);
                expect(actions[7].type).toBe(PURGE_MAPINFO_RESULTS);
                done();
            }
        });
        const action = confirmRemoveAnnotation('1');
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
        const action = confirmRemoveAnnotation('geometry');
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
    /*it('start drawing marker', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = toggleAdd();
        store.dispatch(action);
    });*/
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
        store = mockStore(
            set("annotations.styling", true, defaultState)
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
        store = mockStore(
            set("annotations.styling", false, defaultState)
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
            set("annotations.selected", selected, set("annotations.editing.features", defaultState.annotations.editing.features.concat(selected), defaultState))
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
        selected = set("properties", { id: "text1", isText: true, valueText: "text"}, selected);
        store = mockStore(
            set("annotations.selected", selected, set("annotations.editing.features", defaultState.annotations.editing.features.concat(selected), defaultState))
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
            set("annotations.selected", selected, set("annotations.editing.features", defaultState.annotations.editing.features.concat(selected), defaultState))
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

});
