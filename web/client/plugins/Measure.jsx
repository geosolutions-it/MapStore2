/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {connect} = require('react-redux');
const {Glyphicon} = require('react-bootstrap');
const assign = require('object-assign');
const {createSelector} = require('reselect');
const Message = require('./locale/Message');
const {changeMeasurement, changeUom, changeFormatMeasurement, changeCoordinates, addAnnotation} = require('../actions/measurement');
const {toggleControl, setControlProperty} = require('../actions/controls');
const {MeasureDialog} = require('./measure/index');

const {cancelRemoveAnnotation, confirmRemoveAnnotation, openEditor, removeAnnotation, cancelEditAnnotation,
    saveAnnotation, toggleAdd, validationError, removeAnnotationGeometry, toggleStyle, setStyle, restoreStyle,
    cleanHighlight, cancelCloseAnnotations, confirmCloseAnnotations, startDrawing, changeStyler, setUnsavedChanges,
    toggleUnsavedChangesModal, changedProperties, setUnsavedStyle, toggleUnsavedStyleModal, addText, download,
    changeSelected, resetCoordEditor, changeRadius, changeText, toggleUnsavedGeometryModal, addNewFeature, setInvalidSelected, highlight,
    highlightPoint, confirmDeleteFeature, toggleDeleteFtModal, changeFormat
} = require('../actions/annotations');
const { zoomToExtent } = require('../actions/map');
const { annotationsInfoSelector } = require('../selectors/annotations');
const { isOpenlayers } = require('../selectors/maptype');

const commonEditorActions = {
    onEdit: openEditor,
    onCancelEdit: cancelEditAnnotation,
    onChangeStyler: changeStyler,
    onChangeFormat: changeFormat,
    onConfirmDeleteFeature: confirmDeleteFeature,
    onCleanHighlight: cleanHighlight,
    onHighlightPoint: highlightPoint,
    onHighlight: highlight,
    onError: validationError,
    onSave: saveAnnotation,
    onRemove: removeAnnotation,
    onAddGeometry: toggleAdd,
    onAddText: addText,
    onSetUnsavedChanges: setUnsavedChanges,
    onSetUnsavedStyle: setUnsavedStyle,
    onChangeProperties: changedProperties,
    onToggleDeleteFtModal: toggleDeleteFtModal,
    onToggleUnsavedChangesModal: toggleUnsavedChangesModal,
    onToggleUnsavedGeometryModal: toggleUnsavedGeometryModal,
    onToggleUnsavedStyleModal: toggleUnsavedStyleModal,
    onAddNewFeature: addNewFeature,
    onResetCoordEditor: resetCoordEditor,
    onStyleGeometry: toggleStyle,
    onCancelStyle: restoreStyle,
    onChangeSelected: changeSelected,
    onSaveStyle: toggleStyle,
    onSetStyle: setStyle,
    onStartDrawing: startDrawing,
    onDeleteGeometry: removeAnnotationGeometry,
    onZoom: zoomToExtent,
    onChangeRadius: changeRadius,
    onSetInvalidSelected: setInvalidSelected,
    onChangeText: changeText,
    onDownload: download
};

const AnnotationsInfoViewer = connect(annotationsInfoSelector,
{
    onCancelRemove: cancelRemoveAnnotation,
    onCancelEdit: cancelEditAnnotation,
    onCancelClose: cancelCloseAnnotations,
    onConfirmClose: confirmCloseAnnotations,
    onConfirmRemove: confirmRemoveAnnotation,
    ...commonEditorActions
})(require('../components/mapcontrols/annotations/AnnotationsEditor'));


const selector = (state) => {
    return {
        measurement: state.measurement || {},
        uom: state.measurement && state.measurement.uom || {
            length: {unit: 'm', label: 'm'},
            area: {unit: 'sqm', label: 'm²'}
        },
        lineMeasureEnabled: state.measurement && state.measurement.lineMeasureEnabled,
        areaMeasureEnabled: state.measurement && state.measurement.areaMeasureEnabled,
        showCoordinateEditor: isOpenlayers(state),
        showAddAsAnnotation: isOpenlayers(state),
        bearingMeasureEnabled: state.measurement && state.measurement.bearingMeasureEnabled,
        isCoordEditorEnabled: state.measurement && !state.measurement.isDrawing,
        geomType: state.measurement && state.measurement.geomType,
        format: state.measurement && state.measurement.format || "decimal"
    };
};
const toggleMeasureTool = toggleControl.bind(null, 'measure', null);
/**
 * Measure plugin. Allows to show the tool to measure dinstances, areas and bearing.<br>
 * See [Application Configuration](local-config) to understand how to configure lengthFormula, showLabel and uom
 * @class
 * @name Measure
 * @memberof plugins
 * @prop {boolean} showResults shows the measure in the panel itself.
  */
const Measure = connect(
    createSelector([
        selector,
        (state) => state && state.controls && state.controls.measure && state.controls.measure.enabled
    ],
        (measure, show) => ({
            show,
            ...measure
        }
    )),
    {
        toggleMeasure: changeMeasurement,
        onAddAnnotation: addAnnotation,
        onChangeUom: changeUom,
        onHighlightPoint: highlightPoint,
        onChangeFormat: changeFormatMeasurement,
        onChangeCoordinates: changeCoordinates,
        onClose: toggleMeasureTool
    }, null, {pure: false})(MeasureDialog);

module.exports = {
    MeasurePlugin: assign(Measure, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'measurement',
            position: 9,
            panel: false,
            help: <Message msgId="helptexts.measureComponent"/>,
            tooltip: "measureComponent.tooltip",
            text: <Message msgId="measureComponent.Measure"/>,
            icon: <Glyphicon glyph="1-ruler"/>,
            action: () => setControlProperty("measure", "enabled", true)
        }
    }),
    reducers: {measurement: require('../reducers/measurement')},
    epics: require('../epics/measurement')(AnnotationsInfoViewer)
};
