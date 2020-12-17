/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const INIT_PLUGIN = 'ANNOTATIONS:INIT_PLUGIN';
export const EDIT_ANNOTATION = 'ANNOTATIONS:EDIT';
export const OPEN_EDITOR = 'ANNOTATIONS:OPEN_EDITOR';
export const SHOW_ANNOTATION = 'ANNOTATIONS:SHOW';
export const NEW_ANNOTATION = 'ANNOTATIONS:NEW';
export const REMOVE_ANNOTATION = 'ANNOTATIONS:REMOVE';
export const REMOVE_ANNOTATION_GEOMETRY = 'ANNOTATIONS:REMOVE_GEOMETRY';
export const CONFIRM_REMOVE_ANNOTATION = 'ANNOTATIONS:CONFIRM_REMOVE';
export const CANCEL_REMOVE_ANNOTATION = 'ANNOTATIONS:CANCEL_REMOVE';
export const CANCEL_EDIT_ANNOTATION = 'ANNOTATIONS:CANCEL_EDIT';
export const CANCEL_SHOW_ANNOTATION = 'ANNOTATIONS:CANCEL_SHOW';
export const SAVE_ANNOTATION = 'ANNOTATIONS:SAVE';
export const TOGGLE_ADD = 'ANNOTATIONS:TOGGLE_ADD';
export const TOGGLE_STYLE = 'ANNOTATIONS:TOGGLE_STYLE';
export const SET_STYLE = 'ANNOTATIONS:SET_STYLE';
export const RESTORE_STYLE = 'ANNOTATIONS:RESTORE_STYLE';
export const UPDATE_ANNOTATION_GEOMETRY = 'ANNOTATIONS:UPDATE_GEOMETRY';
export const SET_INVALID_SELECTED = 'ANNOTATIONS:SET_INVALID_SELECTED';
export const VALIDATION_ERROR = 'ANNOTATIONS:VALIDATION_ERROR';
export const HIGHLIGHT = 'ANNOTATIONS:HIGHLIGHT';
export const CLEAN_HIGHLIGHT = 'ANNOTATIONS:CLEAN_HIGHLIGHT';
export const FILTER_ANNOTATIONS = 'ANNOTATIONS:FILTER';
export const CLOSE_ANNOTATIONS = 'ANNOTATIONS:CLOSE';
export const CONFIRM_CLOSE_ANNOTATIONS = 'ANNOTATIONS:CONFIRM_CLOSE';
export const CANCEL_CLOSE_ANNOTATIONS = 'ANNOTATIONS:CANCEL_CLOSE';
export const START_DRAWING = 'ANNOTATIONS:START_DRAWING';
export const UNSAVED_CHANGES = 'ANNOTATIONS:UNSAVED_CHANGES';
export const TOGGLE_ANNOTATION_VISIBILITY = 'ANNOTATIONS:VISIBILITY';
export const TOGGLE_CHANGES_MODAL = 'ANNOTATIONS:TOGGLE_CHANGES_MODAL';
export const TOGGLE_GEOMETRY_MODAL = 'ANNOTATIONS:TOGGLE_GEOMETRY_MODAL';
export const CHANGED_PROPERTIES = 'ANNOTATIONS:CHANGED_PROPERTIES';
export const UNSAVED_STYLE = 'ANNOTATIONS:UNSAVED_STYLE';
export const TOGGLE_STYLE_MODAL = 'ANNOTATIONS:TOGGLE_STYLE_MODAL';
export const ADD_TEXT = 'ANNOTATIONS:ADD_TEXT';
export const DOWNLOAD = 'ANNOTATIONS:DOWNLOAD';
export const LOAD_ANNOTATIONS = 'ANNOTATIONS:LOAD_ANNOTATIONS';
export const CHANGED_SELECTED = 'ANNOTATIONS:CHANGED_SELECTED';
export const RESET_COORD_EDITOR = 'ANNOTATIONS:RESET_COORD_EDITOR';
export const CHANGE_RADIUS = 'ANNOTATIONS:CHANGE_RADIUS';
export const CHANGE_TEXT = 'ANNOTATIONS:CHANGE_TEXT';
export const ADD_NEW_FEATURE = 'ANNOTATIONS:ADD_NEW_FEATURE';
export const SET_EDITING_FEATURE = 'ANNOTATIONS:SET_EDITING_FEATURE';
export const HIGHLIGHT_POINT = 'ANNOTATIONS:HIGHLIGHT_POINT';
export const TOGGLE_DELETE_FT_MODAL = 'ANNOTATIONS:TOGGLE_DELETE_FT_MODAL';
export const CONFIRM_DELETE_FEATURE = 'ANNOTATIONS:CONFIRM_DELETE_FEATURE';
export const CHANGE_FORMAT = 'ANNOTATIONS:CHANGE_FORMAT';
export const UPDATE_SYMBOLS = 'ANNOTATIONS:UPDATE_SYMBOLS';
export const ERROR_SYMBOLS = 'ANNOTATIONS:ERROR_SYMBOLS';
export const SET_DEFAULT_STYLE = 'ANNOTATIONS:SET_DEFAULT_STYLE';
export const LOAD_DEFAULT_STYLES = 'ANNOTATIONS:LOAD_DEFAULT_STYLES';
export const LOADING = 'ANNOTATIONS:LOADING';
export const CHANGE_GEOMETRY_TITLE = 'ANNOTATIONS:CHANGE_GEOMETRY_TITLE';
export const FILTER_MARKER = 'ANNOTATIONS:FILTER_MARKER';
export const HIDE_MEASURE_WARNING = 'ANNOTATIONS:HIDE_MEASURE_WARNING';
export const TOGGLE_SHOW_AGAIN = 'ANNOTATIONS:TOGGLE_SHOW_AGAIN';
export const GEOMETRY_HIGHLIGHT = 'ANNOTATIONS:GEOMETRY_HIGHLIGHT';
export const UNSELECT_FEATURE = 'ANNOTATIONS:UNSELECT_FEATURE';

export const initPlugin = () => ({
    type: INIT_PLUGIN
});

export const updateSymbols = (symbols = []) => ({
    type: UPDATE_SYMBOLS,
    symbols
});
export const setErrorSymbol = (symbolErrors) => ({
    type: ERROR_SYMBOLS,
    symbolErrors
});

export const loadAnnotations = (features, override = false) => {
    return {
        type: LOAD_ANNOTATIONS,
        features,
        override
    };
};
export const confirmDeleteFeature = () => {
    return {
        type: CONFIRM_DELETE_FEATURE
    };
};
export const openEditor = (id) => {
    return {
        type: OPEN_EDITOR,
        id
    };
};
export const changeFormat = (format) => {
    return {
        type: CHANGE_FORMAT,
        format
    };
};
export const toggleDeleteFtModal = () => {
    return {
        type: TOGGLE_DELETE_FT_MODAL
    };
};

export const highlightPoint = (point) => {
    return {
        type: HIGHLIGHT_POINT,
        point
    };
};

export const download = (annotation) => {
    return {
        type: DOWNLOAD,
        annotation
    };
};

import { head } from 'lodash';

export const editAnnotation = (id) => {
    return (dispatch, getState) => {
        const feature = head(head(getState().layers.flat.filter(l => l.id === 'annotations')).features.filter(f => f.properties.id === id));
        if (feature.type === "FeatureCollection") {
            dispatch({
                type: EDIT_ANNOTATION,
                feature,
                featureType: feature.type
            });
        } else {
            dispatch({
                type: EDIT_ANNOTATION,
                feature,
                featureType: feature.geometry.type
            });
        }
    };
};
export const newAnnotation = () => {
    return {
        type: NEW_ANNOTATION
    };
};
export const changeSelected = (coordinates, radius, text, crs) => {
    return {
        type: CHANGED_SELECTED,
        coordinates,
        radius,
        text,
        crs
    };
};
export const setInvalidSelected = (errorFrom, coordinates) => {
    return {
        type: SET_INVALID_SELECTED,
        errorFrom,
        coordinates
    };
};
export const addText = () => {
    return {
        type: ADD_TEXT
    };
};

export const toggleVisibilityAnnotation = (id, visibility) => {
    return {
        type: TOGGLE_ANNOTATION_VISIBILITY,
        id,
        visibility
    };
};

export const changedProperties = (field, value) => {
    return {
        type: CHANGED_PROPERTIES,
        field,
        value
    };
};
export const removeAnnotation = (id) => {
    return {
        type: REMOVE_ANNOTATION,
        id
    };
};
export const removeAnnotationGeometry = (id) => {
    return {
        type: REMOVE_ANNOTATION_GEOMETRY,
        id
    };
};
export const confirmRemoveAnnotation = (id, attribute) => {
    return {
        type: CONFIRM_REMOVE_ANNOTATION,
        id,
        attribute
    };
};
export const cancelRemoveAnnotation = () => {
    return {
        type: CANCEL_REMOVE_ANNOTATION
    };
};
export const cancelEditAnnotation = (properties) => {
    return {
        type: CANCEL_EDIT_ANNOTATION,
        properties
    };
};
export const saveAnnotation = (id, fields, geometry, style, newFeature, properties) => {
    return {
        type: SAVE_ANNOTATION,
        id,
        fields,
        geometry,
        style,
        newFeature,
        properties
    };
};
export const toggleAdd = (featureType) => {
    return {
        type: TOGGLE_ADD,
        featureType
    };
};
export const toggleStyle = (styling) => {
    return {
        type: TOGGLE_STYLE,
        styling
    };
};
export const restoreStyle = () => {
    return {
        type: RESTORE_STYLE
    };
};
export const setStyle = (style) => {
    return {
        type: SET_STYLE,
        style
    };
};
export const updateAnnotationGeometry = (geometry, textChanged, circleChanged) => {
    return {
        type: UPDATE_ANNOTATION_GEOMETRY,
        geometry,
        textChanged,
        circleChanged
    };
};
export const validationError = (errors) => {
    return {
        type: VALIDATION_ERROR,
        errors
    };
};
export const highlight = (id) => {
    return {
        type: HIGHLIGHT,
        id
    };
};
export const cleanHighlight = () => {
    return {
        type: CLEAN_HIGHLIGHT
    };
};
export const showAnnotation = (id) => {
    return {
        type: SHOW_ANNOTATION,
        id
    };
};
export const cancelShowAnnotation = () => {
    return {
        type: CANCEL_SHOW_ANNOTATION
    };
};
export const filterAnnotations = (filter) => {
    return {
        type: FILTER_ANNOTATIONS,
        filter
    };
};
export const closeAnnotations = () => {
    return {
        type: CLOSE_ANNOTATIONS
    };
};
export const confirmCloseAnnotations = (properties) => {
    return {
        type: CONFIRM_CLOSE_ANNOTATIONS,
        properties
    };
};
export const setUnsavedChanges = (unsavedChanges) => {
    return {
        type: UNSAVED_CHANGES,
        unsavedChanges
    };
};
export const setUnsavedStyle = (unsavedStyle) => {
    return {
        type: UNSAVED_STYLE,
        unsavedStyle
    };
};
export const addNewFeature = () => {
    return {
        type: ADD_NEW_FEATURE
    };
};
export const setEditingFeature = (feature) => {
    return {
        type: SET_EDITING_FEATURE,
        feature
    };
};
export const cancelCloseAnnotations = () => {
    return {
        type: CANCEL_CLOSE_ANNOTATIONS
    };
};
export const startDrawing = (options = {}) => {
    return {
        type: START_DRAWING,
        options
    };
};
export const toggleUnsavedChangesModal = () => {
    return {
        type: TOGGLE_CHANGES_MODAL
    };
};
export const toggleUnsavedGeometryModal = () => {
    return {
        type: TOGGLE_GEOMETRY_MODAL
    };
};
export const toggleUnsavedStyleModal = () => {
    return {
        type: TOGGLE_STYLE_MODAL
    };
};
export const resetCoordEditor = () => {
    return {
        type: RESET_COORD_EDITOR
    };
};
export const unSelectFeature = () => {
    return {
        type: UNSELECT_FEATURE
    };
};
export const changeRadius = (radius, components, crs) => {
    return {
        type: CHANGE_RADIUS,
        radius,
        components,
        crs
    };
};

export const changeText = (text, components) => {
    return {
        type: CHANGE_TEXT,
        text,
        components
    };
};

export const setDefaultStyle = (path, style) => ({
    type: SET_DEFAULT_STYLE,
    path,
    style
});

export const loadDefaultStyles = (shape, size, fillColor, strokeColor, symbolsPath) => ({
    type: LOAD_DEFAULT_STYLES,
    shape,
    size,
    fillColor,
    strokeColor,
    symbolsPath
});

export const changeGeometryTitle = (title) => ({
    type: CHANGE_GEOMETRY_TITLE,
    title
});

export const loading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});

export const filterMarker = (filter) => ({
    type: FILTER_MARKER,
    filter
});


export const geometryHighlight = (id, state) => ({
    type: GEOMETRY_HIGHLIGHT,
    id,
    state
});

export const hideMeasureWarning = () => ({
    type: HIDE_MEASURE_WARNING
});

export const toggleShowAgain = () => ({
    type: TOGGLE_SHOW_AGAIN
});
