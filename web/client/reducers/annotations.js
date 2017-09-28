/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');

const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');
const {TOGGLE_CONTROL} = require('../actions/controls');
const {REMOVE_ANNOTATION, CONFIRM_REMOVE_ANNOTATION, CANCEL_REMOVE_ANNOTATION, CLOSE_ANNOTATIONS,
        CONFIRM_CLOSE_ANNOTATIONS, CANCEL_CLOSE_ANNOTATIONS,
        EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION, SAVE_ANNOTATION, TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY, VALIDATION_ERROR, REMOVE_ANNOTATION_GEOMETRY, TOGGLE_STYLE,
    SET_STYLE, NEW_ANNOTATION, SHOW_ANNOTATION, CANCEL_SHOW_ANNOTATION, FILTER_ANNOTATIONS} = require('../actions/annotations');

const uuid = require('uuid');
const defaultMarker = {
    iconGlyph: 'comment',
    iconColor: 'blue',
    iconShape: 'square'
};

function annotations(state = { validationErrors: {} }, action) {
    switch (action.type) {
        case REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: action.id
            });
        case REMOVE_ANNOTATION_GEOMETRY:
            return assign({}, state, {
                removing: 'geometry'
            });
        case EDIT_ANNOTATION:
            return assign({}, state, {
                editing: assign({}, action.feature, {
                    style: action.feature.style || defaultMarker
                }),
                originalStyle: null,
                featureType: action.featureType
            });
        case NEW_ANNOTATION:
            const id = uuid.v1();
            return assign({}, state, {
                editing: {
                    type: "Feature",
                    id,
                    geometry: null,
                    newFeature: true,
                    properties: {
                        id
                    },
                    style: defaultMarker
                },
                originalStyle: null,
                featureType: action.featureType
            });
        case CONFIRM_REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: null,
                current: null,
                editing: state.editing ? assign({}, state.editing, {
                    geometry: null
                }) : null
            });
        case CANCEL_REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: null
            });
        case CLOSE_ANNOTATIONS:
            return assign({}, state, {
                closing: true
            });
        case CONFIRM_CLOSE_ANNOTATIONS:
        case CANCEL_CLOSE_ANNOTATIONS:
            return assign({}, state, {
                closing: false
            });
        case CANCEL_EDIT_ANNOTATION:
            return assign({}, state, {
                editing: null,
                drawing: false,
                styling: false,
                originalStyle: null,
                validationErrors: {}
            });
        case SAVE_ANNOTATION:
            return assign({}, state, {
                editing: null,
                drawing: false,
                styling: false,
                originalStyle: null,
                validationErrors: {}
            });
        case PURGE_MAPINFO_RESULTS:
            return assign({}, state, {
                editing: null,
                removing: null,
                validationErrors: {},
                styling: false,
                drawing: false,
                originalStyle: null,
                filter: null
            });
        case UPDATE_ANNOTATION_GEOMETRY:
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    geometry: action.geometry
                })
            });
        case TOGGLE_ADD:
            return assign({}, state, {
                drawing: !state.drawing
            });
        case TOGGLE_STYLE:
            return assign({}, state, {
                styling: !state.styling
            }, !state.styling ? {
                originalStyle: assign({}, state.editing.style, {
                    highlight: false
                })
            } : {});
        case VALIDATION_ERROR:
            return assign({}, state, {
                validationErrors: action.errors
            });
        case SET_STYLE:
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    style: assign({}, state.editing.style || {}, action.style)
                })
            });
        case SHOW_ANNOTATION:
            return assign({}, state, {
                current: action.id
            });
        case CANCEL_SHOW_ANNOTATION:
            return assign({}, state, {
                current: null
            });
        case TOGGLE_CONTROL:
            if (action.control === 'annotations') {
                return assign({}, state, {
                    current: null,
                    editing: null,
                    removing: null,
                    validationErrors: {},
                    styling: false,
                    drawing: false,
                    filter: null,
                    originalStyle: null
                });
            }
            return state;
        case FILTER_ANNOTATIONS:
            return assign({}, state, {
                filter: action.filter
            });
        default:
            return state;

    }
}

module.exports = annotations;
