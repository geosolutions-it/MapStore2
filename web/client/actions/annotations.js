/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const EDIT_ANNOTATION = 'ANNOTATIONS:EDIT';
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
const VALIDATION_ERROR = 'ANNOTATIONS:VALIDATION_ERROR';
const HIGHLIGHT = 'ANNOTATIONS:HIGHLIGHT';
const CLEAN_HIGHLIGHT = 'ANNOTATIONS:CLEAN_HIGHLIGHT';
const FILTER_ANNOTATIONS = 'ANNOTATIONS:FILTER';
const CLOSE_ANNOTATIONS = 'ANNOTATIONS:CLOSE';
const CONFIRM_CLOSE_ANNOTATIONS = 'ANNOTATIONS:CONFIRM_CLOSE';
const CANCEL_CLOSE_ANNOTATIONS = 'ANNOTATIONS:CANCEL_CLOSE';
const STOP_DRAWING = 'ANNOTATIONS:STOP_DRAWING';
const CHANGE_STYLER = 'ANNOTATIONS:CHANGE_STYLER';
const UNSAVED_CHANGES = 'ANNOTATIONS:UNSAVED_CHANGES';
const TOGGLE_CHANGES_MODAL = 'ANNOTATIONS:TOGGLE_CHANGES_MODAL';
const CHANGED_PROPERTIES = 'ANNOTATIONS:CHANGED_PROPERTIES';
const UNSAVED_STYLE = 'ANNOTATIONS:UNSAVED_STYLE';
const TOGGLE_STYLE_MODAL = 'ANNOTATIONS:TOGGLE_STYLE_MODAL';
const SHOW_TEXT_AREA = 'ANNOTATIONS:SHOW_TEXT_AREA';
const ADD_TEXT = 'ANNOTATIONS:ADD_TEXT';
const CANCEL_CLOSE_TEXT = 'ANNOTATIONS:CANCEL_CLOSE_TEXT';
const SAVE_TEXT = 'ANNOTATIONS:SAVE_TEXT';
const DOWNLOAD = 'ANNOTATIONS:DOWNLOAD';
const LOAD_ANNOTATIONS = 'ANNOTATIONS:LOAD_ANNOTATIONS';
const CHANGED_SELECTED = 'ANNOTATIONS:CHANGED_SELECTED';
const RESET_COORD_EDITOR = 'ANNOTATIONS:RESET_COORD_EDITOR';
const CHANGE_RADIUS = 'ANNOTATIONS:CHANGE_RADIUS';
const CHANGE_TEXT = 'ANNOTATIONS:CHANGE_TEXT';
const ADD_NEW_FEATURE = 'ANNOTATIONS:ADD_NEW_FEATURE';

function loadAnnotations(features, override = false) {
    return {
        type: LOAD_ANNOTATIONS,
        features,
        override
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
function changeSelected(coordinates, radius, text) {
    return {
        type: CHANGED_SELECTED,
        coordinates,
        radius,
        text
    };
}
function showTextArea() {
    return {
        type: SHOW_TEXT_AREA
    };
}
function addText() {
    return {
        type: ADD_TEXT
    };
}
function cancelText() {
    return {
        type: CANCEL_CLOSE_TEXT
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
function removeAnnotationGeometry() {
    return {
        type: REMOVE_ANNOTATION_GEOMETRY
    };
}
function confirmRemoveAnnotation(id) {
    return {
        type: CONFIRM_REMOVE_ANNOTATION,
        id
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
function addNewFeature(feature) {
    return {
        type: ADD_NEW_FEATURE,
        feature
    };
}
function cancelCloseAnnotations() {
    return {
        type: CANCEL_CLOSE_ANNOTATIONS
    };
}
function stopDrawing() {
    return {
        type: STOP_DRAWING
    };
}
function toggleUnsavedChangesModal() {
    return {
        type: TOGGLE_CHANGES_MODAL
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
function saveText(value) {
    return {
        type: SAVE_TEXT,
        value
    };
}
function changeRadius(radius) {
    return {
        type: CHANGE_RADIUS,
        radius
    };
}
function changeStyler(stylerType) {
    return {
        type: CHANGE_STYLER,
        stylerType
    };
}
function changeText(text) {
    return {
        type: CHANGE_TEXT,
        text
    };
}
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
    STOP_DRAWING, stopDrawing,
    CHANGE_STYLER, changeStyler,
    UNSAVED_CHANGES, setUnsavedChanges,
    UNSAVED_STYLE, setUnsavedStyle,
    TOGGLE_CHANGES_MODAL, toggleUnsavedChangesModal,
    TOGGLE_STYLE_MODAL, toggleUnsavedStyleModal,
    CHANGED_PROPERTIES, changedProperties,
    SHOW_TEXT_AREA, showTextArea,
    ADD_TEXT, addText,
    CANCEL_CLOSE_TEXT, cancelText,
    SAVE_TEXT, saveText,
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
    ADD_NEW_FEATURE, addNewFeature,
    LOAD_ANNOTATIONS, loadAnnotations,
    RESET_COORD_EDITOR, resetCoordEditor,
    CHANGE_TEXT, changeText,
    CHANGE_RADIUS, changeRadius,
    CHANGED_SELECTED, changeSelected
};
