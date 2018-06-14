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
    VALIDATION_ERROR, REMOVE_ANNOTATION_GEOMETRY,
    TOGGLE_STYLE, SET_STYLE, NEW_ANNOTATION, SHOW_ANNOTATION, CANCEL_SHOW_ANNOTATION,
    FILTER_ANNOTATIONS, CLOSE_ANNOTATIONS, CONFIRM_CLOSE_ANNOTATIONS,
    toggleDeleteFtModal, confirmDeleteFeature,
    changeStyler, addText, setUnsavedChanges, setUnsavedStyle,
    toggleUnsavedChangesModal, toggleUnsavedGeometryModal, toggleUnsavedStyleModal, changedProperties,
    setInvalidSelected, addNewFeature, resetCoordEditor, changeText, changeRadius, changeSelected,
    highlightPoint
 } = require('../../actions/annotations');
const {PURGE_MAPINFO_RESULTS} = require('../../actions/mapInfo');
const {drawingFeatures, selectFeatures} = require('../../actions/draw');

const {toggleControl} = require('../../actions/controls');

const testAllProperty = (state, checkState) => {
    Object.keys(state).forEach( s => {
        if (isEmpty(state[s])) {
            expect(isEmpty(checkState[s])).toBe(true);
        } else {
            expect(state[s]).toBe(checkState[s]);
        }
    });
};

describe('Test the annotations reducer', () => {
    it('default states annotations', () => {
        const state = annotations(undefined, {type: 'default'});
        expect(state.validationErrors).toExist();
    });
    it('toggleDeleteFtModal', () => {
        // toggleDeleteFtModal, confirmDeleteFeature,
        let state = annotations({}, toggleDeleteFtModal());
        expect(state.showDeleteFeatureModal).toBe(true);
        state = annotations(state, toggleDeleteFtModal());
        expect(state.showDeleteFeatureModal).toBe(false);
    });

    it('test activating / deactivating highlight point', () => {
        let point = {lat: 3, lon: 4};
        let state = annotations({}, highlightPoint(point));
        expect(state).toExist();
        expect(state.clickPoint.latlng.lat).toBe(point.lat);
        expect(state.clickPoint.latlng.lng).toBe(point.lon);
        expect(state.showMarker).toBe(true);

        state = annotations({}, highlightPoint());
        expect(state).toExist();
        expect(state.clickPoint).toBe(null);
        expect(state.showMarker).toBe(false);
    });
    it('confirmDeleteFeature', () => {
        const state = annotations({
            selected: {
                properties: {
                    id: "1"
                }
            },
            editing: {
                features: [{
                    properties: {
                        id: "1"
                    }
                }]
            }
        }, confirmDeleteFeature());
        expect(state.editing.features.length).toBe(0);
    });
    it('change styler', () => {
        const state = annotations({}, changeStyler("marker"));
        expect(state.stylerType).toBe("marker");
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
    it('toggleUnsavedGeometryModal', () => {
        let state = annotations({}, toggleUnsavedGeometryModal());
        expect(state.showUnsavedGeometryModal).toBe(false);

        state = annotations({
            unsavedGeometry: true
        }, toggleUnsavedGeometryModal());
        expect(state.showUnsavedGeometryModal).toBe(true);

        state = annotations({
            unsavedGeometry: true,
            showUnsavedGeometryModal: true
        }, toggleUnsavedGeometryModal());
        expect(state.showUnsavedGeometryModal).toBe(false);
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
    it('remove annotation', () => {
        const state = annotations({}, {
            type: REMOVE_ANNOTATION,
            id: '1'
        });
        expect(state.removing).toBe('1');
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
                }
            },
            featureType: "Circle"
        }, {
            type: CONFIRM_REMOVE_ANNOTATION,
            id: '1'
        });
        expect(state.removing).toNotExist();
        expect(state.editing).toExist();
        expect(state.editing.features.length).toBe(0);
    });
    it('cancel remove annotation', () => {
        const state = annotations({removing: '1'}, {
            type: CANCEL_REMOVE_ANNOTATION
        });
        expect(state.removing).toNotExist();
    });
    it('edit annotation', () => {
        const feature = {
            properties: {
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({}, {
            type: EDIT_ANNOTATION,
            feature: featureColl
        });
        expect(state.editing).toExist();
        expect(state.editing.features[0].properties.id).toBe('1');
        expect(state.editing.properties.id).toBe('1asdfads');
        expect(state.stylerType).toBe("marker");
        expect(state.featureType).toBe("Point");
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
                features: [{
                style: {...DEFAULT_ANNOTATIONS_STYLES, type: "Polygon"}
            }]
            }}, {
                type: TOGGLE_ADD,
                featureType: "MultiPolygon"
            });
        expect(state.coordinateEditorEnabled).toBe(true);
        expect(state.drawing).toBe(true);
        state = annotations({drawing: true, editing: {
            features: [{
            style: {...DEFAULT_ANNOTATIONS_STYLES, type: "Polygon"}
        }]
        }}, {
            type: TOGGLE_ADD
        });
        expect(state.drawing).toBe(false);
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
        expect(state.editing.features.length).toBe(0);
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
    it('toggle control for annotations', () => {
        const afterToggleState = {
            current: null,
            editing: null,
            removing: null,
            validationErrors: {},
            styling: false,
            drawing: false,
            filter: null,
            editedFields: {},
            originalStyle: null,
            selected: null
        };
        const state = annotations({}, toggleControl("annotations"));
        testAllProperty(state, afterToggleState);

    });
    it('toggle add Circle', () => {
        let state = annotations({
            drawing: false,
            editing: {
                features: [{
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [0, 2]
                    },
                    properties: {
                        canEdit: false,
                        id: "sadga"
                    }
                }]
            }}, {
                type: TOGGLE_ADD,
                featureType: "Circle"
            });
        expect(state.coordinateEditorEnabled).toBe(true);
        expect(state.selected.properties.isCircle).toBe(true);
        expect(state.selected.properties.isValidFeature).toBe(false);
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.editing.style.type).toBe("Circle");
        expect(state.editing.features.length).toBe(1); // circle is not added to editing features
        expect(state.featureType).toBe("Circle");
        expect(state.drawing).toBe(true);
    });

    it('toggle add Text', () => {
        let state = annotations({
            drawing: false,
            editing: {
                features: [{
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [0, 2]
                    },
                    properties: {
                        canEdit: false,
                        id: "sadga"
                    }
                }]
            }}, {
                type: TOGGLE_ADD,
                featureType: "Text"
            });
        expect(state.coordinateEditorEnabled).toBe(true);
        expect(state.selected.properties.isText).toBe(true);
        expect(state.selected.properties.isValidFeature).toBe(false);
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.editing.style.type).toBe("FeatureCollection");
        expect(state.editing.features.length).toBe(2); // text is added to editing features
        expect(state.editing.features[1].properties.isText).toBe(true);
        expect(state.featureType).toBe("Text");
        expect(state.drawing).toBe(true);
    });
    it('purge map info results', () => {
        const afterToggleState = {
            editing: null,
            removing: null,
            validationErrors: {},
            styling: false,
            drawing: false,
            selected: null,
            originalStyle: null,
            filter: null,
            unsavedChanges: false
        };
        const state = annotations({
            drawing: false
        }, {
            type: PURGE_MAPINFO_RESULTS
        });
        testAllProperty(state, afterToggleState);
    });

    it('edit Text annotation', () => {
        const feature = {
            properties: {
                id: '1',
                isText: true
            },
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({}, {
            type: EDIT_ANNOTATION,
            feature: featureColl
        });
        expect(state.editing).toExist();
        expect(state.editing.features[0].properties.id).toBe('1');
        expect(state.editing.properties.id).toBe('1asdfads');
        expect(state.stylerType).toBe("text");
        expect(state.featureType).toBe("Text");
    });

    it('edit Circle annotation', () => {
        const feature = {
            properties: {
                id: '1',
                isCircle: true
            },
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({}, {
            type: EDIT_ANNOTATION,
            feature: featureColl
        });
        expect(state.editing).toExist();
        expect(state.editing.features[0].properties.id).toBe('1');
        expect(state.editing.properties.id).toBe('1asdfads');
        expect(state.stylerType).toBe("circle");
        expect(state.featureType).toBe("Circle");
    });
    it('setInvalidSelected Circle annotation', () => {
        const feature = {
            properties: {
                id: '1',
                isCircle: true
            },
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const errorFrom = "radius";
        const coordinates = [1, 1];
        const state = annotations({
            editing: featureColl
        }, setInvalidSelected(errorFrom, coordinates));
        expect(state.selected.properties.isValidFeature).toBe(false);
        expect(state.selected.properties.radius).toBe(undefined);
    });

    it('setInvalidSelected Text annotation', () => {
        const feature = {
            properties: {
                id: '1',
                isText: true
            },
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const errorFrom = "text";
        const coordinates = [1, 1];
        const state = annotations({
                editing: featureColl
        }, setInvalidSelected(errorFrom, coordinates));
        expect(state.selected.properties.isValidFeature).toBe(false);
        expect(state.selected.properties.valueText).toBe(undefined);
    });

    it('setInvalidSelected coords annotation', () => {
        const feature = {
            properties: {
                id: '1',
                isText: true
            },
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const errorFrom = "coords";
        const coordinates = [[undefined, 1]];
        const state = annotations({
            editing: featureColl,
            selected: feature
        }, setInvalidSelected(errorFrom, coordinates));
        expect(state.selected.properties.isValidFeature).toBe(false);
        expect(state.selected.geometry.coordinates[0]).toBe(undefined);
        expect(state.selected.geometry.coordinates[1]).toBe(1);
    });
    it('addNewFeature Text feature, new addition', () => {
        const feature = {
            properties: {
                id: '1',
                isText: true
            },
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: feature
        }, addNewFeature(feature));
        expect(state.editing.features[0].properties.isText).toBe(true);
        expect(state.editing.features[0].geometry.coordinates[0]).toBe(1);
        expect(state.editing.features[0].geometry.coordinates[1]).toBe(2);
        expect(state.selected).toBe(null);
    });

    it('addNewFeature Text feature, updating', () => {
        const feature = {
            properties: {
                id: '1',
                isText: true,
                valueText: "new pork"
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };

        const featureUpdated = {
            properties: {
                id: '1',
                isText: true,
                valueText: "new porkss"
            },
            geometry: {
                type: "Point",
                coordinates: [3, 3]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: featureUpdated
        }, addNewFeature(featureUpdated));
        expect(state.editing.features[0].properties.isText).toBe(true);
        expect(state.editing.features[0].properties.canEdit).toBe(false);
        expect(state.editing.features[0].properties.valueText).toBe("new porkss");
        expect(state.editing.features[0].geometry.coordinates[0]).toBe(3);
        expect(state.editing.features[0].geometry.coordinates[1]).toBe(3);
        expect(state.selected).toBe(null);
    });

    it('addNewFeature Circle feature, new addition', () => {
        const feature = {
            properties: {
                id: '1',
                isCircle: true,
                radius: 100,
                polygonGeom: {
                    type: "Polygon",
                    coordinates: [[[1, 2], [3, 2], [4, 2], [1, 2]]] // this should contain 100 points
                }
            },
            geometry: {
                type: "Point",
                coordinates: [[1, 2]]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: feature
        }, addNewFeature(feature));
        expect(state.editing.features[0].properties.isCircle).toBe(true);
        expect(state.editing.features[0].properties.canEdit).toBe(false);
        expect(state.editing.features[0].geometry.type).toBe("Polygon");
        expect(state.editing.features[0].geometry.coordinates[0].length).toBe(4);
        expect(state.selected).toBe(null);
    });

    it('addNewFeature Circle feature, updating', () => {
        const feature = {
            properties: {
                id: '1',
                isCircle: true,
                radius: 100,
                center: [1, 1],
                polygonGeom: {
                    type: "Polygon",
                    coordinates: [[[1, 2], [3, 2], [4, 2], [1, 2]]] // this should contain 100 points
                }
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };

        const featureUpdated = {
            properties: {
                id: '1',
                isCircle: true,
                radius: 5000,
                center: [3, 3],
                polygonGeom: {
                    type: "Polygon",
                    coordinates: [[[1, 2], [3, 2], [4, 2], [1, 2]]] // this should contain 100 points
                }
            },
            geometry: {
                type: "Point",
                coordinates: [3, 3]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: featureUpdated
        }, addNewFeature(featureUpdated));
        expect(state.editing.tempFeatures[0].properties.isCircle).toBe(true);
        expect(state.editing.tempFeatures[0].properties.radius).toBe(5000); // this because tempFeatures === editing.featuers
        expect(state.editing.features[0].properties.isCircle).toBe(true);
        expect(state.editing.features[0].properties.radius).toBe(5000);
        expect(state.editing.features[0].properties.center[0]).toBe(3);
        expect(state.editing.features[0].properties.center[1]).toBe(3);
        expect(state.editing.features[0].geometry.type).toBe("Polygon");
        expect(state.editing.features[0].geometry.coordinates[0].length).toBe(4);
        expect(state.selected).toBe(null);
        expect(state.unsavedGeometry).toBe(false);
        expect(state.drawing).toBe(false);
    });

    it('resetCoordEditor in creation mode of a Point ', () => {
        const feature = {
            properties: {
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: feature,
            unsavedGeometry: false
        }, resetCoordEditor());
        expect(state.unsavedGeometry).toBe(false);
        expect(state.selected).toBe(null);
        expect(state.drawing).toBe(false);
        expect(state.showUnsavedGeometryModal).toBe(false);
        expect(state.editing.features.length).toBe(0);

    });

    it('resetCoordEditor in edit mode of a Point, with no Changes ', () => {
        const feature = {
            properties: {
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const featureChanged = {
            properties: {
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [10, 1]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: featureChanged,
            unsavedGeometry: false
        }, resetCoordEditor());
        expect(state.unsavedGeometry).toBe(false);
        expect(state.selected).toBe(null);
        expect(state.drawing).toBe(false);
        expect(state.showUnsavedGeometryModal).toBe(false);
        expect(state.editing.features.length).toBe(1);
        expect(state.editing.features[0].geometry.coordinates[0]).toBe(1);

    });

    it('resetCoordEditor in edit mode of a Point, with Changes ', () => {
        const feature = {
            properties: {
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const featureChanged = {
            properties: {
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [10, 1]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [featureChanged],
            tempFeatures: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: featureChanged,
            unsavedGeometry: true
        }, resetCoordEditor());
        expect(state.unsavedGeometry).toBe(true);
        expect(state.selected).toBe(null);
        expect(state.drawing).toBe(false);
        expect(state.showUnsavedGeometryModal).toBe(false);
        expect(state.editing.features.length).toBe(1);
        expect(state.editing.features[0].geometry.coordinates[0]).toBe(1);

    });


    it('changeText of an existing feature of type Text', () => {
        const feature = {
            properties: {
                isText: true,
                valueText: "oldTExt",
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const featureChanged = {
            properties: {
                isText: true,
                canEdit: true,
                id: '1',
                valueText: "oldText"
            },
            geometry: {
                type: "Point",
                coordinates: [10, 1]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [featureChanged],
            tempFeatures: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const text = "rest in piece";
        const components = [[1, 0]];
        const state = annotations({
            editing: featureColl,
            selected: featureChanged,
            unsavedGeometry: true
        }, changeText(text, components));
        expect(state.editing.features[0].properties.valueText).toBe(text);
        expect(state.selected.properties.valueText).toBe(text);
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.geometry.coordinates[0]).toBe(1);
        expect(state.selected.geometry.coordinates[1]).toBe(0);
        expect(state.unsavedGeometry).toBe(true);
    });

    it('changeText of a new feature of type Text', () => {
        const valueText = "rest in piece";
        const feature = {
            properties: {
                canEdit: true,
                isText: true,
                valueText,
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [],
            tempFeatures: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const components = [[1, 0]];
        const state = annotations({
            editing: featureColl,
            selected: feature,
            unsavedGeometry: true
        }, changeText(valueText, components));
        expect(state.editing.features[0].properties.valueText).toBe(valueText);
        expect(state.selected.properties.valueText).toBe(valueText);
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.geometry.coordinates[0]).toBe(1);
        expect(state.selected.geometry.coordinates[1]).toBe(0);
        expect(state.unsavedGeometry).toBe(true);
    });

    it('changeRadius of an existing feature of type Circle', () => {
        const feature = {
            properties: {
                isCircle: true,
                radius: 100,
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const featureChanged = {
            properties: {
                isCircle: true,
                canEdit: true,
                id: '1',
                radius: 500
            },
            geometry: {
                type: "Point",
                coordinates: [10, 1]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [featureChanged],
            tempFeatures: [feature],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const radius = 500;
        const components = [[1, 0]];
        const state = annotations({
            editing: featureColl,
            selected: featureChanged,
            unsavedGeometry: true
        }, changeRadius(radius, components));
        expect(state.editing.features[0].properties.radius).toBe(radius);
        expect(state.selected.properties.radius).toBe(radius);
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.geometry.coordinates[0]).toBe(1);
        expect(state.selected.geometry.coordinates[1]).toBe(0);
        expect(state.editing.features[0].geometry.type).toBe("Polygon");
        expect(state.unsavedGeometry).toBe(true);
    });

    it('changeText of a new feature of type Circle', () => {
        const radius = 500;
        const feature = {
            properties: {
                canEdit: true,
                isCircle: true,
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [],
            tempFeatures: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const components = [[1, 0]];
        const state = annotations({
            editing: featureColl,
            selected: feature,
            unsavedGeometry: true
        }, changeRadius(radius, components));
        expect(state.editing.features[0].properties.radius).toBe(radius);
        expect(state.selected.properties.radius).toBe(radius);
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.geometry.coordinates[0]).toBe(1);
        expect(state.selected.geometry.coordinates[1]).toBe(0);
        expect(state.editing.features[0].geometry.type).toBe("Polygon");
        expect(state.unsavedGeometry).toBe(true);
    });
    it('drawingFeatures of a new Point (marker)', () => {
        const feature = {
            properties: {
                canEdit: true,
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const feature2 = {
            properties: {
                canEdit: false,
                id: 'feature2'
            },
            geometry: {
                type: "LineString",
                coordinates: [[1, 1], [1, 2]]
            }
        };

        const featureColl = {
            type: "FeatureCollection",
            features: [feature2],
            tempFeatures: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: feature,
            unsavedGeometry: true
        }, drawingFeatures([feature]));
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.properties.isValidFeature).toBe(true);
        expect(state.editing.features[0].properties.canEdit).toBe(false);
        expect(state.editing.features[1].properties.canEdit).toBe(true);
        expect(state.selected.geometry.coordinates[0]).toBe(1);
    });

    it('drawingFeatures of an existing Point (marker)', () => {
        const feature = {
            properties: {
                canEdit: true,
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const feature2 = {
            properties: {
                canEdit: true,
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [3, 3]
            }
        };

        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            tempFeatures: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: feature,
            unsavedGeometry: true
        }, drawingFeatures([feature2]));
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.properties.isValidFeature).toBe(true);
        expect(state.editing.features[0].properties.canEdit).toBe(true);
        expect(state.editing.features[0].geometry.coordinates[0]).toBe(3);
        expect(state.editing.features[0].geometry.coordinates[1]).toBe(3);
        expect(state.selected.geometry.coordinates[0]).toBe(3);
        expect(state.selected.geometry.coordinates[1]).toBe(3);
    });

    it('drawingFeatures of an existing Circle', () => {
        const feature = {
            properties: {
                isCircle: true,
                canEdit: true,
                center: [1, 1],
                radius: 100,
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const feature2 = {
            properties: {
                isCircle: true,
                canEdit: true,
                center: [4, 4],
                radius: 100,
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [4, 4]
            }
        };

        const featureColl = {
            type: "FeatureCollection",
            features: [feature],
            tempFeatures: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: feature,
            unsavedGeometry: true
        }, drawingFeatures([feature2]));
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.properties.isValidFeature).toBe(true);
        expect(state.editing.features[0].properties.canEdit).toBe(true);
        expect(state.editing.features[0].geometry.coordinates[0]).toBe(4);
        expect(state.editing.features[0].geometry.coordinates[1]).toBe(4);
        expect(state.selected.properties.center[0]).toBe(4);
        expect(state.selected.properties.center[1]).toBe(4);
        expect(state.selected.geometry.coordinates[0]).toBe(4);
        expect(state.selected.geometry.coordinates[1]).toBe(4);
        expect(state.unsavedGeometry).toBe(true);
    });

    it('drawingFeatures of an existing Text', () => {
        const selected = {
            properties: {
                isText: true,
                canEdit: true,
                valueText: "text",
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const feature2 = {
            properties: {
                isText: true,
                canEdit: true,
                valueText: "text",
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [4, 4]
            }
        };

        const featureColl = {
            type: "FeatureCollection",
            features: [selected],
            tempFeatures: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected,
            unsavedGeometry: true
        }, drawingFeatures([feature2]));
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.properties.isValidFeature).toBe(true);
        expect(state.editing.features[0].properties.canEdit).toBe(true);
        expect(state.editing.features[0].geometry.coordinates[0]).toBe(4);
        expect(state.editing.features[0].geometry.coordinates[1]).toBe(4);
        expect(state.selected.geometry.coordinates[0]).toBe(4);
        expect(state.selected.geometry.coordinates[1]).toBe(4);
        expect(state.selected.geometry.type).toBe("Text");
        expect(state.unsavedGeometry).toBe(true);
    });
    it('selectFeatures of a Text Feature', () => {
        const selected = {
            properties: {
                isText: true,
                canEdit: true,
                valueText: "text",
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const feature2 = {
            properties: {
                isText: true,
                canEdit: true,
                valueText: "text",
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [4, 4]
            }
        };

        const featureColl = {
            type: "FeatureCollection",
            features: [selected],
            tempFeatures: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected,
            unsavedGeometry: true
        }, selectFeatures([feature2]));
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.editing.features[0].properties.canEdit).toBe(true);
        expect(state.editing.features[0].geometry.coordinates[0]).toBe(4);
        expect(state.editing.features[0].geometry.coordinates[1]).toBe(4);
        expect(state.selected.geometry.coordinates[0]).toBe(4);
        expect(state.selected.geometry.coordinates[1]).toBe(4);
        expect(state.selected.geometry.type).toBe("Text");
        expect(state.unsavedGeometry).toBe(true);
        expect(state.coordinateEditorEnabled).toBe(true);
    });
    it('changeSelected, changing coords of a Text Feature', () => {
        const selected = {
            properties: {
                isText: true,
                canEdit: true,
                valueText: "text",
                id: '1'
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [selected],
            tempFeatures: [],
            properties: {
                id: '1asdfads'
            },
            style: {}
        };
        const coordinates = [[1, 1]];
        const state = annotations({
            editing: featureColl,
            selected,
            featureType: "Text",
            unsavedGeometry: true
        }, changeSelected(coordinates, null, "text"));
        expect(state.selected.geometry.type).toBe("Point");
        expect(state.featureType).toBe("Text");
        expect(state.selected.geometry.coordinates[0]).toBe(1);
        expect(state.selected.geometry.coordinates[1]).toBe(1);

    });
});
