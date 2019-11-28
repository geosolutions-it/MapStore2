/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {ADD_MEASURE_AS_ANNOTATION} = require('../actions/measurement');
const {getStartEndPointsForLinestring, DEFAULT_ANNOTATIONS_STYLES, STYLE_TEXT} = require('../utils/AnnotationsUtils');
const {convertUom, getFormattedBearingValue, validateFeatureCoordinates} = require('../utils/MeasureUtils');
const {toggleControl, SET_CONTROL_PROPERTY} = require('../actions/controls');
const {closeFeatureGrid} = require('../actions/featuregrid');
const {purgeMapInfoResults, hideMapinfoMarker} = require('../actions/mapInfo');
const {transformLineToArcs} = require('../utils/CoordinatesUtils');
const uuidv1 = require('uuid/v1');
const assign = require('object-assign');
const {last, round} = require('lodash');
const {showCoordinateEditorSelector} = require('../selectors/controls');
const {newAnnotation, setEditingFeature} = require('../actions/annotations');

const formattedValue = (uom, value) => ({
    "length": round(convertUom(value, "m", uom) || 0, 2) + " " + uom,
    "area": round(convertUom(value, "sqm", uom) || 0, 2) + " " + uom,
    "bearing": getFormattedBearingValue(round(value || 0, 6)).toString()
});
const isLineString = (state) => {
    return state.measurement.geomType === "LineString";
};

const convertMeasureToGeoJSON = (measureGeometry, value, uom, id, measureTool, state) => {
    return assign({}, {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: measureGeometry.type === "LineString" ? last(measureGeometry.coordinates) : last(measureGeometry.coordinates[0])
                },
                properties: {
                    valueText: formattedValue(uom, value)[measureTool],
                    isText: true,
                    isValidFeature: true,
                    id: uuidv1()
                },
                style: [{
                    ...STYLE_TEXT,
                    id: uuidv1(),
                    filtering: true,
                    title: "Text Style",
                    type: "Text"
                }]
            },
            {
                type: "Feature",
                geometry: {
                    coordinates: validateFeatureCoordinates(measureGeometry),
                    type: isLineString(state) ? "MultiPoint" : measureGeometry.type},
                properties: {
                    isValidFeature: true,
                    useGeodesicLines: isLineString(state), // this is reduntant? remove it, check in the codebase where is used and use the geom dta instad
                    id: uuidv1(),
                    geometryGeodesic: isLineString(state) ? {type: "LineString", coordinates: transformLineToArcs(measureGeometry.coordinates)} : null
                },
                style: [{
                    ...DEFAULT_ANNOTATIONS_STYLES[measureGeometry.type],
                    type: measureGeometry.type,
                    id: uuidv1(),
                    geometry: isLineString(state) ? "lineToArc" : null,
                    title: `${measureGeometry.type} Style`,
                    filtering: true
                }].concat(measureGeometry.type === "LineString" ? getStartEndPointsForLinestring() : [])
            }
        ],
        properties: {
            id,
            description: " " + formattedValue(uom, value)[measureTool]
        },
        style: {}
    });
};

module.exports = {
    addAnnotationFromMeasureEpic: (action$, store) =>
        action$.ofType(ADD_MEASURE_AS_ANNOTATION)
            .switchMap((a) => {
                const state = store.getState();
                // transform measure feature into geometry collection
                // add feature property to manage text annotation with value and uom
                const {feature, value, uom, measureTool} = a;
                const id = uuidv1();
                const newFeature = convertMeasureToGeoJSON(feature.geometry, value, uom, id, measureTool, state);

                return Rx.Observable.of(
                    toggleControl('annotations', null),
                    newAnnotation(),
                    setEditingFeature(newFeature)
                );
            }),
    openMeasureEpic: (action$, store) =>
        action$.ofType(SET_CONTROL_PROPERTY)
            .filter((action) => action.control === "measure" && action.value && showCoordinateEditorSelector(store.getState()))
            .switchMap(() => {
                return Rx.Observable.of(closeFeatureGrid(), purgeMapInfoResults(), hideMapinfoMarker());
            })
};
