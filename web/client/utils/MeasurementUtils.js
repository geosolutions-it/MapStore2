/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { round, flatten, uniq, get, isEqual } from 'lodash';
import uuidv1 from 'uuid/v1';
import turfArea from '@turf/area';
import {
    createAnnotationId,
    ANNOTATIONS
} from '../plugins/Annotations/utils/AnnotationsUtils';
import {
    convertUom,
    getFormattedBearingValue,
    MeasureTypes,
    defaultUnitOfMeasure,
    mapUomLabels
} from './MeasureUtils';
import {
    calculateDistance,
    transformLineToArcs,
    calculateAzimuth
} from './CoordinatesUtils';

export const MEASURE_TYPE = 'Measure';
export const MEASURE_CESIUM_TARGET_ID = 'measure-cesium-wrapper';

const getFormattedValue = (uom, value) => ({
    [MeasureTypes.LENGTH]: round(convertUom(value, "m", uom.length.label) || 0, 2) + " " + uom.length.label,
    [MeasureTypes.AREA]: round(convertUom(value, "sqm", uom.area.label) || 0, 2) + " " + uom.area.label,
    [MeasureTypes.BEARING]: getFormattedBearingValue(round(value || 0, 6)).toString()
});

const computeSegments = (coordinates, feature, options = {}) => {
    if (coordinates.length <= 2) {
        return [];
    }
    return coordinates.reduce((acc, coord, idx) => {
        if (coordinates[idx + 1] && !isEqual(coord, coordinates[idx + 1])) {
            const arc = transformLineToArcs([
                coord,
                coordinates[idx + 1]
            ]);
            const pointCoordinates = arc[Math.floor(arc.length / 2)];
            if (!pointCoordinates) {
                return acc;
            }
            const value = calculateDistance([
                coord,
                coordinates[idx + 1]
            ], options.lengthFormula);
            const convertedValue = (feature.properties.lengthTargetUom
                ? convertUom(value, 'm', feature.properties.lengthTargetUom)
                : value) || 0;
            const uomLabel = mapUomLabels[feature.properties.lengthTargetUom || 'm'];
            const id = uuidv1();
            return [
                ...acc,
                {
                    type: 'Feature',
                    id,
                    geometry: {
                        type: 'Point',
                        coordinates: pointCoordinates
                    },
                    properties: {
                        type: 'segment',
                        label: `${options.formatNumber(round(convertedValue, 2))} ${uomLabel}`,
                        id,
                        measureId: feature.id || feature.properties.id
                    }
                }
            ];
        }
        return acc;
    }, []);
};

export const computeFeatureMeasurement = (feature, options = { formatNumber: n => n }) => {
    if (feature.properties.measureType === MeasureTypes.LENGTH) {
        const value = calculateDistance(feature.geometry.coordinates, options.lengthFormula);
        const convertedValue = (feature.properties.lengthTargetUom
            ? convertUom(value, 'm', feature.properties.lengthTargetUom)
            : value) || 0;
        const uomLabel = mapUomLabels[feature.properties.lengthTargetUom || 'm'];
        const segments = computeSegments(feature.geometry.coordinates, feature, options);
        return [
            {
                ...feature,
                properties: {
                    ...feature?.properties,
                    length: value,
                    label: `${options.formatNumber(round(convertedValue, 2))} ${uomLabel}`
                }
            },
            ...segments
        ];
    }
    if (feature.properties.measureType === MeasureTypes.AREA) {
        const coordinates = feature.geometry.coordinates[0];
        const length = calculateDistance(coordinates, options.lengthFormula);
        const convertedLengthValue = (feature.properties.lengthTargetUom
            ? convertUom(length, 'm', feature.properties.lengthTargetUom)
            : length) || 0;
        const lengthUomLabel = mapUomLabels[feature.properties.lengthTargetUom || 'm'];
        const lengthLabel = `${options.formatNumber(round(convertedLengthValue, 2))} ${lengthUomLabel}`;
        // result different from ol getArea
        const area = turfArea(feature);
        const convertedAreaValue = (feature.properties.areaTargetUom
            ? convertUom(area, 'sqm', feature.properties.areaTargetUom)
            : area) || 0;
        const areaUomLabel = mapUomLabels[feature.properties.areaTargetUom || 'sqm'];
        const areaLabel = `${options.formatNumber(round(convertedAreaValue, 2))} ${areaUomLabel}`;
        const segments = computeSegments(coordinates, feature, options);
        return [
            {
                ...feature,
                properties: {
                    ...feature?.properties,
                    length,
                    area,
                    label: `${areaLabel}\n${lengthLabel}`
                }
            },
            ...segments
        ];
    }
    if (feature.properties.measureType === MeasureTypes.BEARING) {
        const vertices = feature.geometry.coordinates.reduce((acc, coords, idx) => {
            const nextCoords = feature.geometry.coordinates[idx + 1];
            if (nextCoords) {
                const value = calculateAzimuth(
                    coords,
                    nextCoords,
                    'EPSG:4326');
                const id = uuidv1();
                return [
                    ...acc,
                    {
                        type: 'Feature',
                        id,
                        geometry: {
                            type: 'Point',
                            coordinates: nextCoords
                        },
                        properties: {
                            type: 'segment',
                            bearing: value,
                            label: getFormattedBearingValue(round(value || 0, 6), {
                                measureTrueBearing: options.trueBearing,
                                fractionDigits: options.bearingFractionDigits
                            }).toString(),
                            id,
                            measureId: feature.id || feature.properties.id
                        }
                    }
                ];
            }
            return acc;
        }, []);
        return [{
            ...feature,
            properties: {
                ...feature?.properties,
                bearings: vertices.map(({ properties }) => properties.bearing),
                label: vertices.map(({ properties }) => properties.label).join(' | ')
            }
        }, ...vertices];
    }
    return [feature];
};

export const getGeomTypeSelected = (features = []) =>{
    return uniq(features.map(f=> {
        if (f.geometry.type === "LineString" && get(f, "properties.values[0].type", '') === 'bearing') {
            return 'Bearing';
        }
        return f.geometry.type;
    }));
};

export const getMeasureType = (feature) => {
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
                [`${value.type}TargetUom`]: uom[value.type]?.unit,
                label: value.formattedValue
                    ? value.formattedValue
                    : uom
                        ? getFormattedValue(uom, value.value)[value.type]
                        : `${value.value} ${unit}`
            };
        }, {});
};

const convertMeasureToFeatureCollection = (geometricFeatures, textLabels = [], uom) => {
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
                    geodesic: measureType === MeasureTypes.LENGTH || measureType === MeasureTypes.AREA,
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
    return {
        type: 'FeatureCollection',
        features
    };
};

export const convertMeasuresToAnnotation = (geometricFeatures, textLabels, uom, id, description) => {
    const { features } = convertMeasureToFeatureCollection(geometricFeatures, textLabels, uom);
    const annotationsFeatures = features
        .reduce((acc, feature) => {
            const newFeature = {
                ...feature,
                id: feature.properties.id,
                properties: {
                    ...feature.properties,
                    ...(feature?.properties?.measureType
                        && {
                            annotationType: feature.geometry.type,
                            name: feature?.properties?.measureType
                        })
                }
            };
            if (feature?.properties?.measureType === MeasureTypes.BEARING) {
                // used only for bearing because the others rely on react-intl.formatNumber available from components (MeasurementSupport)
                return [...acc, ...computeFeatureMeasurement(newFeature)];
            }
            return [...acc, newFeature];
        }, []);
    const rules = annotationsFeatures.reduce((acc, feature) => {
        if (feature.properties.annotationType) {
            return [
                ...acc,
                ...(![MeasureTypes.POINT_COORDINATES].includes(feature.properties.measureType) ? [{
                    ruleId: uuidv1(),
                    name: 'Start position',
                    filter: ['==', 'id', feature.properties.id],
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
                ...(![MeasureTypes.POINT_COORDINATES].includes(feature.properties.measureType) ? [{
                    ruleId: uuidv1(),
                    name: 'End position',
                    filter: ['==', 'id', feature.properties.id],
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
                ...([MeasureTypes.BEARING].includes(feature.properties.measureType) ? [{
                    ruleId: uuidv1(),
                    name: '',
                    filter: ['==', 'id', feature.properties.id],
                    mandatory: true,
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
                ...([MeasureTypes.LENGTH].includes(feature.properties.measureType) ? [{
                    ruleId: uuidv1(),
                    name: '',
                    filter: ['==', 'id', feature.properties.id],
                    mandatory: true,
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
                ...([MeasureTypes.AREA].includes(feature.properties.measureType) ? [{
                    ruleId: uuidv1(),
                    name: 'Area measurement',
                    filter: ['==', 'id', feature.properties.id],
                    mandatory: true,
                    symbolizers: [
                        {
                            symbolizerId: uuidv1(),
                            kind: 'Fill',
                            msGeometry: {
                                name: 'lineToArc'
                            },
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
                ...([MeasureTypes.AREA, MeasureTypes.LENGTH].includes(feature.properties.measureType) ? [{
                    ruleId: uuidv1(),
                    name: 'Segment labels',
                    filter: ['==', 'measureId', feature.properties.id],
                    mandatory: true,
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
                            font: ['Arial'],
                            opacity: 1
                        }
                    ]
                }] : []),
                ...([MeasureTypes.AREA, MeasureTypes.LENGTH].includes(feature.properties.measureType) ? [{
                    ruleId: uuidv1(),
                    name: 'Measurement label',
                    filter: ['==', 'id', feature.properties.id],
                    mandatory: true,
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
                            anchor: 'bottom',
                            msBringToFront: true,
                            msHeightReference: 'none',
                            label: '{{label}}',
                            font: ['Arial'],
                            opacity: 1,
                            offset: [0, 0],
                            msGeometry: {
                                name: 'endPoint'
                            }
                        }
                    ]
                }] : []),
                ...([MeasureTypes.BEARING].includes(feature.properties.measureType) ? [{
                    ruleId: uuidv1(),
                    name: 'Segment labels',
                    filter: ['==', 'measureId', feature.properties.id],
                    mandatory: true,
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
                            anchor: 'bottom',
                            msBringToFront: true,
                            msHeightReference: 'none',
                            label: '{{label}}',
                            font: ['Arial'],
                            opacity: 1,
                            offset: [0, 0],
                            msGeometry: {
                                name: 'endPoint'
                            }
                        }
                    ]
                }] : [])
            ];
        }
        return acc;
    }, []);
    return {
        id: createAnnotationId(`${id}`),
        type: 'vector',
        title: MEASURE_TYPE,
        description,
        features: annotationsFeatures,
        rowViewer: ANNOTATIONS,
        style: {
            format: 'geostyler',
            body: {
                name: '',
                rules
            }
        }
    };
};


const maintainOriginalGeom = (measureType) => measureType === MeasureTypes.LENGTH || measureType === MeasureTypes.AREA;

export const convertMeasuresToGeoJSON = (geometricFeatures, textLabels = [], uom) => {

    const { features } = convertMeasureToFeatureCollection(geometricFeatures, textLabels, uom);
    const measureTypes = uniq(features.map(feature => feature?.properties?.measureType).filter(measureType => !!measureType));

    return {
        type: 'FeatureCollection',
        msType: MEASURE_TYPE,
        features: features.map(ft => {
            const measureType = getMeasureType(ft);
            let geom = ft.geometry;
            if (measureType === MeasureTypes.LENGTH) {
                geom = {
                    ...ft.geometry,
                    coordinates: transformLineToArcs(ft.geometry.coordinates)
                        .map(c => [...c, ft.geometry.coordinates[ft.geometry.coordinates.length - 1][2] ?? 0]) // adding same height
                };
            }
            if (measureType === MeasureTypes.AREA) {
                geom = {
                    ...ft.geometry,
                    coordinates: ft.geometry.coordinates.map(coords => transformLineToArcs(coords))
                };
            }
            return {
                ...ft,
                geometry: geom,
                properties: {
                    ...ft.properties,
                    ...(maintainOriginalGeom(measureType) ? { originalGeom: ft.geometry} : {})
                }
            };
        }),
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
                                anchor: 'bottom',
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
