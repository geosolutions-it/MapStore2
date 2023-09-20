/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    CLOSE_ANNOTATIONS,
    EDIT_ANNOTATION,
    NEW_ANNOTATION,
    CONFIRM_CLOSE_ANNOTATIONS,
    CANCEL_CLOSE_ANNOTATIONS,
    STORE_ANNOTATIONS_SESSION,
    SELECT_ANNOTATION_FEATURE
} from '../actions/annotations';

function annotations(state = {}, action) {
    switch (action.type) {
    case STORE_ANNOTATIONS_SESSION: {
        return {
            ...state,
            session: action.session
        };
    }
    case SELECT_ANNOTATION_FEATURE: {
        return {
            ...state,
            featureId: action.id
        };
    }
    case NEW_ANNOTATION:
    case EDIT_ANNOTATION: {
        return {
            ...state,
            editing: true,
            closeId: 0
        };
    }
    case CLOSE_ANNOTATIONS: {
        return {
            ...state,
            closeId: (state.closeId || 0) + 1
        };
    }
    case CONFIRM_CLOSE_ANNOTATIONS: {
        return {
            ...state,
            editing: false,
            closeId: 0,
            session: null
        };
    }
    case CANCEL_CLOSE_ANNOTATIONS: {
        return {
            ...state,
            closeId: 0
        };
    }
    default:
        return state;

    }
}

export default annotations;
