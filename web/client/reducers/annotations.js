/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');

const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');
const {REMOVE_ANNOTATION, CONFIRM_REMOVE_ANNOTATION, CANCEL_REMOVE_ANNOTATION,
        EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION, SAVE_ANNOTATION, TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY, VALIDATION_ERROR, REMOVE_ANNOTATION_GEOMETRY, TOGGLE_STYLE,
    SET_STYLE} = require('../actions/annotations');

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
                    style: action.feature.style || {
                        iconGlyph: 'comment',
                        iconColor: 'blue',
                        iconShape: 'square'
                    }
                }),
                originalStyle: null
            });
        case CONFIRM_REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: null,
                editing: state.editing ? assign({}, state.editing, {
                    geometry: null
                }) : null
            });
        case CANCEL_REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: null
            });
        case CANCEL_EDIT_ANNOTATION:
            return assign({}, state, {
                editing: null,
                drawing: false,
                styling: false,
                originalStyle: null
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
                originalStyle: null
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
                originalStyle: assign({}, state.editing.style)
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

        default:
            return state;

    }
}

module.exports = annotations;
