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
const {changeMeasurement, changeUom, changeFormatMeasurement, changeCoordinates, addAnnotation, init} = require('../actions/measurement');
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
const { isCoordinateEditorEnabledSelector, showAddAsAnnotationSelector } = require('../selectors/measurement');
const { showCoordinateEditorSelector, measureSelector } = require('../selectors/controls');

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
        bearingMeasureEnabled: state.measurement && state.measurement.bearingMeasureEnabled,
        isCoordinateEditorEnabled: isCoordinateEditorEnabledSelector(state),
        showCoordinateEditor: showCoordinateEditorSelector(state),
        showAddAsAnnotation: showAddAsAnnotationSelector(state) && isOpenlayers(state),
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
 * @prop {object} defaultOptions these are the options used to initialize the state of the Measure plugin, defaulti is {}
 * @prop {boolean} defaultOptions.showCoordinateEditor if true, tells the component to render the CoordinateEditor in a side panel otherwise it will render a modal without it, default is false
 * @prop {boolean} defaultOptions.showAddAsAnnotation if true, shows the button addAsAnnotation in the toolbar
 * @prop {boolean} defaultOptions.geomType geomType for the measure tool, can be "LineString" or "Bearing" or "Polygon", default is "LineString"
 * @prop {boolean} defaultOptions.format "decimal" of "aeronautical" format used for coordinate editor, default is "decimal"
  */
const Measure = connect(
    createSelector([
        selector,
        (state) => measureSelector(state)
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
        onInit: init,
        onChangeCoordinates: changeCoordinates,
        onClose: toggleMeasureTool,
        onMount: (showCoordinateEditor) => setControlProperty("measure", "showCoordinateEditor", showCoordinateEditor)
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
