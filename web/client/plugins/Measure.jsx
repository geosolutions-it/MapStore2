/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import assign from 'object-assign';
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { highlightPoint } from '../actions/annotations';
import { setControlProperty, toggleControl } from '../actions/controls';
import {
    addAnnotation,
    addAsLayer,
    changeCoordinates,
    changeFormatMeasurement,
    changeMeasurement,
    changeUom,
    init,
    setCurrentFeature
} from '../actions/measurement';
import { measureSelector, showCoordinateEditorSelector } from '../selectors/controls';
import { isOpenlayers } from '../selectors/maptype';
import {
    isCoordinateEditorEnabledSelector,
    isTrueBearingEnabledSelector,
    showAddAsAnnotationSelector
} from '../selectors/measurement';
import ConfigUtils from '../utils/ConfigUtils';
import Message from './locale/Message';
import { MeasureDialog } from './measure/index';
import {mapLayoutValuesSelector} from "../selectors/maplayout";

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
        format: state.measurement && state.measurement.format,
        dockStyle: mapLayoutValuesSelector(state, { height: true, right: true }, true)
    };
};
const toggleMeasureTool = toggleControl.bind(null, 'measure', null);
/**
 * Measure plugin. Allows to show the tool to measure dinstances, areas and bearing.<br>
 * See [Application Configuration](https://mapstore.readthedocs.io/en/latest/developer-guide/local-config/) to understand how to configure lengthFormula, showLabel and uom
 * @class
 * @name Measure
 * @memberof plugins
 * @prop {boolean} showResults: shows the measure in the panel itself.
 * @prop {object} defaultOptions: these are the options used to initialize the state of the Measure plugin, defaulti is {}
 * @prop {boolean} defaultOptions.showCoordinateEditor: if true, tells the component to render the CoordinateEditor in a side panel otherwise it will render a modal without it, default is false
 * @prop {boolean} defaultOptions.showAddAsAnnotation: if true, shows the button addAsAnnotation in the toolbar
 * @prop {boolean} defaultOptions.showLengthAndBearingLabel: if true, shows the length and bearing data in the map as segment label and also in measurement panel
 * @prop {object} defaultOptions.trueBearing: allows measurement configuration of angular distance from true north to the object. ISO Spec (https://www.sis.se/api/document/preview/905247/)
 * @prop {boolean} defaultOptions.trueBearing.measureTrueBearing: if true, displays the measurement in true bearing (000°).
 * @prop {integer} defaultOptions.trueBearing.fractionDigits: Value denotes the fractional digit to used for the representation of true bearing.
 * For example this enables measurement in true bearing with fractional digits of 2 (000.00° - 359.99°)
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
        format: measure.format || ConfigUtils.getConfigProp("defaultCoordinateFormat") || "decimal"
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

export default {
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
            action: () => setControlProperty("measure", "enabled", true),
            doNotHide: true,
            priority: 2
        },
        SidebarMenu: {
            name: 'measurement',
            position: 9,
            panel: false,
            help: <Message msgId="helptexts.measureComponent"/>,
            tooltip: "measureComponent.tooltip",
            text: <Message msgId="measureComponent.Measure"/>,
            icon: <Glyphicon glyph="1-ruler"/>,
            action: toggleControl.bind(null, 'measure', null),
            toggle: true,
            toggleControl: 'measure',
            toggleProperty: 'enabled',
            doNotHide: true,
            priority: 1
        }
    }),
    reducers: {measurement: require('../reducers/measurement').default},
    epics: require('../epics/measurement').default
};
