/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {round, flatten, startCase, uniq, get} from 'lodash';
import uuidv1 from 'uuid/v1';

import {getStartEndPointsForLinestring, DEFAULT_ANNOTATIONS_STYLES} from '../utils/AnnotationsUtils';
import {convertUom, getFormattedBearingValue, validateFeatureCoordinates, MeasureTypes, defaultUnitOfMeasure} from './MeasureUtils';
import {transformLineToArcs} from './CoordinatesUtils';

export const MEASURE_TYPE = 'Measure';

const getFormattedValue = (uom, value) => ({
    "length": round(convertUom(value, "m", uom.length.label) || 0, 2) + " " + uom.length.label,
    "area": round(convertUom(value, "sqm", uom.area.label) || 0, 2) + " " + uom.area.label,
    "bearing": getFormattedBearingValue(round(value || 0, 6)).toString()
});

const getMeasurementProps = (features) =>{
    const geomTypes = uniq(features.map(f=> get(f, "properties.values[0].type", '')));
    if (geomTypes.length > 1) {
        return {title: 'Multiple Measurement', iconGlyph: 'geometry-collection'};
    }
    return {title: MEASURE_TYPE + ' ' + startCase(geomTypes[0]), iconGlyph: '1-measure-' + geomTypes[0]};
};

export const getGeomTypeSelected = (features = []) =>{
    return uniq(features.map(f=> {
        if (f.geometry.type === "LineString" && get(f, "properties.values[0].type", '') === 'bearing') {
            return 'Bearing';
        }
        return f.geometry.type;
    }));
};

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
    const isBearing = !!feature.properties?.values?.find(val=>val.type === 'bearing');
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
            // Transform only the linestring of type not bearing
            geometryGeodesic: feature.geometry.type === 'LineString' && !isBearing ? {type: "LineString", coordinates: transformLineToArcs(feature.geometry.coordinates)} : null,
            useGeodesicLines: feature.geometry.type === 'LineString' && !isBearing,
            values: feature.properties?.values || []
        },
        style: [{
            ...DEFAULT_ANNOTATIONS_STYLES[feature.geometry.type],
            type: feature.geometry.type,
            id: uuidv1(),
            geometry: feature.geometry.type === 'LineString' && !isBearing ? "lineToArc" : null,
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

export const convertMeasuresToAnnotation = (geometricFeatures, textLabels, uom, id, description, measureValueStyle) => {
    const measureProps = getMeasurementProps(geometricFeatures);
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
            description,
            type: MEASURE_TYPE,
            title: measureProps.title,
            iconGlyph: measureProps.iconGlyph
        },
        style: {}
    };
};

const getMeasureType = (feature) => {
    if (feature?.properties?.measureType) {
        return feature.properties.measureType;
    }
    if (!!feature.properties?.values?.find(val=> val.type === 'bearing' )) {
        return MeasureTypes.BEARING;
    }
    if (!!feature.properties?.values?.find(val=> val.type === 'length' )
    && !!feature.properties?.values?.find(val=> val.type === 'area' )) {
        return MeasureTypes.AREA;
    }
    if (feature.properties?.values?.length === 1
    && !!feature.properties?.values?.find(val=> val.type === 'length' )) {
        return MeasureTypes.LENGTH;
    }
    return null;
};

const parseProperties = (values = [], uom) => {
    return [ ...values]
        // when we have a length equal to 2
        // we are getting properties for the area measurement
        // we need to ensure the area value type is the last one on the array
        // to apply the infoLabelText correctly
        .sort((a, b) => a.type < b.type ? 1 : -1)
        .reduce((acc, value) => {
            const unit = defaultUnitOfMeasure[value.type]?.value;
            return {
                ...acc,
                [`${value.type}`]: value.value,
                [`${value.type}Uom`]: unit,
                label: value.formattedValue
                    ? value.formattedValue
                    : uom
                        ? getFormattedValue(uom, value.value)[value.type]
                        : `${value.value} ${unit}`
            };
        }, {});
};

export const convertMeasuresToGeoJSON = (geometricFeatures, textLabels = [], uom) => {

    const features = flatten(geometricFeatures.map((feature, idx) => {
        // textLabels inside the feature geometry are not updated based on the selected format
        // so we need the global textLabels properties for 2D measurement
        const { textLabels: storedTextLabels, ...geometry } = feature?.geometry;
        const {
            values,
            segments,
            segmentsCRS,
            segmentsColumns,
            infoLabelText,
            terrainCoordinates,
            ...properties
        } = feature?.properties;
        const measureType = getMeasureType(feature);
        const measureId = uuidv1();
        const currentTextLabels = textLabels.filter(({ textId }) => textId === idx);
        return [
            {
                ...feature,
                geometry: measureType === MeasureTypes.HEIGHT_FROM_TERRAIN
                    ? {
                        type: 'LineString',
                        coordinates: [
                            geometry.coordinates,
                            terrainCoordinates
                        ]
                    }
                    : geometry,
                id: feature.id || measureId,
                properties: {
                    ...properties,
                    label: infoLabelText,
                    geodesic: measureType === MeasureTypes.LENGTH,
                    ...parseProperties(values, uom),
                    type: [MeasureTypes.POINT_COORDINATES].includes(measureType)
                        ? 'position'
                        : 'measurement',
                    measureType,
                    id: measureId
                }
            },
            ...(segments || [])
                .map((segment) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            segment[0], // longitude
                            segment[1], // latitude
                            segment[2] // height:m
                        ]
                    },
                    properties: {
                        type: 'segment',
                        label: segment[4], // label
                        id: uuidv1(),
                        measureId
                    }
                })),
            ...(currentTextLabels || [])
                .filter(textLabel => !!textLabel)
                .map(({text, position}) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: position
                    },
                    properties: {
                        type: 'segment',
                        label: text,
                        id: uuidv1(),
                        measureId
                    }
                }))
        ];
    }));

    const measureTypes = uniq(features.map(feature => feature?.properties?.measureType).filter(measureType => !!measureType));

    return {
        type: 'FeatureCollection',
        features,
        style: {
            metadata: { editorType: 'visual' },
            format: 'geostyler',
            body: {
                name: MEASURE_TYPE,
                rules: [
                    ...(measureTypes.some(measureType => [MeasureTypes.LENGTH].includes(measureType)) ? [{
                        ruleId: uuidv1(),
                        name: 'Geodesic measurement',
                        filter: ['||', ['==', 'geodesic', true]],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Line',
                                msGeometry: {
                                    name: 'lineToArc'
                                },
                                color: '#FF9548',
                                width: 3,
                                opacity: 1,
                                cap: 'round',
                                join: 'round',
                                msClampToGround: false
                            }
                        ]
                    }] : []),
                    ...(measureTypes.some(measureType => [MeasureTypes.POLYLINE_DISTANCE_3D, MeasureTypes.HEIGHT_FROM_TERRAIN].includes(measureType)) ? [{
                        ruleId: uuidv1(),
                        name: 'Linear measurement',
                        filter: ['||',
                            ['==', 'measureType', MeasureTypes.POLYLINE_DISTANCE_3D],
                            ['==', 'measureType', MeasureTypes.HEIGHT_FROM_TERRAIN]
                        ],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Line',
                                color: '#ffcc33',
                                width: 3,
                                opacity: 1,
                                cap: 'round',
                                join: 'round',
                                msClampToGround: false
                            }
                        ]
                    }] : []),
                    ...(measureTypes.some(measureType => [MeasureTypes.BEARING, MeasureTypes.ANGLE_3D].includes(measureType)) ? [{
                        ruleId: uuidv1(),
                        name: 'Angle measurement',
                        filter: ['||',
                            ['==', 'measureType', MeasureTypes.BEARING],
                            ['==', 'measureType', MeasureTypes.ANGLE_3D]
                        ],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Line',
                                color: '#C980FF',
                                width: 3,
                                opacity: 1,
                                cap: 'round',
                                join: 'round',
                                msClampToGround: false
                            }
                        ]
                    }] : []),
                    ...(measureTypes.some(measureType => [MeasureTypes.SLOPE].includes(measureType)) ? [{
                        ruleId: uuidv1(),
                        name: 'Slope measurement',
                        filter: ['||',
                            ['==', 'measureType', MeasureTypes.SLOPE]
                        ],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Fill',
                                color: '#ffffff',
                                fillOpacity: 0.5,
                                outlineColor: '#7EC058',
                                outlineOpacity: 1,
                                outlineWidth: 3,
                                msClassificationType: 'both',
                                msClampToGround: false
                            }
                        ]
                    }] : []),
                    ...(measureTypes.some(measureType => [MeasureTypes.AREA, MeasureTypes.AREA_3D].includes(measureType)) ? [{
                        ruleId: uuidv1(),
                        name: 'Area measurement',
                        filter: ['||',
                            ['==', 'measureType', MeasureTypes.AREA],
                            ['==', 'measureType', MeasureTypes.AREA_3D]
                        ],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Fill',
                                color: '#ffffff',
                                fillOpacity: 0.5,
                                outlineColor: '#33A8FF',
                                outlineOpacity: 1,
                                outlineWidth: 3,
                                msClassificationType: 'both',
                                msClampToGround: false
                            }
                        ]
                    }] : []),
                    ...(measureTypes.some(measureType => ![MeasureTypes.POINT_COORDINATES].includes(measureType)) ? [{
                        ruleId: uuidv1(),
                        name: 'Start position',
                        filter: ['||', ['==', 'type', 'measurement']],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Mark',
                                msGeometry: {
                                    name: 'startPoint'
                                },
                                wellKnownName: 'Circle',
                                color: '#008000',
                                fillOpacity: 1,
                                radius: 3,
                                rotate: 0,
                                msBringToFront: true,
                                msHeightReference: 'none'
                            }
                        ]
                    }] : []),
                    ...(measureTypes.some(measureType => ![MeasureTypes.POINT_COORDINATES].includes(measureType)) ? [{
                        ruleId: uuidv1(),
                        name: 'End position',
                        filter: ['||', ['==', 'type', 'measurement']],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Mark',
                                msGeometry: {
                                    name: 'endPoint'
                                },
                                wellKnownName: 'Circle',
                                color: '#ff0000',
                                fillOpacity: 1,
                                radius: 3,
                                rotate: 0,
                                msBringToFront: true,
                                msHeightReference: 'none'
                            }
                        ]
                    }] : []),
                    {
                        ruleId: uuidv1(),
                        name: 'Center position',
                        filter: ['||', ['==', 'type', 'measurement'], ['==', 'type', 'position']],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Mark',
                                wellKnownName: 'Circle',
                                color: '#000000',
                                fillOpacity: 0,
                                strokeColor: '#000000',
                                strokeOpacity: 1,
                                strokeWidth: 2,
                                radius: 4,
                                rotate: 0,
                                msBringToFront: true,
                                msHeightReference: 'none'
                            }
                        ]
                    },
                    {
                        ruleId: uuidv1(),
                        name: 'Segment labels',
                        filter: ['||', ['==', 'type', 'segment']],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Text',
                                color: '#000000',
                                size: 10,
                                fontStyle: 'italic',
                                fontWeight: 'normal',
                                haloColor: '#444444',
                                haloWidth: 0.5,
                                allowOverlap: true,
                                offset: [0, 0],
                                msBringToFront: true,
                                msHeightReference: 'none',
                                label: '{{label}}',
                                font: ['Courier New'],
                                opacity: 1
                            }
                        ]
                    },
                    {
                        ruleId: uuidv1(),
                        name: 'Measurement label',
                        filter: ['||', ['==', 'type', 'measurement'], ['==', 'type', 'position']],
                        symbolizers: [
                            {
                                symbolizerId: uuidv1(),
                                kind: 'Text',
                                color: '#000000',
                                size: 13,
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                haloColor: '#FFFFFF',
                                haloWidth: 3,
                                allowOverlap: true,
                                offset: [0, -12],
                                msBringToFront: true,
                                msHeightReference: 'none',
                                label: '{{label}}',
                                font: ['Courier New'],
                                opacity: 1
                            }
                        ]
                    }
                ]
            }
        }
    };
};
