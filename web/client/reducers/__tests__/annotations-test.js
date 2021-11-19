/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import annotations from '../annotations';
import { DEFAULT_ANNOTATIONS_STYLES } from '../../utils/AnnotationsUtils';
import { isEmpty, round } from 'lodash';
import { set } from '../../utils/ImmutableUtils';
import { getApi, setApi } from '../../api/userPersistedStorage';

const testFeatures = {
    point1: {
        properties: { id: '1' },
        geometry: { type: "Point", coordinates: [1, 1] }
    },
    point1Changed: {
        properties: {id: '1'},
        geometry: { type: "Point", coordinates: [10, 1]}
    },
    lineString1: {
        properties: { id: 'line1' },
        geometry: { type: "LineString", coordinates: [[1, 1], [3, 3]] }
    }
};

const testValidFeatures = {
    polygon: {
        type: 'Feature',
        geometry: {
            coordinates: [
                [
                    [1, 1],
                    [2, 2],
                    [1, 2],
                    [1, 1]
                ]
            ],
            type: 'Polygon'
        },
        properties: {
            id: '1',
            isValidFeature: true
        },
        style: DEFAULT_ANNOTATIONS_STYLES.Polygon
    },
    line: {
        type: 'Feature',
        geometry: {
            coordinates: [
                [1, 1],
                [1, 2]
            ],
            type: 'LineString'
        },
        properties: {
            id: '2',
            isValidFeature: true,
            canEdit: false
        },
        style: DEFAULT_ANNOTATIONS_STYLES.LineString
    },
    point: {
        type: 'Feature',
        geometry: {
            coordinates: [1, 1],
            type: 'Point'
        },
        properties: {
            id: '3',
            isValidFeature: true,
            canEdit: false
        },
        style: DEFAULT_ANNOTATIONS_STYLES.Point
    },
    text: {
        type: 'Feature',
        geometry: {
            coordinates: [1, 1],
            type: 'Point'
        },
        properties: {
            id: '4',
            isValidFeature: true,
            canEdit: false,
            isText: true,
            valueText: 'New'
        },
        style: DEFAULT_ANNOTATIONS_STYLES.Text
    },
    circle: {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-6, 45]
                ]
            ]
        },
        properties: {
            isCircle: true,
            radius: 50000,
            center: [
                -6,
                45
            ],
            id: '5',
            crs: 'EPSG:3857',
            isGeodesic: true,
            polygonGeom: {
                type: 'Polygon',
                coordinates: [
                    [
                        [
                            -5,
                            45.44966018186227
                        ],
                        [
                            -5.040245511619825,
                            45.44876585012077
                        ],
                        [
                            -5.080328396601316,
                            45.44608646929481
                        ],
                        [
                            -5.120086731957861,
                            45.441632866923904
                        ],
                        [
                            -5.1593599981818405,
                            45.43542303680628
                        ],
                        [
                            -5.197989771457299,
                            45.427482061146456
                        ],
                        [
                            -5.235820404536013,
                            45.41784200215722
                        ],
                        [
                            -5.272699692655688,
                            45.4065417637049
                        ],
                        [
                            -5.308479521010984,
                            45.39362692374563
                        ],
                        [
                            -5.343016490449034,
                            45.37914953845281
                        ],
                        [
                            -5.376172518248709,
                            45.36316791908023
                        ],
                        [
                            -5.40781541105422,
                            45.34574638274048
                        ],
                        [
                            -5.437819407265617,
                            45.3269549784032
                        ],
                        [
                            -5.466065686438008,
                            45.306869189532485
                        ],
                        [
                            -5.492442843504256,
                            45.28556961488434
                        ],
                        [
                            -5.516847325909057,
                            45.263141629076216
                        ],
                        [
                            -5.539183832021936,
                            45.2396750246182
                        ],
                        [
                            -5.559365669479263,
                            45.21526363716062
                        ],
                        [
                            -5.577315072387576,
                            45.190004955765446
                        ],
                        [
                            -5.59296347659886,
                            45.163999720048984
                        ],
                        [
                            -5.606251752540127,
                            45.1373515060707
                        ],
                        [
                            -5.6171303953418725,
                            45.11016630285947
                        ],
                        [
                            -5.625559672260242,
                            45.082552081472535
                        ],
                        [
                            -5.6315097276241515,
                            45.05461835847661
                        ],
                        [
                            -5.634960645759172,
                            45.02647575572444
                        ],
                        [
                            -5.6359024725435924,
                            44.99823555827448
                        ],
                        [
                            -5.6343351964375135,
                            44.97000927226758
                        ],
                        [
                            -5.630268689992574,
                            44.94190818453314
                        ],
                        [
                            -5.623722612997641,
                            44.91404292564889
                        ],
                        [
                            -5.614726278544349,
                            44.886523038124345
                        ],
                        [
                            -5.603318483406369,
                            44.85945655131865
                        ],
                        [
                            -5.589547304217897,
                            44.83294956464031
                        ],
                        [
                            -5.573469861011175,
                            44.807105840508896
                        ],
                        [
                            -5.555152049730721,
                            44.782026408489386
                        ],
                        [
                            -5.534668245384498,
                            44.757809181937965
                        ],
                        [
                            -5.5121009775208725,
                            44.73454858842438
                        ],
                        [
                            -5.487540579736171,
                            44.71233521512217
                        ],
                        [
                            -5.4610848149224624,
                            44.6912554702829
                        ],
                        [
                            -5.4328384779602645,
                            44.67139126183614
                        ],
                        [
                            -5.402912977547861,
                            44.652819694082375
                        ],
                        [
                            -5.37142589883906,
                            44.635612783372125
                        ],
                        [
                            -5.338500548536219,
                            44.619837193591955
                        ],
                        [
                            -5.304265484056409,
                            44.60555399220591
                        ],
                        [
                            -5.268854028357189,
                            44.592818427530354
                        ],
                        [
                            -5.2324037719756475,
                            44.58167972785065
                        ],
                        [
                            -5.195056063801597,
                            44.57218092292017
                        ],
                        [
                            -5.156955492073779,
                            44.56435868831458
                        ],
                        [
                            -5.118249357057942,
                            44.55824321304914
                        ],
                        [
                            -5.079087136838294,
                            44.55385809080196
                        ],
                        [
                            -5.03961994762993,
                            44.55122023502192
                        ],
                        [
                            -5,
                            44.55033981813773
                        ],
                        [
                            -4.96038005237007,
                            44.55122023502192
                        ],
                        [
                            -4.920912863161706,
                            44.55385809080196
                        ],
                        [
                            -4.881750642942057,
                            44.55824321304914
                        ],
                        [
                            -4.84304450792622,
                            44.56435868831458
                        ],
                        [
                            -4.804943936198402,
                            44.57218092292017
                        ],
                        [
                            -4.7675962280243525,
                            44.58167972785065
                        ],
                        [
                            -4.731145971642811,
                            44.592818427530354
                        ],
                        [
                            -4.695734515943591,
                            44.60555399220591
                        ],
                        [
                            -4.661499451463782,
                            44.619837193591955
                        ],
                        [
                            -4.62857410116094,
                            44.635612783372125
                        ],
                        [
                            -4.597087022452139,
                            44.652819694082375
                        ],
                        [
                            -4.5671615220397355,
                            44.67139126183614
                        ],
                        [
                            -4.5389151850775376,
                            44.6912554702829
                        ],
                        [
                            -4.512459420263829,
                            44.71233521512217
                        ],
                        [
                            -4.4878990224791275,
                            44.73454858842438
                        ],
                        [
                            -4.465331754615501,
                            44.757809181937965
                        ],
                        [
                            -4.444847950269279,
                            44.782026408489386
                        ],
                        [
                            -4.426530138988825,
                            44.807105840508896
                        ],
                        [
                            -4.410452695782103,
                            44.83294956464031
                        ],
                        [
                            -4.39668151659363,
                            44.85945655131865
                        ],
                        [
                            -4.385273721455651,
                            44.886523038124345
                        ],
                        [
                            -4.376277387002359,
                            44.91404292564889
                        ],
                        [
                            -4.369731310007426,
                            44.94190818453314
                        ],
                        [
                            -4.3656648035624865,
                            44.97000927226758
                        ],
                        [
                            -4.364097527456407,
                            44.99823555827448
                        ],
                        [
                            -4.365039354240828,
                            45.02647575572444
                        ],
                        [
                            -4.368490272375849,
                            45.05461835847661
                        ],
                        [
                            -4.374440327739758,
                            45.082552081472535
                        ],
                        [
                            -4.3828696046581275,
                            45.11016630285947
                        ],
                        [
                            -4.393748247459873,
                            45.1373515060707
                        ],
                        [
                            -4.407036523401141,
                            45.163999720048984
                        ],
                        [
                            -4.422684927612423,
                            45.190004955765446
                        ],
                        [
                            -4.440634330520736,
                            45.21526363716062
                        ],
                        [
                            -4.460816167978063,
                            45.2396750246182
                        ],
                        [
                            -4.483152674090942,
                            45.263141629076216
                        ],
                        [
                            -4.507557156495745,
                            45.28556961488434
                        ],
                        [
                            -4.533934313561992,
                            45.306869189532485
                        ],
                        [
                            -4.562180592734383,
                            45.3269549784032
                        ],
                        [
                            -4.59218458894578,
                            45.34574638274048
                        ],
                        [
                            -4.623827481751291,
                            45.36316791908023
                        ],
                        [
                            -4.656983509550966,
                            45.37914953845281
                        ],
                        [
                            -4.691520478989017,
                            45.39362692374563
                        ],
                        [
                            -4.727300307344311,
                            45.4065417637049
                        ],
                        [
                            -4.764179595463987,
                            45.41784200215722
                        ],
                        [
                            -4.802010228542701,
                            45.427482061146456
                        ],
                        [
                            -4.8406400018181595,
                            45.43542303680628
                        ],
                        [
                            -4.879913268042139,
                            45.441632866923904
                        ],
                        [
                            -4.919671603398683,
                            45.44608646929481
                        ],
                        [
                            -4.959754488380175,
                            45.44876585012077
                        ],
                        [
                            -5,
                            45.44966018186227
                        ]
                    ]
                ]
            },
            isValidFeature: true,
            canEdit: true
        },
        style: DEFAULT_ANNOTATIONS_STYLES.Circle
    }
};


import {
    REMOVE_ANNOTATION,
    CONFIRM_REMOVE_ANNOTATION,
    CANCEL_REMOVE_ANNOTATION,
    EDIT_ANNOTATION,
    CANCEL_EDIT_ANNOTATION,
    SAVE_ANNOTATION,
    TOGGLE_ADD,
    VALIDATION_ERROR,
    REMOVE_ANNOTATION_GEOMETRY,
    NEW_ANNOTATION,
    SHOW_ANNOTATION,
    CANCEL_SHOW_ANNOTATION,
    FILTER_ANNOTATIONS,
    CLOSE_ANNOTATIONS,
    CONFIRM_CLOSE_ANNOTATIONS,
    CANCEL_CLOSE_ANNOTATIONS,
    toggleDeleteFtModal,
    confirmDeleteFeature,
    addText,
    setUnsavedChanges,
    setUnsavedStyle,
    toggleUnsavedChangesModal,
    toggleUnsavedGeometryModal,
    toggleUnsavedStyleModal,
    changedProperties,
    setInvalidSelected,
    addNewFeature,
    resetCoordEditor,
    changeText,
    changeRadius,
    changeSelected,
    highlightPoint,
    changeFormat,
    toggleStyle,
    setStyle,
    updateSymbols,
    setEditingFeature,
    setDefaultStyle,
    loading,
    changeGeometryTitle,
    filterMarker,
    initPlugin,
    hideMeasureWarning,
    toggleShowAgain,
    unSelectFeature,
    startDrawing,
    validateFeature
} from '../../actions/annotations';

import { PURGE_MAPINFO_RESULTS } from '../../actions/mapInfo';
import { drawingFeatures, selectFeatures } from '../../actions/draw';
import { toggleControl } from '../../actions/controls';

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
    it('changeFormat', () => {
        const format = "aeronautical";
        let state = annotations({}, changeFormat(format));
        expect(state.format).toBe(format);
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
        const state = annotations({removing: '1', editing: {features: [{properties: {id: 2}}]}}, {
            type: CONFIRM_REMOVE_ANNOTATION,
            id: '1'
        });
        expect(state.removing).toNotExist();
        expect(state.stylerType).toBe("");
        expect(state.editing.features).toBeTruthy();

    });
    it('confirm remove annotation geometry', () => {
        const state = annotations({
            removing: '1',
            editing: {
                features: [{properties: {id: '1'}}],
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
                    style: [{...DEFAULT_ANNOTATIONS_STYLES, type: "Polygon"}]
                }]
            }}, {
            type: TOGGLE_ADD,
            featureType: "Polygon"
        });
        expect(state.coordinateEditorEnabled).toBe(true);
        expect(state.stylerType).toBe("polygon");
        expect(state.featureType).toBe("Polygon");
        expect(state.drawing).toBe(true);
        state = annotations({drawing: true, editing: {
            features: [{
                style: [{...DEFAULT_ANNOTATIONS_STYLES, type: "Polygon"}]
            }]
        }}, {
            type: TOGGLE_ADD
        });
        expect(state.drawing).toBe(false);
    });
    it('toggle add text', () => {
        let state = annotations({
            drawing: false,
            editing: {
                features: [{
                    style: [{"Polygon": DEFAULT_ANNOTATIONS_STYLES.Polygon, type: "Polygon"}]
                }]
            }}, {
            type: TOGGLE_ADD,
            featureType: "Text"
        });
        expect(state.coordinateEditorEnabled).toBe(true);
        expect(state.stylerType).toBe("text");
        expect(state.featureType).toBe("Text");
        expect(state.drawing).toBe(true);
    });
    it('toggle add point, check geometry', ()=>{
        let state = annotations({
            editing: {
                features: []
            }}, {
            type: TOGGLE_ADD,
            featureType: "Point"
        });
        expect(state.editing.features[0].geometry).toBe(null);
    });
    it('toggle add text, check geometry', ()=>{
        let state = annotations({
            editing: {
                features: []
            }}, {
            type: TOGGLE_ADD,
            featureType: "Text"
        });
        expect(state.editing.features[0].geometry).toBe(null);
        expect(state.editing.features[0].properties.isText).toBe(true);
    });
    it('toggle add line, check geometry', ()=>{
        let state = annotations({
            editing: {
                features: []
            }}, {
            type: TOGGLE_ADD,
            featureType: "LineString"
        });
        testAllProperty(state.editing.features[0].geometry, {
            type: "LineString",
            coordinates: []
        });
    });
    it('toggle add polygon, check geometry', ()=>{
        let state = annotations({
            editing: {
                features: []
            }}, {
            type: TOGGLE_ADD,
            featureType: "Polygon"
        });
        testAllProperty(state.editing.features[0].geometry, {
            type: "Polygon",
            coordinates: []
        });
    });
    it('toggle add circle, check geometry', ()=>{
        let state = annotations({
            editing: {
                features: []
            }}, {
            type: TOGGLE_ADD,
            featureType: "Circle"
        });
        expect(state.editing.features[0].geometry.type).toBe("Polygon");
        expect(state.editing.features[0].geometry.coordinates).toEqual([[]]);
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
            type: REMOVE_ANNOTATION_GEOMETRY,
            id: '1'
        });
        expect(state.removing).toBe('1');
        expect(state.unsavedChanges).toBe(true);
    });
    it('toggle style off', () => {
        const selected = {
            properties: {
                isText: true,
                canEdit: true,
                valueText: "text",
                id: '1'
            },
            geometry: {
                type: "LineString",
                coordinates: [1, 1]
            },
            style: [
                {...DEFAULT_ANNOTATIONS_STYLES.LineString, highlight: false},
                {...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: false},
                {...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: false}
            ]
        };
        const annotationsState = annotations({
            styling: true,
            selected: selected,
            editing: {
                features: [selected]
            }}, toggleStyle(false));
        expect(annotationsState.styling).toBe(false);
        annotationsState.selected.style.map(s => {
            expect(s.highlight).toBe(true);
        });
        annotationsState.editing.features[0].style.map(s => {
            expect(s.highlight).toBe(true);
        });
    });
    it('toggle style on', () => {
        const selected = {
            properties: {
                isText: true,
                canEdit: true,
                valueText: "text",
                id: '1'
            },
            geometry: {
                type: "LineString",
                coordinates: [1, 1]
            },
            style: [
                {...DEFAULT_ANNOTATIONS_STYLES.LineString, highlight: true},
                {...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: true},
                {...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: true}
            ]
        };
        const annotationsState = annotations({
            styling: false,
            selected: selected,
            editing: {
                features: [selected]
            }}, toggleStyle(true));
        expect(annotationsState.styling).toBe(true);
        annotationsState.selected.style.map(s => {
            expect(s.highlight).toBe(false);
        });
        annotationsState.editing.features[0].style.map(s => {
            expect(s.highlight).toBe(false);
        });
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
        expect(state.coordinateEditorEnabled).toBe(false);
    });
    it('cancel close annotations', () => {
        const state = annotations({}, {
            type: CANCEL_CLOSE_ANNOTATIONS
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
                    },
                    style: [
                        {"color": "#ffcc33", "highlight": true, "type": "Circle", "id": "sadga"},
                        {"iconGlyph": "comment", "iconShape": "square", "iconColor": "blue", "highlight": true, "type": "Point", "title": "Center Style"}]
                }]
            }}, {
            type: TOGGLE_ADD,
            featureType: "Circle"
        });
        expect(state.coordinateEditorEnabled).toBe(true);
        expect(state.selected.properties.isCircle).toBe(true);
        expect(state.selected.properties.isValidFeature).toBe(false);
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.editing.features.length).toBe(2); // circle is added to editing features
        const styles = state.editing.features[0].style;
        expect(styles[0].highlight).toBe(false); // Reset highlight properties of other features
        expect(styles[1].highlight).toBe(false);
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
            selected: feature,
            editedFields: {title: 'Title1'}
        }, addNewFeature(feature));
        expect(state.editing.features[0].properties.isText).toBe(true);
        expect(state.editing.features[0].geometry.coordinates[0]).toBe(1);
        expect(state.editing.features[0].geometry.coordinates[1]).toBe(2);
        expect(state.editing.properties).toBeTruthy();
        expect(state.editing.properties.id).toBe('1asdfads');
        expect(state.editing.properties.title).toBe('Title1');
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

    it('setEditingFeature', () => {
        const {point1, lineString1} = testFeatures;
        const feature = {
            type: "FeatureCollection",
            features: [point1, lineString1],
            properties: { id: '1asdfads' },
            style: {}
        };
        const state = annotations({
            selected: {},
            originalStyle: null
        }, setEditingFeature(feature));

        expect(state).toExist();
        expect(state.editing).toExist();
        expect(state.editing.type).toBe('FeatureCollection');
        expect(state.editing.properties).toEqual({ id: '1asdfads', canEdit: false });
        expect(state.editing.newFeature).toBe(true);
        expect(state.coordinateEditorEnabled).toBe(false);
        expect(state.drawing).toBe(false);
        expect(state.unsavedGeometry).toBe(false);
        expect(state.selected).toBe(null);
        expect(state.editing.style).toEqual({});
        expect(state.editing.features.length).toBe(2);
        state.editing.features.map((x, i) => {
            expect(x).toEqual(set('properties.canEdit', false, feature.features[i]));
        });
        expect(state.editing.tempFeatures).toEqual(state.editing.features);
    });

    it('resetCoordEditor in creation mode of a Point ', () => {
        const {point1, lineString1} = testFeatures;
        const featureColl = {
            type: "FeatureCollection",
            features: [lineString1, point1],
            tempFeatures: [lineString1],
            properties: { id: '1asdfads' },
            style: {}
        };
        const state = annotations({
            featureType: "Point",
            editing: featureColl,
            selected: point1,
            drawing: true,
            unsavedGeometry: false
        }, resetCoordEditor());
        expect(state.unsavedGeometry).toBe(false);
        expect(state.selected).toBe(null);
        expect(state.drawing).toBe(false);
        expect(state.showUnsavedGeometryModal).toBe(false);
        expect(state.editing.features.length).toBe(1);
        expect(state.editing.features[0].geometry.type).toBe("LineString");

    });

    it('resetCoordEditor in edit mode of a Point, with no Changes ', () => {
        const {point1, point1Changed} = testFeatures;

        const featureColl = {
            type: "FeatureCollection",
            features: [point1],
            tempFeatures: [point1],
            properties: { id: '1asdfads' },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: point1Changed,
            drawing: false,
            unsavedGeometry: false
        }, resetCoordEditor());
        expect(state.unsavedGeometry).toBe(false);
        expect(state.selected).toBe(null);
        expect(state.drawing).toBe(false);
        expect(state.showUnsavedGeometryModal).toBe(false);
        expect(state.editing.features.length).toBe(1);

    });

    it('resetCoordEditor in edit mode of a Circle, with no Changes ', () => {

        const featureChanged = {
            properties: {
                id: '1',
                isCircle: true
            },
            geometry: {
                type: "Point",
                coordinates: [10, 1]
            }
        };
        const featureColl = {
            type: "FeatureCollection",
            features: [],
            tempFeatures: [],
            properties: {
                id: '1asdfads'
            },
            featureType: "Circle",
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
        expect(state.editing.features.length).toBe(0);

    });

    it('resetCoordEditor in edit mode of a Point, with Changes ', () => {
        const {point1, point1Changed} = testFeatures;

        const featureColl = {
            type: "FeatureCollection",
            features: [point1Changed],
            tempFeatures: [point1],
            properties: { id: '1asdfads' },
            style: {}
        };
        const state = annotations({
            editing: featureColl,
            selected: point1Changed,
            unsavedGeometry: true
        }, resetCoordEditor());
        expect(state.unsavedGeometry).toBe(false);
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
        expect(state.selected.properties.isValidFeature).toBe(true);
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
                radius: 10000
            },
            geometry: {
                type: "Point",
                coordinates: [1, 1]
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
        const radius = 10000;
        const components = [[1, 1]];
        const state = annotations({
            editing: featureColl,
            selected: featureChanged,
            unsavedGeometry: true
        }, changeRadius(radius, components, "EPSG:3857"));
        expect(state.editing.features[0].properties.radius).toBe(radius);
        expect(state.selected.properties.radius).toBe(radius);
        expect(state.selected.properties.isValidFeature).toBe(true);
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.geometry.coordinates[0]).toBe(1);
        expect(state.selected.geometry.coordinates[1]).toBe(1);
        expect(state.editing.features[0].geometry.type).toBe("Polygon");
        const firstPoint = state.editing.features[0].geometry.coordinates[0][0];
        expect(round(firstPoint[0], 10)).toBe(1);
        expect(round(firstPoint[1], 10)).toBe(1.0899320364);
        expect(state.unsavedGeometry).toBe(true);
    });

    it('changeText of a new feature of type Circle, in 4326', () => {
        const radius = 5;
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
        }, changeRadius(radius, components, "EPSG:4326"));
        expect(state.editing.features[0].properties.radius).toBe(radius);
        expect(state.selected.properties.radius).toBe(radius);
        expect(state.selected.properties.canEdit).toBe(true);
        expect(state.selected.geometry.coordinates[0]).toBe(1);
        expect(state.selected.geometry.coordinates[1]).toBe(0);
        expect(state.editing.features[0].geometry.type).toBe("Polygon");
        const firstPoint = state.editing.features[0].geometry.coordinates[0][0];
        expect(round(firstPoint[0], 10)).toBe(1);
        expect(round(firstPoint[1], 10)).toBe(5.0058419746);

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
    it('changeSelected, changing coords of a Circle Feature', () => {
        const selected = {
            properties: {
                canEdit: true,
                center: [-6.576492309570317, 41.6007838467891],
                id: "259d79d0-053e-11ea-b0b3-379d853a3ff4",
                isCircle: true,
                isValidFeature: true,
                radius: 3567
            },
            geometry: {
                type: "Circle",
                coordinates: [-6.576492309570317, 41.6007838467891]
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
        }, changeSelected(coordinates, 3567, null, "EPSG:3857"));
        expect(state.selected.geometry.type).toBe("Circle");
        expect(state.selected.geometry.coordinates[0]).toBe(1);
        expect(state.selected.geometry.coordinates[1]).toBe(1);
        let firstPoint = state.selected.properties.polygonGeom.coordinates[0][0];
        expect(round(firstPoint[0], 10)).toBe(1);
        expect(round(firstPoint[1], 10)).toBe(1.0320787574);

        // testing also with radius in deg
        const state2 = annotations({
            editing: featureColl,
            selected: {...selected, properties: {...selected.properties, radius: 3}},
            featureType: "Text",
            unsavedGeometry: true
        }, changeSelected(coordinates, 3567, null, "EPSG:4326"));
        expect(state2.selected.geometry.coordinates[0]).toBe(1);
        expect(state2.selected.geometry.coordinates[1]).toBe(1);
        firstPoint = state2.selected.properties.polygonGeom.coordinates[0][0];
        expect(round(firstPoint[0], 10)).toBe(1);
        expect(round(firstPoint[1], 10)).toBe(-27.8323353334);
    });

    it('changeSelected, Selected Properties for Circle Feature with Radius and Radius Undefined', () => {
        const selected = {
            properties: {
                canEdit: true,
                center: [-6.576492309570317, 41.6007838467891],
                id: "259d79d0-053e-11ea-b0b3-379d853a3ff4",
                isCircle: true,
                isValidFeature: true
            },
            geometry: {
                type: "Circle",
                coordinates: [-6.576492309570317, 41.6007838467891]
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
        // with defined radius
        const state = annotations({
            editing: featureColl,
            selected,
            featureType: "Text",
            unsavedGeometry: true
        }, changeSelected(coordinates, 3567, null, "EPSG:3857"));

        // with undefined radius
        const state2 = annotations({
            editing: featureColl,
            selected: {...selected, properties: {...selected.properties}},
            featureType: "Text",
            unsavedGeometry: true
        }, changeSelected(coordinates, undefined, null, "EPSG:4326"));

        expect(state.selected.properties).toNotEqual(state2.selected.properties);
    });
    it('UPDATE_SYMBOLS', () => {
        let annotationsState = annotations({}, updateSymbols());
        expect(annotationsState.symbolList.length).toBe(0);

        annotationsState = annotations({}, updateSymbols([{
            value: "pink",
            name: "pink",
            symbolUrl: "path/pink.svg"
        }]));
        expect(annotationsState.symbolList.length).toBe(1);
        expect(annotationsState.symbolList[0].value).toBe("pink");

        annotationsState = annotations({
            symbolList: [{
                value: "circle",
                name: "circle",
                symbolUrl: "path/circle.svg"
            }]
        }, updateSymbols([{
            value: "exagon",
            name: "exagon",
            symbolUrl: "path/exagon.svg"
        }]));
        expect(annotationsState.symbolList.length).toBe(1);
        expect(annotationsState.symbolList[0].value).toBe("exagon");
    });
    it('UPDATE_SYMBOLS', () => {
        let annotationsState = annotations({}, updateSymbols());
        expect(annotationsState.symbolList.length).toBe(0);

        annotationsState = annotations({}, updateSymbols([{
            value: "pink",
            name: "pink",
            symbolUrl: "path/pink.svg"
        }]));
        expect(annotationsState.symbolList.length).toBe(1);
        expect(annotationsState.symbolList[0].value).toBe("pink");

        annotationsState = annotations({
            symbolList: [{
                value: "circle",
                name: "circle",
                symbolUrl: "path/circle.svg"
            }]
        }, updateSymbols([{
            value: "exagon",
            name: "exagon",
            symbolUrl: "path/exagon.svg"
        }]));
        expect(annotationsState.symbolList.length).toBe(1);
        expect(annotationsState.symbolList[0].value).toBe("exagon");
    });

    it('TOGGLE_CONTROL, not annotations', () => {
        // original state returned
        let annotationsState = annotations({
            editing: null,
            selected: null
        }, toggleControl("queryform"));
        expect(annotationsState.editing).toBe(null);
        expect(annotationsState.selected).toBe(null);
    });
    it('SET_STYLE updating selected feature', () => {
        let annotationsState = annotations({
            editing: null,
            selected: {
                properties: {
                    isText: true,
                    canEdit: true,
                    valueText: "text",
                    id: '1'
                },
                geometry: {
                    type: "LineString",
                    coordinates: [1, 1]
                },
                style: [
                    {...DEFAULT_ANNOTATIONS_STYLES.LineString},
                    {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: false},
                    {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: false}
                ]
            }
        }, setStyle([
            {...DEFAULT_ANNOTATIONS_STYLES.LineString},
            {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: true},
            {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: false}]
        ));
        expect(annotationsState.selected.style[1].filtering).toBe(true);
    });
    it('SET_STYLE updating selected feature and the one in the editing fcoll', () => {
        const selected = {
            properties: {
                isText: true,
                canEdit: true,
                valueText: "text",
                id: '1'
            },
            geometry: {
                type: "LineString",
                coordinates: [1, 1]
            },
            style: [
                {...DEFAULT_ANNOTATIONS_STYLES.LineString},
                {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: false},
                {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: false}
            ]
        };
        let annotationsState = annotations({
            editing: {
                features: [selected, {...selected, properties: {...selected.properties, id: "2"}}]
            },
            selected
        }, setStyle([
            {...DEFAULT_ANNOTATIONS_STYLES.LineString},
            {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: true},
            {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: false}]
        ));
        expect(annotationsState.selected.style[1].filtering).toBe(true);
        expect(annotationsState.editing.features[0].style[1].filtering).toBe(true);
        expect(annotationsState.editing.features[0].style[2].filtering).toBe(false);
        expect(annotationsState.editing.features[1].style[1].filtering).toBe(false);
        expect(annotationsState.editing.features[1].style[2].filtering).toBe(false);
    });
    it('setDefaultStyle', () => {
        const state = annotations({}, setDefaultStyle('POINT.symbol', {size: 64}));
        expect(state.defaultStyles?.POINT?.symbol).toEqual({size: 64});
    });
    it('loading', () => {
        const state = annotations({}, loading(true, 'loadingFlag'));
        expect(state.loading).toBe(true);
        expect(state.loadFlags).toEqual({loadingFlag: true});
    });
    it('Change geometry title', ()=>{
        const state = annotations({
            editing: {features: [{properties: {id: '1', geometryTitle: ""}}]},
            selected: {properties: {id: '1', geometryTitle: ""}}}, changeGeometryTitle("New title"));
        expect(state.selected).toBeTruthy();
        expect(state.selected.properties.geometryTitle).toBe('New title');
    });
    it('Change marker filter option', ()=>{
        const state = annotations({
            config: {"config1": 1}
        }, filterMarker("glass"));
        expect(state.config).toBeTruthy();
        expect(state.config.filter).toBe('glass');
    });
    it('Hide measure warning', ()=>{
        const state = annotations({
            config: {"config1": 1}
        }, hideMeasureWarning());
        expect(state.showPopupWarning).toBe(false);
    });
    it('Init plugin', ()=>{
        const state = annotations({
            config: {"config1": 1}
        }, initPlugin());
        const showPopupWarning = getApi().getItem("showPopupWarning") !== null ? getApi().getItem("showPopupWarning") === "true" : true;
        expect(state.showPopupWarning).toBe(showPopupWarning);
    });
    it('Init plugin with accessDenied', ()=>{
        setApi("memoryStorage");
        const api = getApi();
        api.setAccessDenied(true);
        const state = annotations({
            config: {"config1": 1}
        }, initPlugin());
        expect(state).toEqual({config: {"config1": 1}});
        api.setAccessDenied(false);
        setApi("localStorage");
    });
    it('toggleShowAgain', ()=>{
        const state = annotations({
            config: {"config1": 1}
        }, toggleShowAgain(false));
        expect(state.showAgain).toBeTruthy();
        expect(state.showAgain).toBe(true);
    });
    it('unSelectFeature', ()=>{
        const selected = {
            properties: {
                isText: true,
                canEdit: true,
                valueText: "text",
                id: '1'
            },
            geometry: {
                type: "LineString",
                coordinates: [1, 1]
            },
            style: [
                {...DEFAULT_ANNOTATIONS_STYLES.LineString},
                {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: false},
                {...DEFAULT_ANNOTATIONS_STYLES.Point, filtering: false}
            ]
        };
        const state = annotations({
            editing: {
                features: [selected, {...selected, properties: {...selected.properties, id: "2"}}]
            },
            selected
        }, unSelectFeature());
        expect(state.drawing).toBe(false);
        expect(state.coordinateEditorEnabled).toBe(false);
        expect(state.unsavedGeometry).toBe(false);
        expect(state.selected).toBeFalsy();
        expect(state.showUnsavedGeometryModal).toBe(false);
        const features = state.editing.features;
        expect(features[0].properties.canEdit).toBe(false);
        expect(features[1].properties.canEdit).toBe(false);
    });
    it('START_DRAWING', () => {
        let annotationsState = annotations({
            editing: null,
            selected: null
        }, startDrawing({geodesic: true}));
        expect(annotationsState.config).toBeTruthy();
        expect(annotationsState.config.geodesic).toBe(true);
    });
    it('validate features - valid geometries', () => {
        const features = Object.values(testValidFeatures);
        let state = annotations({
            editing: {
                features
            },
            selected: null
        }, validateFeature());
        expect(state.editing.features[0].properties.isValidFeature).toBe(true);
        expect(state.editing.features[1].properties.isValidFeature).toBe(true);
        expect(state.editing.features[2].properties.isValidFeature).toBe(true);
        expect(state.editing.features[3].properties.isValidFeature).toBe(true);
        expect(state.editing.features[4].properties.isValidFeature).toBe(true);
    });
    it('validate features - invalid geometries', () => {
        const features = Object.values(testValidFeatures);
        features[0].geometry.coordinates = [
            [
                [1, null]
            ]
        ];
        features[1].geometry.coordinates = [
            [
                [1, null]
            ]
        ];
        features[2].geometry.coordinates = [1, null];
        features[3].geometry.coordinates = [1, null];
        features[4].geometry.coordinates = [
            [
                [1, null]
            ]
        ];
        features[4].properties.center = [null, 45];
        features[4].properties.radius = null;
        let state = annotations({
            editing: {
                features
            },
            selected: null
        }, validateFeature());
        expect(state.editing.features[0].properties.isValidFeature).toBe(false);
        expect(state.editing.features[1].properties.isValidFeature).toBe(false);
        expect(state.editing.features[2].properties.isValidFeature).toBe(false);
        expect(state.editing.features[3].properties.isValidFeature).toBe(false);
        expect(state.editing.features[4].properties.isValidFeature).toBe(false);
    });
    it('validate features - invalid text, missing coordinates', () => {
        const features = [testValidFeatures.text];
        features[0].geometry.coordinates = [1, null];
        let state = annotations({
            editing: {
                features
            },
            selected: null
        }, validateFeature());
        expect(state.editing.features[0].properties.isValidFeature).toBe(false);
    });
    it('validate features - invalid text, missing text value', () => {
        const features = [testValidFeatures.text];
        features[0].properties.valueText = null;
        let state = annotations({
            editing: {
                features
            },
            selected: null
        }, validateFeature());
        expect(state.editing.features[0].properties.isValidFeature).toBe(false);
    });
    it('validate features - invalid circle, missing radius', () => {
        const features = [testValidFeatures.circle];
        features[0].properties.radius = null;
        let state = annotations({
            editing: {
                features
            },
            selected: null
        }, validateFeature());
        expect(state.editing.features[0].properties.isValidFeature).toBe(false);
    });
    it('validate features - invalid circle, missing center', () => {
        const features = [testValidFeatures.circle];
        features[0].geometry.coordinates = [
            [
                [null, 45]
            ]
        ];
        features[0].properties.center = [null, 45];
        let state = annotations({
            editing: {
                features
            },
            selected: null
        }, validateFeature());
        expect(state.editing.features[0].properties.isValidFeature).toBe(false);
    });

});
