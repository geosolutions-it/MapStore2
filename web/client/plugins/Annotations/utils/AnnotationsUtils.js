/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import uuidv1 from 'uuid/v1';
import { slice, omit, head, last, get, isNaN, isEqual, isNumber } from 'lodash';
import turfBbox from '@turf/bbox';
import {
    MeasureTypes,
    measureIcons
} from '../../../utils/MeasureUtils';
import {
    getMeasureType
} from '../../../utils/MeasurementUtils';

import {
    transformLineToArcs
} from '../../../utils/CoordinatesUtils';

// legacy style
export const STYLE_CIRCLE = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2
};
// legacy style
export const STYLE_POINT_MARKER = {
    iconGlyph: 'comment',
    iconShape: 'square',
    iconColor: 'blue'
};
// legacy style
export const STYLE_POINT_SYMBOL = {
    iconAnchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    color: "#000000",
    fillColor: "#000000",
    opacity: 1,
    size: 64,
    fillOpacity: 1
};
// legacy style
export const STYLE_TEXT = {
    fontStyle: 'normal',
    fontSize: '14',
    fontSizeUom: 'px',
    fontFamily: 'Arial',
    fontWeight: 'normal',
    font: "14px Arial",
    textAlign: 'center',
    color: '#000000',
    opacity: 1,
    fillColor: '#000000',
    fillOpacity: 1
};
// legacy style
export const STYLE_LINE = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    editing: {
        fill: 1
    }
};
// legacy style
export const STYLE_POLYGON = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2,
    editing: {
        fill: 1
    }
};
// legacy styles
export const DEFAULT_ANNOTATIONS_STYLES = {
    "Text": STYLE_TEXT,
    "Point": STYLE_POINT_MARKER,
    "Circle": STYLE_CIRCLE,
    "MultiPoint": STYLE_POINT_MARKER,
    "LineString": STYLE_LINE,
    "MultiLineString": STYLE_LINE,
    "Polygon": STYLE_POLYGON,
    "MultiPolygon": STYLE_POLYGON
};
// The constant for annotation type
export const ANNOTATION_TYPE = "ms2-annotations";
// The constant for annotations
export const ANNOTATIONS = "annotations";
/**
 * It returns true if the layer is an annotations layer
 * @param {object} layer MapStore layer object
 * @returns {boolean}
 */
export const isAnnotationLayer = (layer) => (layer.id || '').includes(`${ANNOTATIONS}:`) && layer.rowViewer === ANNOTATIONS;
/**
 * Legacy: utility to check if the GeoJSON has the annotation model structure i.e. {"type": "ms2-annotations", "features": [list of FeatureCollection]}
 * or the imported annotation object's name is of "Annotations"
 * @param {object} json GeoJSON/plain object
 * @returns {boolean} if the GeoJSON passes is a ms2-annotation or if the name property of the object passed is Annotations
 */
export const isMSAnnotation = (json) => json?.type === ANNOTATION_TYPE || json?.name === "Annotations";
/**
 * It returns true if the FeatureCollection is a MapStore annotations
 * @param {object} json json object, FeatureCollection type
 * @returns {boolean}
 */
export const isGeoJSONAnnotation = (json) => json?.type === 'FeatureCollection' && json?.msType === ANNOTATIONS;
/**
 * It returns true if the json is a MapStore annotations, including legacy annotations
 * @param {object} json json object, FeatureCollection type
 * @returns {boolean}
 */
export const isAnnotation = (json) => isMSAnnotation(json) || isGeoJSONAnnotation(json);
/**
 * Return a valid id for annotations layer
 * @param {string} id existing annotation id
 * @returns {boolean}
 */
export const createAnnotationId = (id) => !id
    ? `${ANNOTATIONS}:${uuidv1()}`
    : `${id}`.includes(`${ANNOTATIONS}:`)
        ? id
        : `${ANNOTATIONS}:${id}`;
export const validateCoords = ({lat, lon, height} = {}) => !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon)) && (height !== undefined ? !isNaN(parseFloat(height)) : true);
export const coordToArray = (c = {}) => [c.lon, c.lat, ...(c.height !== undefined ? [c.height] : [])];
export const validateCoordsArray = ([lon, lat, height] = []) => !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon)) && (height !== undefined ? !isNaN(parseFloat(height)) : true);
export const getStylesObject = ({type = "Point", features = []} = {}) => {
    return type === "FeatureCollection" ? features.reduce((p, c) => {
        p[c.geometry.type] = DEFAULT_ANNOTATIONS_STYLES[c.geometry.type];
        return p;
    }, {type: "FeatureCollection"}) : {...DEFAULT_ANNOTATIONS_STYLES[type]};
};
export const getProperties = (props = {}) => ({title: "Default title", id: uuidv1(), ...props});
/**
* it converts any geoJSONObject to an annotation
* Mandatory elements: MUST be a geoJSON type Feature => properties with an ID and a title
* annotation style.
*/
export const normalizeAnnotation = (ann = {}, messages = {}) => {
    const annotation = ann.type === "FeatureCollection" ? {...ann} : {type: "Feature", geometry: ann};
    const style = getStylesObject(annotation);
    const properties = getProperties(annotation.properties, messages);
    return {style, properties, ...annotation};
};
/**
 * it tells if the filtered list of the coordinates is a geojson polygon,
 * with the first point = to the last
 * @param {number[[[]]]} coords the coordinates of the polygon
 * @return {boolean} true if it is a valid polygon, false otherwise
*/
export const isCompletePolygon = (coords = [[[]]]) => {
    if (coords && coords[0]) {
        const validCoords = coords[0].filter(validateCoordsArray);
        return validCoords.length > 3 && head(validCoords)[0] === last(validCoords)[0] && head(validCoords)[1] === last(validCoords)[1];
    }
    return false;
};
export const formatCoordinates = (coords = [[]]) => {
    return coords.map(c => ({
        lat: c && c[1],
        lon: c && c[0],
        ...(c[2] !== undefined && { height: c[2] })
    }));
};
export const getComponents = (geometry) => {
    const coordinates = get(geometry, 'coordinates', []);
    switch (geometry?.type) {
    case "Polygon": {
        return isCompletePolygon(coordinates) ? formatCoordinates(slice(coordinates[0], 0, coordinates[0].length - 1)) : formatCoordinates(coordinates[0]);
    }
    case "LineString": case "MultiPoint": {
        return formatCoordinates(coordinates);
    }
    default: return formatCoordinates([coordinates]);
    }
};
/**
 * This function takes an old annotations layer and converts it to a list of new annotations layers
 * @param {object} layer legacy annotation layer
 * @returns {array}
 */
export const updateAnnotationsLayer = (layer = {}) => {
    if (layer.id === ANNOTATIONS) {
        return (layer.features || [])
            .map((annotation) => {
                const features = annotation.features.map(({
                    properties,
                    geometry,
                    type
                }) => {
                    let annotationType = geometry?.type;
                    let annotationTypeProperties = { geodesic: !!(properties.geometryGeodesic || properties.useGeodesicLines) };
                    let annotationTypeGeometry = geometry;
                    if (properties.isText) {
                        annotationType = 'Text';
                        annotationTypeProperties = {
                            label: properties.valueText
                        };
                    }
                    if (properties.isCircle) {
                        annotationType = 'Circle';
                        annotationTypeProperties = {
                            radius: properties.radius,
                            geodesic: true
                        };
                        annotationTypeGeometry = {
                            type: 'Point',
                            coordinates: properties.center
                        };
                    }
                    return {
                        id: properties.id,
                        properties: {
                            ...annotationTypeProperties,
                            id: properties.id,
                            annotationType,
                            name: properties.geometryTitle ?? annotationType
                        },
                        geometry: annotationTypeGeometry,
                        type
                    };
                });
                const [minx, miny, maxx, maxy] = turfBbox({ type: 'FeatureCollection', features });
                return {
                    ...layer,
                    id: createAnnotationId(annotation?.properties?.id || uuidv1()),
                    title: annotation?.properties?.title || '',
                    description: annotation?.properties?.description,
                    visibility: annotation?.properties?.visibility,
                    rowViewer: ANNOTATIONS,
                    bbox: {
                        crs: 'EPSG:4326',
                        bounds: { minx, miny, maxx, maxy }
                    },
                    style: {
                        format: 'geostyler',
                        body: {
                            name: '',
                            rules: annotation.features.reduce((acc, {
                                geometry,
                                properties,
                                style: styles
                            }) => {
                                return [
                                    ...acc,
                                    ...(styles || []).filter(style => style.filtering !== false).map((style) => {
                                        if (style.iconColor) {
                                            return {
                                                filter: ['==', 'id', properties.id],
                                                name: style.title ?? '',
                                                symbolizers: [
                                                    {
                                                        kind: 'Icon',
                                                        image: {
                                                            name: 'msMarkerIcon',
                                                            args: [
                                                                {
                                                                    color: style.iconColor,
                                                                    shape: style.iconShape,
                                                                    glyph: style.iconGlyph
                                                                }
                                                            ]
                                                        },
                                                        anchor: 'bottom',
                                                        opacity: 1,
                                                        size: 48,
                                                        rotate: 0,
                                                        msBringToFront: false,
                                                        msHeightReference: 'none',
                                                        ...(style.geometry && {
                                                            msGeometry: {
                                                                name: style.geometry
                                                            }
                                                        })
                                                    }
                                                ]
                                            };
                                        }
                                        if (style.type === 'Circle') {
                                            return {
                                                filter: ['==', 'id', properties.id],
                                                name: style.title ?? '',
                                                symbolizers: [
                                                    {
                                                        kind: 'Circle',
                                                        color: style.fillColor,
                                                        opacity: style.fillOpacity,
                                                        outlineColor: style.color,
                                                        outlineOpacity: style.opacity,
                                                        outlineWidth: style.weight,
                                                        ...(style.dashArray && {
                                                            outlineDasharray: style.dashArray.map(value => parseFloat(value))
                                                        }),
                                                        radius: {
                                                            name: 'property',
                                                            args: ['radius']
                                                        },
                                                        geodesic: {
                                                            name: 'property',
                                                            args: ['geodesic']
                                                        }
                                                    }
                                                ]
                                            };
                                        }
                                        if (style.type === 'Text') {
                                            return {
                                                filter: ['==', 'id', properties.id],
                                                name: style.title ?? '',
                                                symbolizers: [
                                                    {
                                                        kind: 'Text',
                                                        label: '{{label}}',
                                                        font: [style.fontFamily],
                                                        color: style.fillColor,
                                                        opacity: style.fillOpacity,
                                                        size: style.fontSize,
                                                        // style.fontSizeUom
                                                        fontStyle: style.fontStyle,
                                                        fontWeight: style.fontWeight,
                                                        haloColor: style.color,
                                                        haloOpacity: style.opacity,
                                                        haloWidth: style.weight ?? 1,
                                                        allowOverlap: true,
                                                        offset: [0, 0],
                                                        msBringToFront: false,
                                                        msHeightReference: 'none'
                                                    }
                                                ]
                                            };
                                        }
                                        if (style.symbolUrl) {
                                            return {
                                                filter: ['==', 'id', properties.id],
                                                name: style.title ?? '',
                                                symbolizers: [
                                                    {
                                                        kind: 'Mark',
                                                        wellKnownName: style.symbolUrl,
                                                        color: style.fillColor,
                                                        fillOpacity: style.fillOpacity,
                                                        strokeColor: style.color,
                                                        strokeOpacity: style.opacity,
                                                        strokeWidth: style.weight,
                                                        ...(style.dashArray && {
                                                            strokeDasharray: style.dashArray.map(value => parseFloat(value))
                                                        }),
                                                        radius: style.size / 2,
                                                        rotate: 0,
                                                        msBringToFront: false,
                                                        msHeightReference: 'none'
                                                    }
                                                ]
                                            };
                                        }
                                        if (geometry.type === 'LineString') {
                                            return {
                                                filter: ['==', 'id', properties.id],
                                                name: style.title ?? '',
                                                symbolizers: [
                                                    {
                                                        kind: 'Line',
                                                        color: style.color,
                                                        width: style.weight,
                                                        opacity: style.opacity,
                                                        cap: 'round',
                                                        join: 'round',
                                                        msClampToGround: false,
                                                        ...(style.dashArray && {
                                                            dasharray: style.dashArray.map(value => parseFloat(value))
                                                        })
                                                    }
                                                ]
                                            };
                                        }
                                        if (geometry.type === 'Polygon') {
                                            return {
                                                filter: ['==', 'id', properties.id],
                                                name: style.title ?? '',
                                                symbolizers: [
                                                    {
                                                        kind: 'Fill',
                                                        color: style.fillColor,
                                                        fillOpacity: style.fillOpacity,
                                                        outlineColor: style.color,
                                                        outlineOpacity: style.opacity,
                                                        outlineWidth: style.weight,
                                                        ...(style.dashArray && {
                                                            outlineDasharray: style.dashArray.map(value => parseFloat(value))
                                                        }),
                                                        msClassificationType: 'both',
                                                        msClampToGround: true
                                                    }
                                                ]
                                            };
                                        }
                                        return null;
                                    }).filter(rule => rule !== null)
                                ];
                            }, [])
                        }
                    },
                    features
                };
            });
    }
    return [];
};

export const isGeodesicMeasure = (measureType) => [MeasureTypes.LENGTH, MeasureTypes.AREA].includes(measureType);

/**
 * This function takes an annotations layer and converts it to valid GeoJSON Feature Collection usable for export
 * @param {array} annotations annotations layers
 * @returns {object}
 */
export const annotationsToGeoJSON = (annotations) => {
    const features = annotations.reduce((acc, annotation) => {
        return [
            ...acc,
            ...(annotation.features || []).map((feature) => {
                const measureType = getMeasureType(feature);
                const isGeodesic = isGeodesicMeasure(measureType);
                let newGeom = feature.geometry;
                if (isGeodesic) {
                    newGeom = {
                        type: feature.geometry.type,
                        coordinates: measureType === MeasureTypes.LENGTH ? transformLineToArcs(feature.geometry.coordinates) : feature.geometry.coordinates.map(transformLineToArcs)
                    };
                }
                return {
                    ...feature,
                    geometry: newGeom,
                    properties: {
                        ...feature.properties,
                        ...(isGeodesic ? {originalGeom: feature.geometry} : {}),
                        annotationLayerId: annotation.id,
                        annotationLayerTitle: annotation.title,
                        annotationLayerDescription: annotation.description
                    }
                };
            })
        ];
    }, []);
    return {
        type: 'FeatureCollection',
        msType: ANNOTATIONS,
        features,
        annotations: annotations.map(annotation => {
            const { format, body } = annotation?.style || {};
            return {
                id: annotation.id,
                style: {
                    format,
                    body
                }
            };
        })
    };
};
/**
 * This function takes an GeoJSON layer with specific information and converts it to a valid annotation layers
 * @param {object} json GeoJSON feature collection with special annotations property, created with `annotationsToGeoJSON` method
 * @returns {array}
 */
export const geoJSONToAnnotations = (json) => {
    const layers = (json?.annotations || [])
        .map((annotation) => {
            const features = (json?.features || [])
                .filter((feature) => feature?.properties?.annotationLayerId === annotation.id)
                .map(feature => {
                    const measureType = getMeasureType(feature);
                    const isGeodesic = isGeodesicMeasure(measureType);
                    return isGeodesic && feature.properties.originalGeom ? {
                        ...feature,
                        geometry: feature.properties.originalGeom,
                        properties: omit(feature.properties, "originalGeom")
                    } : feature;
                });
            const {
                annotationLayerTitle: title,
                annotationLayerDescription: description
            } = features?.[0]?.properties || {};
            return {
                ...annotation,
                title,
                description,
                type: 'vector',
                visibility: true,
                rowViewer: ANNOTATIONS,
                features: features.map((feature) => {
                    const {
                        annotationLayerId,
                        annotationLayerTitle,
                        annotationLayerDescription,
                        ...properties
                    } = feature?.properties || {};
                    return {
                        ...feature,
                        properties
                    };
                })
            };
        });
    return layers;
};
/**
 * This function takes a json object and check if it could be converted in an array of annotations layers
 * @param {object} json it could be a GeoJSON with special annotations property or a legacy annotation export
 * @returns {array}
 */
export const importJSONToAnnotations = (json) => {
    if (isMSAnnotation(json)) {
        const features = json?.features.map((annotation) => normalizeAnnotation(annotation));
        const annotationsLayer = {
            type: 'vector',
            visibility: true,
            id: ANNOTATIONS,
            title: 'Annotations',
            features
        };
        return updateAnnotationsLayer(annotationsLayer);
    }
    if (isGeoJSONAnnotation(json)) {
        return geoJSONToAnnotations(json);
    }
    return [];
};
/**
 * Check if the coordinates is invalid
 * @param {number} coordinate
 * @returns {boolean}
 */
export const checkInvalidCoordinate = (coord) => !(isNumber(coord) && !isNaN(coord));
/**
 * Fix polygon coordinates to ensure a closed ring
 * @param {array} coordinates GeoJSON polygon coordinates
 * @returns {array}
 */
export const cleanPolygonCoordinates = (coordinates) => {
    const firstCoordinates = coordinates[0][0];
    const lastCoordinates = coordinates[0][coordinates[0].length - 1];
    const validCoordinates = coordinates[0].filter((coords) => !coords.some(checkInvalidCoordinate));
    return isEqual(firstCoordinates, lastCoordinates)
        ? coordinates
        : validCoordinates.length >= 3
            ? [[...coordinates[0], firstCoordinates]]
            : coordinates;
};
/**
 * Parse coordinates updated with geometry editor component to be assigned to the correct feature type
 * @param {string} geometryType one of `Point`, `LineString` or `Polygon`
 * @param {array} updatedCoordinates coordinates to check
 * @returns {array}
 */
export const parseUpdatedCoordinates = (geometryType, updatedCoordinates) => {
    const hasHeight = !!updatedCoordinates.find((coords) => coords[2] !== undefined);
    const coordinates = hasHeight ? updatedCoordinates.map(([lng, lat, height]) => [lng, lat, height === undefined ? 0 : height]) : updatedCoordinates;
    if (geometryType === 'Point') {
        return coordinates[0];
    }
    if (geometryType === 'Polygon') {
        return cleanPolygonCoordinates([coordinates]);
    }
    return coordinates;
};
// new default style symbolizers for annotations
export const annotationsSymbolizerDefaultProperties = {
    Icon: {
        kind: 'Icon',
        image: {
            name: 'msMarkerIcon',
            args: [
                {
                    color: 'blue',
                    shape: 'circle',
                    glyph: 'comment'
                }
            ]
        },
        opacity: 1,
        size: 46,
        rotate: 0,
        msBringToFront: false,
        anchor: 'bottom',
        msHeightReference: 'none'
    },
    Line: {
        kind: 'Line',
        color: '#777777',
        width: 1,
        opacity: 1,
        cap: 'round',
        join: 'round',
        msClampToGround: false
    },
    Fill: {
        kind: 'Fill',
        color: '#dddddd',
        fillOpacity: 1,
        outlineColor: '#777777',
        outlineWidth: 1,
        msClassificationType: 'both'
    },
    Circle: {
        kind: 'Circle',
        color: '#dddddd',
        opacity: 1,
        outlineColor: '#777777',
        outlineOpacity: 1,
        outlineWidth: 1,
        msClassificationType: 'both'
    },
    Text: {
        kind: 'Text',
        color: '#333333',
        size: 14,
        font: ['Arial'],
        fontStyle: 'normal',
        fontWeight: 'normal',
        haloColor: '#ffffff',
        haloWidth: 1,
        allowOverlap: true,
        offset: [0, 0],
        msBringToFront: false,
        msHeightReference: 'none',
        anchor: 'bottom'
    }
};
/**
 * It return a default style symbolizer for annotations that could be used in a geostyler style
 * @param {object} feature a GeoJSON feature with `annotationType` property
 * @param {object} defaultSymbolizers optional styles overrides, see `annotationsSymbolizerDefaultProperties`
 * @returns {object}
 */
export const createDefaultStyleSymbolizer = (feature, defaultSymbolizers = {}) => {
    const { annotationType } = feature?.properties || {};
    const defaultSymbolizer = defaultSymbolizers[annotationType];
    if (annotationType === 'Point') {
        return defaultSymbolizer || annotationsSymbolizerDefaultProperties.Icon;
    }
    if (annotationType === 'LineString') {
        return defaultSymbolizer || annotationsSymbolizerDefaultProperties.Line;
    }
    if (annotationType === 'Polygon') {
        return defaultSymbolizer || annotationsSymbolizerDefaultProperties.Fill;
    }
    if (annotationType === 'Circle') {
        return {
            ...(defaultSymbolizer || annotationsSymbolizerDefaultProperties.Circle),
            msClampToGround: {
                name: 'property',
                args: ['geodesic']
            },
            radius: {
                name: 'property',
                args: ['radius']
            },
            geodesic: {
                name: 'property',
                args: ['geodesic']
            }
        };
    }
    if (annotationType === 'Text') {
        return {
            ...(defaultSymbolizer || annotationsSymbolizerDefaultProperties.Text),
            label: '{{label}}'
        };
    }
    return null;
};
// validate properties for specific annotation features
const validateProperties = (feature) => {
    if (feature?.properties?.annotationType === 'Text') {
        return !!feature?.properties?.label;
    }
    if (feature?.properties?.annotationType === 'Circle') {
        return !!feature?.properties?.radius;
    }
    return true;
};
/**
 * It validates an annotation feature
 * @param {object} feature a GeoJSON feature with `annotationType` property
 * @param {boolean} onlyCoordinates if true validate only the coordinates
 * @returns {boolean}
 */
export const validateFeature = (feature, onlyCoordinates) => {
    const geometryType = feature?.geometry?.type;
    const coordinates = feature?.geometry?.coordinates;
    if (geometryType === 'Point') {
        return (onlyCoordinates
            ? !coordinates.some(checkInvalidCoordinate)
            : validateProperties(feature)) && !coordinates.some(checkInvalidCoordinate);
    }
    if (geometryType === 'LineString') {
        return coordinates.length > 1 && !coordinates.some((coords) => coords.some(checkInvalidCoordinate));
    }
    if (geometryType === 'Polygon') {
        return coordinates?.[0]?.length > 3 && !coordinates.some((rings) =>
            rings.some((coords) => coords.some(checkInvalidCoordinate))
        );
    }
    return !!geometryType;
};
/**
 * It applies default invalid coordinates for new annotation features
 * @param {object} feature a GeoJSON feature with `annotationType` property
 * @returns {object}
 */
export const applyDefaultCoordinates = (feature) => {
    if (feature.geometry === null && feature?.properties?.annotationType) {
        if (feature.properties.annotationType === 'Point') {
            return {
                ...feature,
                geometry: {
                    type: 'Point',
                    coordinates: ['', '']
                }
            };
        }
        if (feature.properties.annotationType === 'LineString') {
            return {
                ...feature,
                geometry: {
                    type: 'LineString',
                    coordinates: [['', '']]
                }
            };
        }
        if (feature.properties.annotationType === 'Polygon') {
            return {
                ...feature,
                geometry: {
                    type: 'Polygon',
                    coordinates: [[['', '']]]
                }
            };
        }
        if (feature.properties.annotationType === 'Text') {
            return {
                ...feature,
                geometry: {
                    type: 'Point',
                    coordinates: ['', '']
                }
            };
        }
        if (feature.properties.annotationType === 'Circle') {
            return {
                ...feature,
                geometry: {
                    type: 'Point',
                    coordinates: ['', '']
                }
            };
        }
    }
    return feature;
};
/**
 * It returns a glyph name associated with an annotation
 * @param {object} feature a GeoJSON feature with `annotationType` or `measureType` properties
 * @returns {string}
 */
export const getFeatureIcon = (feature) => {

    if (feature?.properties?.measureType) {
        return measureIcons[feature.properties.measureType];
    }
    const annotationsIcons = {
        'Point': 'point',
        'LineString': 'polyline',
        'Polygon': 'polygon',
        'Text': 'font',
        'Circle': '1-circle'
    };
    return annotationsIcons[feature?.properties?.annotationType];
};
