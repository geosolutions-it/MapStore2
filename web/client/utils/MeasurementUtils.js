/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {round, flatten} from 'lodash';
import uuidv1 from 'uuid/v1';

import {getStartEndPointsForLinestring, DEFAULT_ANNOTATIONS_STYLES} from '../utils/AnnotationsUtils';
import {convertUom, getFormattedBearingValue, validateFeatureCoordinates} from './MeasureUtils';
import {transformLineToArcs} from './CoordinatesUtils';

const getFormattedValue = (uom, value) => ({
    "length": round(convertUom(value, "m", uom.length.label) || 0, 2) + " " + uom.length.label,
    "area": round(convertUom(value, "sqm", uom.area.label) || 0, 2) + " " + uom.area.label,
    "bearing": getFormattedBearingValue(round(value || 0, 6)).toString()
});

const STYLE_TEXT_LABEL = {
    offsetY: 1,
    fontSize: '10',
    fontSizeUom: 'px',
    fontFamily: 'Courier New',
    font: "10px Courier New",
    textAlign: 'center',
    color: '#000000',
    opacity: 1,
    fillColor: '#000000',
    fillOpacity: 1
};

const STYLE_TEXT_LABEL_BIGGER = {
    offsetY: -15,
    fontSize: '13',
    fontSizeUom: 'px',
    fontFamily: 'Courier New',
    font: "13px Courier New",
    textAlign: 'center',
    color: '#000000',
    opacity: 1,
    fillColor: '#000000',
    fillOpacity: 1
};

const convertGeometryToGeoJSON = (feature, uom, measureValueStyle) => {
    const actualMeasureValueStyle = measureValueStyle || STYLE_TEXT_LABEL_BIGGER;
    return [{
        type: 'Feature',
        geometry: {
            type: feature.geometry.type,
            coordinates: validateFeatureCoordinates(feature.geometry),
            textLabels: feature.geometry.textLabels
        },
        properties: {
            id: uuidv1(),
            isValidFeature: true,
            geometryGeodesic: feature.geometry.type === 'LineString' ? {type: "LineString", coordinates: transformLineToArcs(feature.geometry.coordinates)} : null,
            useGeodesicLines: feature.geometry.type === 'LineString'
        },
        style: [{
            ...DEFAULT_ANNOTATIONS_STYLES[feature.geometry.type],
            type: feature.geometry.type,
            id: uuidv1(),
            geometry: feature.geometry.type === 'LineString' ? "lineToArc" : null,
            title: `${feature.geometry.type} Style`,
            filtering: true
        }].concat(feature.geometry.type === "LineString" ? getStartEndPointsForLinestring() : [])
    }, ...feature.properties.values.map(({value, formattedValue, type, position}) => ({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: position
        },
        properties: {
            valueText: formattedValue || getFormattedValue(uom, value)[type],
            isText: true,
            isValidFeature: true,
            id: uuidv1()
        },
        style: {
            ...actualMeasureValueStyle,
            id: uuidv1(),
            filtering: true,
            title: "Text Style",
            type: "Text"
        }
    }))];
};

export const convertMeasuresToGeoJSON = (geometricFeatures, textLabels, uom, id, description, measureValueStyle) => {
    return {
        type: "FeatureCollection",
        features: [
            ...flatten(geometricFeatures.map(feature => convertGeometryToGeoJSON(feature, uom, measureValueStyle))),
            ...textLabels.filter(textLabel => !!textLabel).map(({text, position}) => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: position
                },
                properties: {
                    valueText: text,
                    isValidFeature: true,
                    isText: true,
                    id: uuidv1()
                },
                style: {
                    ...STYLE_TEXT_LABEL,
                    id: uuidv1(),
                    filtering: true,
                    title: "Text Style",
                    type: "Text"
                }
            }))
        ],
        properties: {
            id,
            description
        },
        style: {}
    };
};
