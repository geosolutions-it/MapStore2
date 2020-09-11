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
const {changeMeasurement, changeUom, changeFormatMeasurement, changeCoordinates, addAnnotation, addAsLayer, init,
    setCurrentFeature} = require('../actions/measurement');
const {toggleControl, setControlProperty} = require('../actions/controls');
const {MeasureDialog} = require('./measure/index');

const {highlightPoint} = require('../actions/annotations');
const { isOpenlayers } = require('../selectors/maptype');
const { isCoordinateEditorEnabledSelector, showAddAsAnnotationSelector, isTrueBearingEnabledSelector } = require('../selectors/measurement');
const { showCoordinateEditorSelector, measureSelector } = require('../selectors/controls');
const { getConfigProp } = require('../utils/ConfigUtils');

const selector = (state) => {
    return {
        measurement: state.measurement || {},
        uom: state.measurement && state.measurement.uom || {
            length: {unit: 'm', label: 'm'},
            area: {unit: 'sqm', label: 'm²'}
        },
        lineMeasureEnabled: state.measurement && state.measurement.lineMeasureEnabled,
        lineMeasureValueEnabled: !isOpenlayers(state),
        areaMeasureEnabled: state.measurement && state.measurement.areaMeasureEnabled,
        areaMeasureValueEnabled: !isOpenlayers(state),
        bearingMeasureEnabled: state.measurement && state.measurement.bearingMeasureEnabled,
        showLengthAndBearingLabel: state.measurement && state.measurement.showLengthAndBearingLabel,
        bearingMeasureValueEnabled: !isOpenlayers(state),
        isCoordinateEditorEnabled: isCoordinateEditorEnabledSelector(state),
        showCoordinateEditor: showCoordinateEditorSelector(state),
        showFeatureSelector: isOpenlayers(state),
        useSingleFeature: !isOpenlayers(state),
        withReset: isOpenlayers(state),
        showExportToGeoJSON: isOpenlayers(state),
        showAddAsAnnotation: showAddAsAnnotationSelector(state) && isOpenlayers(state),
        trueBearing: isTrueBearingEnabledSelector(state),
        showAddAsLayer: isOpenlayers(state),
        isCoordEditorEnabled: state.measurement && !state.measurement.isDrawing,
        geomType: state.measurement && state.measurement.geomType,
        format: state.measurement && state.measurement.format
    };
};
const toggleMeasureTool = toggleControl.bind(null, 'measure', null);
/**
 * Measure plugin. Allows to show the tool to measure dinstances, areas and bearing.<br>
 * See [Application Configuration](local-config) to understand how to configure lengthFormula, showLabel and uom
 * @class
 * @name Measure
 * @memberof plugins
 * @prop {boolean} showResults: shows the measure in the panel itself.
 * @prop {object} defaultOptions: these are the options used to initialize the state of the Measure plugin, defaulti is {}
 * @prop {boolean} defaultOptions.showCoordinateEditor: if true, tells the component to render the CoordinateEditor in a side panel otherwise it will render a modal without it, default is false
 * @prop {boolean} defaultOptions.showAddAsAnnotation: if true, shows the button addAsAnnotation in the toolbar
 * @prop {boolean} defaultOptions.showLengthAndBearingLabel: if true, shows the length and bearing data in the map as segment label and also in measurement panel
 * @prop {object} defaultOptions.trueBearing: allows measurement configuration of angular distance from true north to the object. ISO Spec (https://www.sis.se/api/document/preview/905247/)
 * @prop {boolean} defaultOptions.trueBearing.measureTrueBearing: if true, displays the measurement in true bearing (000° T).
 * @prop {integer} defaultOptions.trueBearing.fractionDigits: Value denotes the fractional digit to used for the representation of true bearing.
 * For example this enables measurement in true bearing with fractional digits of 2 (000.00° - 359.99° T)
 * ```
 * "trueBearing": {
 *  "measureTrueBearing": true,
 *  "fractionDigits": 2
 *  }
 * ```
 * @prop {boolean} defaultOptions.geomType: geomType for the measure tool, can be "LineString" or "Bearing" or "Polygon", default is "LineString"
 * @prop {boolean} defaultOptions.format: "decimal" of "aeronautical" format used for coordinate editor, default is "decimal"
 * @prop {boolean} defaultOptions.showLabel: determines, whether to show measurement labels(like area for polygons)
 * @prop {boolean} defaultOptions.showSegmentLengths: determines, whether to show segment labels(of line segments for LineString, for example)
  */
const Measure = connect(
    createSelector([
        selector,
        (state) => measureSelector(state)
    ],
    (measure, show) => ({
        ...measure,
        show,
        format: measure.format || getConfigProp("defaultCoordinateFormat") || "decimal"
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
        onChangeCurrentFeature: setCurrentFeature,
        onClose: toggleMeasureTool,
        onMount: (showCoordinateEditor) => setControlProperty("measure", "showCoordinateEditor", showCoordinateEditor),
        onAddAsLayer: addAsLayer
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
    epics: require('../epics/measurement')
};
