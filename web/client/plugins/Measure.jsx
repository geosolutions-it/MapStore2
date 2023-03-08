/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '../utils/PluginsUtils';
import { highlightPoint } from '../actions/annotations';
import { setControlProperty, toggleControl } from '../actions/controls';
import {
    addAnnotation,
    addAsLayer,
    changeCoordinates,
    changeFormatMeasurement,
    changeMeasurement,
    changeUom,
    setCurrentFeature
} from '../actions/measurement';
import { measureSelector, showCoordinateEditorSelector } from '../selectors/controls';
import { isOpenlayers, mapTypeSelector } from '../selectors/maptype';
import {
    isCoordinateEditorEnabledSelector,
    isTrueBearingEnabledSelector,
    showAddAsAnnotationSelector
} from '../selectors/measurement';
import ConfigUtils from '../utils/ConfigUtils';
import Message from './locale/Message';
import {
    MeasureDialog,
    MeasureSupport
} from './measure/index';
import {mapLayoutValuesSelector} from "../selectors/maplayout";
import measurement from '../reducers/measurement';
import measurementEpics from '../epics/measurement';
import { defaultUnitOfMeasure } from '../utils/MeasureUtils';
import { MapLibraries } from '../utils/MapTypeUtils';

const selector = (state) => {
    return {
        measurement: state.measurement || {},
        uom: state.measurement && state.measurement.uom || defaultUnitOfMeasure,
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
 * Measure plugin. Allows to show the tool to measure distances, areas and bearing.
 * @class
 * @name Measure
 * @memberof plugins
 * @prop {boolean} showResults: shows the measure in the panel itself.
 * @prop {object} defaultOptions: these are the options used to initialize the state of the Measure plugin, default is {}
 * @prop {boolean} defaultOptions.showCoordinateEditor: (only 2D view) if true, tells the component to render the CoordinateEditor in a side panel otherwise it will render a modal without it, default is false
 * @prop {boolean} defaultOptions.showAddAsAnnotation: (only 2D view) if true, shows the button addAsAnnotation in the toolbar
 * @prop {boolean} defaultOptions.showLengthAndBearingLabel: (only 2D view) if true, shows the length and bearing data in the map as segment label and also in measurement panel
 * @prop {object} defaultOptions.trueBearing: (only 2D view) allows measurement configuration of angular distance from true north to the object. ISO Spec (https://www.sis.se/api/document/preview/905247/)
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
 * @prop {boolean} defaultOptions.format: (only 2D view) "decimal" of "aeronautical" format used for coordinate editor, default is "decimal"
 * @prop {boolean} defaultOptions.showLabel: determines, whether to show measurement labels(like area for polygons)
 * @prop {boolean} defaultOptions.showSegmentLengths: determines, whether to show segment labels(of line segments for LineString, for example)
 * @prop {string} defaultOptions.lengthFormula: (only 2D view) formula used for length calculation, one of "haversine" or "vincenty" (default haversine)
 * @prop {object} defaultOptions.uom: define the default unit of measure of all measure type, all types must be defined
 * unit available values:
 * - distance values: ft, m, km, mi, nm standing for feets, meters, kilometers, miles, nautical miles
 * - area values: sqft, sqm, sqkm, sqmi, sqnm standing for square feets, square meters, square kilometers, square miles, square nautical miles
 * - angles values: deg, rad, standing for degrees, radians
 * - slope values: deg, percentage, standing for degrees, percentage
 * default unit of measure
 * ```
 * {
 *     "length": { "unit": "m", "label": "m" },
 *     "area": { "unit": "sqm", "label": "m²" },
 *     "POLYLINE_DISTANCE_3D": { "unit": "m", "label": "m" },
 *     "AREA_3D": { "unit": "sqm", "label": "m²" },
 *     "POINT_COORDINATES": { "unit": "m", "label": "m" },
 *     "HEIGHT_FROM_TERRAIN": { "unit": "m", "label": "m" },
 *     "SLOPE": { "unit": "deg", label: "°" },
 *     "ANGLE_3D": { "unit": "deg", label: "°" }
 * }
 * ```
 * @prop {object} defaultOptions.startEndPoint: (only 2D view) Customize the style for the start/endPoint for the measure features
 * ```
 * {
 *    "startPointOptions": {
 *        "radius": 3,
 *        "fillColor": "green",
 *        "applyToPolygon": false
 *    },
 *    "endPointOptions": {
 *        "radius": 3,
 *        "fillColor": "red",
 *        "applyToPolygon": false
 *    }
 * }
 * ```
 * @prop {object} defaultOptions.startEndPoint.startPointOptions: start point options
 * @prop {number} defaultOptions.startEndPoint.startPointOptions.radius: radius of the point
 * @prop {string} defaultOptions.startEndPoint.startPointOptions.fillColor: fill color of the point
 * @prop {boolean} defaultOptions.startEndPoint.startPointOptions.applyToPolygon: if true also polygon shows the start point
 * @prop {object} defaultOptions.startEndPoint.endPointOptions: endpoint point options
 * @prop {number} defaultOptions.startEndPoint.endPointOptions.radius: radius of the point
 * @prop {string} defaultOptions.startEndPoint.endPointOptions.fillColor: fill color of the point
 * @prop {boolean} defaultOptions.startEndPoint.endPointOptions.applyToPolygon: if true also polygon shows the end point
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
        onChangeCoordinates: changeCoordinates,
        onChangeCurrentFeature: setCurrentFeature,
        onClose: toggleMeasureTool,
        onMount: (showCoordinateEditor) => setControlProperty("measure", "showCoordinateEditor", showCoordinateEditor),
        onAddAsLayer: addAsLayer
    }, null, {pure: false})(MeasureDialog);

// the connect for mapType is needed in case the mapType is not provided by the hash pathname
const MeasurePlugin = connect(
    createSelector([
        mapTypeSelector
    ], (mapType) => ({
        mapType
    }))
)((props) => {
    return props.mapType === MapLibraries.CESIUM
        ? null
        : <Measure {...props} />;
});

export default createPlugin('Measure', {
    component: MeasurePlugin,
    containers: {
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
        },
        Map: {
            name: 'Measure',
            Tool: MeasureSupport,
            doNotHide: true,
            alwaysRender: true
        }
    },
    reducers: {
        measurement
    },
    epics: measurementEpics
});
