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
const {CHANGE_DRAWING_STATUS, geometryChanged, GEOMETRY_CHANGED} = require('../../actions/draw');
const {HIDE_MAPINFO_MARKER, PURGE_MAPINFO_RESULTS} = require('../../actions/mapInfo');
const {configureMap
} = require('../../actions/config');
const {editAnnotation, confirmRemoveAnnotation, saveAnnotation, cancelEditAnnotation, setStyle, highlight, cleanHighlight,
    toggleAdd, UPDATE_ANNOTATION_GEOMETRY, SHOW_TEXT_AREA, cancelText/*, startDrawing*/, download, loadAnnotations
} = require('../../actions/annotations');
const {clickOnMap
} = require('../../actions/map');
const {addAnnotationsLayerEpic, editAnnotationEpic, removeAnnotationEpic, saveAnnotationEpic,
    cancelEditAnnotationEpic, startDrawMarkerEpic, endDrawGeomEpic, setStyleEpic, restoreStyleEpic, highlighAnnotationEpic,
    cleanHighlightAnnotationEpic, addTextEpic, cancelTextAnnotationsEpic, endDrawTextEpic, startDrawingMultiGeomEpic, downloadAnnotations, onLoadAnnotations
} = require('../annotations')({});
const rootEpic = combineEpics(addAnnotationsLayerEpic, editAnnotationEpic, removeAnnotationEpic, saveAnnotationEpic,
    setStyleEpic, cancelEditAnnotationEpic, startDrawMarkerEpic, endDrawGeomEpic, restoreStyleEpic, highlighAnnotationEpic,
    cleanHighlightAnnotationEpic, addTextEpic, cancelTextAnnotationsEpic, endDrawTextEpic, startDrawingMultiGeomEpic, onLoadAnnotations);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

const {testEpic, addTimeoutEpic, TEST_TIMEOUT} = require('./epicTestUtils');

describe('annotations Epics', () => {
    let store;
    beforeEach(() => {
        store = mockStore({
            annotations: {
                config: {multiGeometry: false},
                editing: {
                    style: {},
                    geometry: {
                        type: "Point"
                    }
                },
                drawingText: {
                    drawing: true
                },
                originalStyle: {}
            },
            layers: {
                flat: [{
                    id: 'annotations',
                    features: [{
                        properties: {
                            id: '1'
                        },
                        geometry: {
                            type: "Point"
                        }
                    }]
                }]
            }
        });
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
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
    /*it('stop drawing when dropdownfeature type is opened', (done) => {

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        let action = startDrawing();
        store.dispatch(action);
    });*/

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

    it('start drawing marker', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = toggleAdd();
        store.dispatch(action);
    });

    it('end drawing geom', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(UPDATE_ANNOTATION_GEOMETRY);
                done();
            }
        });
        const action = geometryChanged([], 'annotations', false);
        store.dispatch(action);
    });
    it('saving text annotation', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[0].type).toBe(GEOMETRY_CHANGED);
                expect(actions[1].type).toBe(UPDATE_ANNOTATION_GEOMETRY);
                done();
            }
        });
        const action = geometryChanged([], 'annotations', false, true);
        store.dispatch(action);
    });
    it('cancel text annotation', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = cancelText();
        store.dispatch(action);
    });

    it('set style', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(CHANGE_DRAWING_STATUS);
                done();
            }
        });
        const action = setStyle({});
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

    it('add text epic', (done) => {
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(SHOW_TEXT_AREA);
                done();
            }
        });
        const action = clickOnMap({});
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

});
