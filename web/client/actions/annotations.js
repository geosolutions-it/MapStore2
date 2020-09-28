/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const EDIT_ANNOTATION = 'ANNOTATIONS:EDIT';
const OPEN_EDITOR = 'ANNOTATIONS:OPEN_EDITOR';
const SHOW_ANNOTATION = 'ANNOTATIONS:SHOW';
const NEW_ANNOTATION = 'ANNOTATIONS:NEW';
const REMOVE_ANNOTATION = 'ANNOTATIONS:REMOVE';
const REMOVE_ANNOTATION_GEOMETRY = 'ANNOTATIONS:REMOVE_GEOMETRY';
const CONFIRM_REMOVE_ANNOTATION = 'ANNOTATIONS:CONFIRM_REMOVE';
const CANCEL_REMOVE_ANNOTATION = 'ANNOTATIONS:CANCEL_REMOVE';
const CANCEL_EDIT_ANNOTATION = 'ANNOTATIONS:CANCEL_EDIT';
const CANCEL_SHOW_ANNOTATION = 'ANNOTATIONS:CANCEL_SHOW';
const SAVE_ANNOTATION = 'ANNOTATIONS:SAVE';
const TOGGLE_ADD = 'ANNOTATIONS:TOGGLE_ADD';
const TOGGLE_STYLE = 'ANNOTATIONS:TOGGLE_STYLE';
const SET_STYLE = 'ANNOTATIONS:SET_STYLE';
const RESTORE_STYLE = 'ANNOTATIONS:RESTORE_STYLE';
const UPDATE_ANNOTATION_GEOMETRY = 'ANNOTATIONS:UPDATE_GEOMETRY';
const SET_INVALID_SELECTED = 'ANNOTATIONS:SET_INVALID_SELECTED';
const VALIDATION_ERROR = 'ANNOTATIONS:VALIDATION_ERROR';
const HIGHLIGHT = 'ANNOTATIONS:HIGHLIGHT';
const CLEAN_HIGHLIGHT = 'ANNOTATIONS:CLEAN_HIGHLIGHT';
const FILTER_ANNOTATIONS = 'ANNOTATIONS:FILTER';
const CLOSE_ANNOTATIONS = 'ANNOTATIONS:CLOSE';
const CONFIRM_CLOSE_ANNOTATIONS = 'ANNOTATIONS:CONFIRM_CLOSE';
const CANCEL_CLOSE_ANNOTATIONS = 'ANNOTATIONS:CANCEL_CLOSE';
const START_DRAWING = 'ANNOTATIONS:START_DRAWING';
const UNSAVED_CHANGES = 'ANNOTATIONS:UNSAVED_CHANGES';
const TOGGLE_ANNOTATION_VISIBILITY = 'ANNOTATIONS:VISIBILITY';
const TOGGLE_CHANGES_MODAL = 'ANNOTATIONS:TOGGLE_CHANGES_MODAL';
const TOGGLE_GEOMETRY_MODAL = 'ANNOTATIONS:TOGGLE_GEOMETRY_MODAL';
const CHANGED_PROPERTIES = 'ANNOTATIONS:CHANGED_PROPERTIES';
const UNSAVED_STYLE = 'ANNOTATIONS:UNSAVED_STYLE';
const TOGGLE_STYLE_MODAL = 'ANNOTATIONS:TOGGLE_STYLE_MODAL';
const ADD_TEXT = 'ANNOTATIONS:ADD_TEXT';
const DOWNLOAD = 'ANNOTATIONS:DOWNLOAD';
const LOAD_ANNOTATIONS = 'ANNOTATIONS:LOAD_ANNOTATIONS';
const CHANGED_SELECTED = 'ANNOTATIONS:CHANGED_SELECTED';
const RESET_COORD_EDITOR = 'ANNOTATIONS:RESET_COORD_EDITOR';
const CHANGE_RADIUS = 'ANNOTATIONS:CHANGE_RADIUS';
const CHANGE_TEXT = 'ANNOTATIONS:CHANGE_TEXT';
const ADD_NEW_FEATURE = 'ANNOTATIONS:ADD_NEW_FEATURE';
const SET_EDITING_FEATURE = 'ANNOTATIONS:SET_EDITING_FEATURE';
const HIGHLIGHT_POINT = 'ANNOTATIONS:HIGHLIGHT_POINT';
const TOGGLE_DELETE_FT_MODAL = 'ANNOTATIONS:TOGGLE_DELETE_FT_MODAL';
const CONFIRM_DELETE_FEATURE = 'ANNOTATIONS:CONFIRM_DELETE_FEATURE';
const CHANGE_FORMAT = 'ANNOTATIONS:CHANGE_FORMAT';
const UPDATE_SYMBOLS = 'ANNOTATIONS:UPDATE_SYMBOLS';
const ERROR_SYMBOLS = 'ANNOTATIONS:ERROR_SYMBOLS';
const SET_DEFAULT_STYLE = 'ANNOTATIONS:SET_DEFAULT_STYLE';
const LOAD_DEFAULT_STYLES = 'ANNOTATIONS:LOAD_DEFAULT_STYLES';
const LOADING = 'ANNOTATIONS:LOADING';
const CHANGE_GEOMETRY_TITLE = 'ANNOTATIONS:CHANGE_GEOMETRY_TITLE';
const FILTER_MARKER = 'ANNOTATIONS:FILTER_MARKER';

const updateSymbols = (symbols = []) => ({
    type: UPDATE_SYMBOLS,
    symbols
});
const setErrorSymbol = (symbolErrors) => ({
    type: ERROR_SYMBOLS,
    symbolErrors
});

function loadAnnotations(features, override = false) {
    return {
        type: LOAD_ANNOTATIONS,
        features,
        override
    };
}
function confirmDeleteFeature() {
    return {
        type: CONFIRM_DELETE_FEATURE
    };
}
function openEditor(id) {
    return {
        type: OPEN_EDITOR,
        id
    };
}
function changeFormat(format) {
    return {
        type: CHANGE_FORMAT,
        format
    };
}
function toggleDeleteFtModal() {
    return {
        type: TOGGLE_DELETE_FT_MODAL
    };
}

function highlightPoint(point) {
    return {
        type: HIGHLIGHT_POINT,
        point
    };
}

function download(annotation) {
    return {
        type: DOWNLOAD,
        annotation
    };
}

const {head} = require('lodash');

function editAnnotation(id) {
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
}
function newAnnotation() {
    return {
        type: NEW_ANNOTATION
    };
}
function changeSelected(coordinates, radius, text, crs) {
    return {
        type: CHANGED_SELECTED,
        coordinates,
        radius,
        text,
        crs
    };
}
function setInvalidSelected(errorFrom, coordinates) {
    return {
        type: SET_INVALID_SELECTED,
        errorFrom,
        coordinates
    };
}
function addText() {
    return {
        type: ADD_TEXT
    };
}

function toggleVisibilityAnnotation(id) {
    return {
        type: TOGGLE_ANNOTATION_VISIBILITY,
        id
    };
}

function changedProperties(field, value) {
    return {
        type: CHANGED_PROPERTIES,
        field,
        value
    };
}
function removeAnnotation(id) {
    return {
        type: REMOVE_ANNOTATION,
        id
    };
}
function removeAnnotationGeometry(id) {
    return {
        type: REMOVE_ANNOTATION_GEOMETRY,
        id
    };
}
function confirmRemoveAnnotation(id, attribute) {
    return {
        type: CONFIRM_REMOVE_ANNOTATION,
        id,
        attribute
    };
}
function cancelRemoveAnnotation() {
    return {
        type: CANCEL_REMOVE_ANNOTATION
    };
}
function cancelEditAnnotation() {
    return {
        type: CANCEL_EDIT_ANNOTATION
    };
}
function saveAnnotation(id, fields, geometry, style, newFeature, properties) {
    return {
        type: SAVE_ANNOTATION,
        id,
        fields,
        geometry,
        style,
        newFeature,
        properties
    };
}
function toggleAdd(featureType) {
    return {
        type: TOGGLE_ADD,
        featureType
    };
}
function toggleStyle() {
    return {
        type: TOGGLE_STYLE
    };
}
function restoreStyle() {
    return {
        type: RESTORE_STYLE
    };
}
function setStyle(style) {
    return {
        type: SET_STYLE,
        style
    };
}
function updateAnnotationGeometry(geometry, textChanged, circleChanged) {
    return {
        type: UPDATE_ANNOTATION_GEOMETRY,
        geometry,
        textChanged,
        circleChanged
    };
}
function validationError(errors) {
    return {
        type: VALIDATION_ERROR,
        errors
    };
}
function highlight(id) {
    return {
        type: HIGHLIGHT,
        id
    };
}
function cleanHighlight() {
    return {
        type: CLEAN_HIGHLIGHT
    };
}
function showAnnotation(id) {
    return {
        type: SHOW_ANNOTATION,
        id
    };
}
function cancelShowAnnotation() {
    return {
        type: CANCEL_SHOW_ANNOTATION
    };
}
function filterAnnotations(filter) {
    return {
        type: FILTER_ANNOTATIONS,
        filter
    };
}
function closeAnnotations() {
    return {
        type: CLOSE_ANNOTATIONS
    };
}
function confirmCloseAnnotations() {
    return {
        type: CONFIRM_CLOSE_ANNOTATIONS
    };
}
function setUnsavedChanges(unsavedChanges) {
    return {
        type: UNSAVED_CHANGES,
        unsavedChanges
    };
}
function setUnsavedStyle(unsavedStyle) {
    return {
        type: UNSAVED_STYLE,
        unsavedStyle
    };
}
function addNewFeature() {
    return {
        type: ADD_NEW_FEATURE
    };
}
function setEditingFeature(feature) {
    return {
        type: SET_EDITING_FEATURE,
        feature
    };
}
function cancelCloseAnnotations() {
    return {
        type: CANCEL_CLOSE_ANNOTATIONS
    };
}
function startDrawing() {
    return {
        type: START_DRAWING
    };
}
function toggleUnsavedChangesModal() {
    return {
        type: TOGGLE_CHANGES_MODAL
    };
}
function toggleUnsavedGeometryModal() {
    return {
        type: TOGGLE_GEOMETRY_MODAL
    };
}
function toggleUnsavedStyleModal() {
    return {
        type: TOGGLE_STYLE_MODAL
    };
}
function resetCoordEditor() {
    return {
        type: RESET_COORD_EDITOR
    };
}
function changeRadius(radius, components, crs) {
    return {
        type: CHANGE_RADIUS,
        radius,
        components,
        crs
    };
}

function changeText(text, components) {
    return {
        type: CHANGE_TEXT,
        text,
        components
    };
}

const setDefaultStyle = (path, style) => ({
    type: SET_DEFAULT_STYLE,
    path,
    style
});

const loadDefaultStyles = (shape, size, fillColor, strokeColor, symbolsPath) => ({
    type: LOAD_DEFAULT_STYLES,
    shape,
    size,
    fillColor,
    strokeColor,
    symbolsPath
});

const changeGeometryTitle = (title) => ({
    type: CHANGE_GEOMETRY_TITLE,
    title
});

const loading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});

const filterMarker = (filter) => ({
    type: FILTER_MARKER,
    filter
});

module.exports = {
    SHOW_ANNOTATION,
    EDIT_ANNOTATION,
    NEW_ANNOTATION,
    REMOVE_ANNOTATION,
    CONFIRM_REMOVE_ANNOTATION,
    CANCEL_REMOVE_ANNOTATION,
    CANCEL_EDIT_ANNOTATION,
    SAVE_ANNOTATION,
    TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY,
    VALIDATION_ERROR,
    REMOVE_ANNOTATION_GEOMETRY,
    TOGGLE_STYLE,
    SET_STYLE,
    RESTORE_STYLE,
    HIGHLIGHT,
    CLEAN_HIGHLIGHT,
    CANCEL_SHOW_ANNOTATION,
    FILTER_ANNOTATIONS,
    CLOSE_ANNOTATIONS,
    CONFIRM_CLOSE_ANNOTATIONS,
    CANCEL_CLOSE_ANNOTATIONS,
    START_DRAWING, startDrawing,
    UNSAVED_CHANGES, setUnsavedChanges,
    UNSAVED_STYLE, setUnsavedStyle,
    TOGGLE_ANNOTATION_VISIBILITY, toggleVisibilityAnnotation,
    TOGGLE_CHANGES_MODAL, toggleUnsavedChangesModal,
    TOGGLE_STYLE_MODAL, toggleUnsavedStyleModal,
    CHANGED_PROPERTIES, changedProperties,
    ADD_TEXT, addText,
    editAnnotation,
    newAnnotation,
    removeAnnotation,
    confirmRemoveAnnotation,
    cancelRemoveAnnotation,
    cancelEditAnnotation,
    saveAnnotation,
    toggleAdd,
    updateAnnotationGeometry,
    validationError,
    removeAnnotationGeometry,
    toggleStyle,
    setStyle,
    restoreStyle,
    highlight,
    cleanHighlight,
    showAnnotation,
    cancelShowAnnotation,
    filterAnnotations,
    closeAnnotations,
    confirmCloseAnnotations,
    cancelCloseAnnotations,
    DOWNLOAD, download,
    OPEN_EDITOR, openEditor,
    CONFIRM_DELETE_FEATURE, confirmDeleteFeature,
    TOGGLE_DELETE_FT_MODAL, toggleDeleteFtModal,
    HIGHLIGHT_POINT, highlightPoint,
    ADD_NEW_FEATURE, addNewFeature,
    SET_EDITING_FEATURE, setEditingFeature,
    LOAD_ANNOTATIONS, loadAnnotations,
    RESET_COORD_EDITOR, resetCoordEditor,
    CHANGE_TEXT, changeText,
    CHANGE_RADIUS, changeRadius,
    TOGGLE_GEOMETRY_MODAL, toggleUnsavedGeometryModal,
    SET_INVALID_SELECTED, setInvalidSelected,
    CHANGE_FORMAT, changeFormat,
    CHANGED_SELECTED, changeSelected,
    UPDATE_SYMBOLS, updateSymbols,
    ERROR_SYMBOLS, setErrorSymbol,
    SET_DEFAULT_STYLE, setDefaultStyle,
    LOAD_DEFAULT_STYLES, loadDefaultStyles,
    LOADING, loading,
    CHANGE_GEOMETRY_TITLE, changeGeometryTitle,
    FILTER_MARKER, filterMarker
};
