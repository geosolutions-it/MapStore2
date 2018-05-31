/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const annotations = require('../annotations');
const {DEFAULT_ANNOTATIONS_STYLES} = require('../../utils/AnnotationsUtils');
const {isEmpty} = require('lodash');

const {
    REMOVE_ANNOTATION, CONFIRM_REMOVE_ANNOTATION, CANCEL_REMOVE_ANNOTATION,
    EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION, SAVE_ANNOTATION, TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY, VALIDATION_ERROR, REMOVE_ANNOTATION_GEOMETRY,
    TOGGLE_STYLE, SET_STYLE, NEW_ANNOTATION, SHOW_ANNOTATION, CANCEL_SHOW_ANNOTATION,
    FILTER_ANNOTATIONS, CLOSE_ANNOTATIONS, CONFIRM_CLOSE_ANNOTATIONS, CANCEL_CLOSE_ANNOTATIONS,
    changeStyler, startDrawing, addText, saveText, cancelText, showTextArea, setUnsavedChanges,
    setUnsavedStyle, toggleUnsavedChangesModal, toggleUnsavedStyleModal, changedProperties
 } = require('../../actions/annotations');


let cancelState = {
    config: {multiGeometry: true},
    editing: {
        properties: {
            textValues: [""],
            textGeometriesIndexes: [1]
        },
        geometry: {
            geometries: [{type: "Polygon"}, {type: "MultiPoint"}]
        }
    },
    drawingText: {
        show: true,
        drawing: true
    }
};
describe('Test the annotations reducer', () => {
    it('default states annotations', () => {
        const state = annotations(undefined, {type: 'default'});
        expect(state.validationErrors).toExist();
    });

    it('change styler', () => {
        const state = annotations({}, changeStyler("marker"));
        expect(state.stylerType).toBe("marker");
    });
    it('stop drawing', () => {
        const state = annotations({}, startDrawing());
        expect(state.drawing).toBe(false);
    });
    it('add Text annotation', () => {
        const state = annotations({drawingText: {
            show: true
        }}, addText());
        expect(state.drawingText.drawing).toBe(true);
        expect(state.drawingText.show).toBe(true);
    });
    it('setUnsavedChanges', () => {
        const state = annotations({}, setUnsavedChanges(true));
        expect(state.unsavedChanges).toBe(true);
    });
    it('setUnsavedStyle', () => {
        const state = annotations({}, setUnsavedStyle(true));
        expect(state.unsavedStyle).toBe(true);
    });
    it('toggleUnsavedChangesModal', () => {
        const state = annotations({}, toggleUnsavedChangesModal());
        expect(state.showUnsavedChangesModal).toBe(true);
    });
    it('toggleUnsavedStyleModal', () => {
        const state = annotations({}, toggleUnsavedStyleModal());
        expect(state.showUnsavedStyleModal).toBe(true);
    });
    it('changedProperties', () => {
        const prop = "desc";
        const val = "desc";
        const state = annotations({editedFields: {
            "title": "title"
        }}, changedProperties(prop, val));
        expect(state.editedFields[prop]).toBe(val);
        expect(state.editedFields.title).toBe("title");
    });
    it('save text annotation in empty geom coll', () => {
        const state = annotations({
            editing: {
                properties: {
                    textValues: [""],
                    textGeometriesIndexes: [0]
                }
            },
            drawingText: {
                show: true,
                drawing: true
            }
        }, saveText("my text annotation"));
        expect(state.editing.properties.textValues[0]).toBe("my text annotation");
        expect(state.drawingText.drawing).toBe(false);
        expect(state.drawingText.show).toBe(false);
    });
    it('save text annotation in geom coll with 1 MultiPolygon and 1 MultiLineString', () => {
        const state = annotations({
            editing: {
                properties: {
                    textValues: [""],
                    textGeometriesIndexes: [2]
                },
                geometry: {
                    geometries: [{type: "Polygon"}, {type: "MultiLineString"}, {type: "MultiPoint"}]
                }
            },
            drawingText: {
                show: true,
                drawing: true
            }
        }, saveText("my text annotation"));
        expect(state.editing.properties.textValues[0]).toBe("my text annotation");
        expect(state.editing.properties.textGeometriesIndexes[0]).toBe(2);
        expect(state.drawingText.drawing).toBe(false);
        expect(state.drawingText.show).toBe(false);
    });
    it('save text annotation in geom coll with 1 MultiPolygon and 2 Text annotations', () => {
        const state = annotations({
            editing: {
                properties: {
                    textValues: ["previous text annot value", ""],
                    textGeometriesIndexes: [0, 2]
                },
                geometry: {
                    geometries: [{type: "MultiPoint"}, {type: "Polygon"}, {type: "MultiPoint"}]
                }
            },
            drawingText: {
                show: true,
                drawing: true
            }
        }, saveText("my text annotation"));
        expect(state.editing.properties.textValues[0]).toBe("previous text annot value");
        expect(state.editing.properties.textValues[1]).toBe("my text annotation");
        expect(state.editing.properties.textGeometriesIndexes[0]).toBe(0);
        expect(state.editing.properties.textGeometriesIndexes[1]).toBe(2);
        expect(state.drawingText.drawing).toBe(false);
        expect(state.drawingText.show).toBe(false);
    });
    it('cancel annotations multigeom, removing last Text index property from geom coll (MultiPolygon, MultiPoint)', () => {
        const state = annotations(cancelState, cancelText());
        expect(state.editing.properties.textValues.length).toBe(0);
        expect(state.editing.properties.textGeometriesIndexes.length).toBe(0);
        expect(state.editing.geometry.geometries.length).toBe(1);
        expect(state.drawingText.drawing).toBe(true);
        expect(state.drawingText.show).toBe(false);
    });
    it('cancel annotations multigeom, removing last Text index property from geom coll (MultiPolygon, MultiPoint, MultiPoint)', () => {
        let cancelState2 = {
            config: {multiGeometry: true},
            editing: {
                properties: {
                    textValues: ["aa", ""],
                    textGeometriesIndexes: [1, 2]
                },
                geometry: {
                    geometries: [{type: "Polygon"}, {type: "MultiPoint"}, {type: "MultiPoint"}]
                }
            },
            drawingText: {
                show: true,
                drawing: true
            }
        };
        const state = annotations(cancelState2, cancelText());
        expect(state.editing.properties.textValues.length).toBe(1);
        expect(state.editing.properties.textGeometriesIndexes.length).toBe(1);
        expect(state.editing.geometry.geometries.length).toBe(2);
        expect(state.drawingText.drawing).toBe(true);
        expect(state.drawingText.show).toBe(false);
    });
    it('cancel annotations single geom, removing Text index property)', () => {
        cancelState.config.multiGeometry = false;
        const state = annotations(cancelState, cancelText());
        expect(state.editing.properties.textValues.length).toBe(0);
        expect(state.editing.properties.textGeometriesIndexes.length).toBe(0);
        expect(state.editing.geometry).toBe(null);
        expect(state.drawingText.drawing).toBe(true);
        expect(state.drawingText.show).toBe(false);
    });
    it('remove annotation', () => {
        const state = annotations({}, {
            type: REMOVE_ANNOTATION,
            id: '1'
        });
        expect(state.removing).toBe('1');
    });
    it('show Text Area modal', () => {
        const state = annotations({drawingText: {
            show: false,
            drawing: true
        }}, showTextArea());
        expect(state.drawingText.drawing).toBe(true);
        expect(state.drawingText.show).toBe(true);
    });

    it('confirm remove annotation', () => {
        const state = annotations({removing: '1'}, {
            type: CONFIRM_REMOVE_ANNOTATION,
            id: '1'
        });
        expect(state.removing).toNotExist();
        expect(state.stylerType).toBe("");

    });

    it('confirm remove annotation geometry', () => {
        const state = annotations({
            removing: '1',
            editing: {
                style: {
                    "Circle": {
                        imgGliph: "comment"
                    }
                },
                geometry: {}
            },
            featureType: "Circle"
        }, {
            type: CONFIRM_REMOVE_ANNOTATION,
            id: '1'
        });
        expect(state.removing).toNotExist();
        expect(state.editing).toExist();
        expect(state.editing.geometry).toNotExist();
        expect(state.editing.properties.textValues.length).toBe(0);
        expect(state.editing.properties.textGeometriesIndexes.length).toBe(0);
    });

    it('cancel remove annotation', () => {
        const state = annotations({removing: '1'}, {
            type: CANCEL_REMOVE_ANNOTATION
        });
        expect(state.removing).toNotExist();
    });

    it('edit annotation', () => {
        const state = annotations({}, {
            type: EDIT_ANNOTATION,
            feature: {
                properties: {
                    id: '1'
                },
                geometry: {
                    type: "MultiPolygon"
                }
            }
        });
        expect(state.editing).toExist();
        expect(state.editing.properties.id).toBe('1');
        expect(state.stylerType).toBe("polygon");
    });

    it('cancel edit annotation', () => {
        const state = annotations({editing: {
            properties: {
                id: '1'
            }
        }}, {
            type: CANCEL_EDIT_ANNOTATION
        });
        expect(state.editing).toNotExist();
        expect(state.drawing).toNotExist();
        expect(isEmpty(state.editedFields)).toBe(true);
        expect(state.unsavedChanges).toBe(false);
    });

    it('save annotation', () => {
        const state = annotations({editing: {
            properties: {
                id: '1'
            }
        }, drawing: true, validationErrors: {'title': 'mytitle'}}, {
            type: SAVE_ANNOTATION
        });
        expect(state.editing).toNotExist();
        expect(state.drawing).toNotExist();
        expect(state.validationErrors.title).toNotExist();
        expect(isEmpty(state.editedFields)).toBe(true);
        expect(state.unsavedChanges).toBe(false);
    });

    it('toggle add', () => {
        let state = annotations({
            drawing: false,
            editing: {
                style: {...DEFAULT_ANNOTATIONS_STYLES, type: "MultiPolygon"}
            }}, {
                type: TOGGLE_ADD,
                featureType: "MultiPolygon"
            });
        expect(state.drawing).toBe(true);
        state = annotations({drawing: true, editing: {
            style: {...DEFAULT_ANNOTATIONS_STYLES, type: "MultiPolygon"}
        }}, {
            type: TOGGLE_ADD
        });
        expect(state.drawing).toBe(false);
    });

    it('update annotation geometry', () => {
        const state = annotations({editing: {
            properties: {
                id: '1'
            },
            geometry: null
        }}, {
            type: UPDATE_ANNOTATION_GEOMETRY,
            geometry: {}
        });
        expect(state.editing.geometry).toExist();
    });

    it('validate error', () => {
        const state = annotations({validationErrors: {}}, {
            type: VALIDATION_ERROR,
            errors: {
                'title': 'myerror'
            }
        });
        expect(state.validationErrors.title).toBe('myerror');
    });

    it('remove annotation geometry', () => {
        const state = annotations({removing: null}, {
            type: REMOVE_ANNOTATION_GEOMETRY
        });
        expect(state.removing).toBe('geometry');
        expect(state.unsavedChanges).toBe(true);
    });

    it('toggle style off ', () => {
        const state = annotations({styling: true}, {
            type: TOGGLE_STYLE
        });
        expect(state.styling).toBe(false);
    });

    it('toggle style on ', () => {
        const state = annotations({styling: false, editing: {}}, {
            type: TOGGLE_STYLE
        });
        expect(state.styling).toBe(true);
    });

    it('set style ', () => {
        const state = annotations({styling: false, editing: { style: { type: "MultiPolygon"}}}, {
            type: SET_STYLE,
            style: DEFAULT_ANNOTATIONS_STYLES
        });
        expect(state.editing.style).toExist();
    });

    it('new annotation', () => {
        const state = annotations({editing: null}, {
            type: NEW_ANNOTATION
        });
        expect(state.editing).toExist();
        expect(state.editing.geometry).toBe(null);
        expect(state.originalStyle).toBe(null);
    });

    it('show annotation', () => {
        const state = annotations({}, {
            type: SHOW_ANNOTATION,
            id: '1'
        });
        expect(state.current).toBe('1');
    });

    it('cancel show annotation', () => {
        const state = annotations({}, {
            type: CANCEL_SHOW_ANNOTATION
        });
        expect(state.current).toNotExist();
    });

    it('filter annotations', () => {
        const state = annotations({}, {
            type: FILTER_ANNOTATIONS,
            filter: '1'
        });
        expect(state.filter).toBe('1');
    });

    it('close annotations', () => {
        const state = annotations({}, {
            type: CLOSE_ANNOTATIONS
        });
        expect(state.closing).toBe(true);
    });

    it('confirm close annotations', () => {
        const state = annotations({}, {
            type: CONFIRM_CLOSE_ANNOTATIONS
        });
        expect(state.closing).toBe(false);
    });

    it('cancel close annotations', () => {
        const state = annotations({}, {
            type: CANCEL_CLOSE_ANNOTATIONS
        });
        expect(state.closing).toBe(false);
    });
});
