/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { v1 as uuidv1 } from 'uuid';
import turfBbox from '@turf/bbox';

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
