/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import tinycolor from 'tinycolor2';
import uuidv1 from 'uuid/v1';
import defaultIcon from '../components/map/openlayers/img/marker-icon.png';
import isEmpty from 'lodash/isEmpty';
import { flattenFeatures } from './VectorStyleUtils';

/**
 * get the main geometry type defined in an array of features
 * @param {object} options options of a layer
 * @param {array} options.features array of GeoJSON features
 * @returns {string} the geometry type without the 'Multi' prefix
 */
const getFeatureCollectionSingleGeometryType = ({ features } = {}) => {
    const { geometry: validGeometry } = (features || []).find(({ geometry }) => geometry?.type) || {};
    if (!validGeometry) {
        return null;
    }
    const singleGeometryType = validGeometry.type.replace('Multi', '');
    if (singleGeometryType === 'GeometryCollection') {
        return 'GeometryCollection';
    }
    const isGeometryCollection = (features || []).find(({ geometry }) => geometry?.type?.replace('Multi', '') !== singleGeometryType);
    return isGeometryCollection ? 'GeometryCollection' : singleGeometryType;
};

/**
 * create a default style in geostyler format
 * @param {object} layer options of a layer
 * @param {boolean} marker if true creates a marker style
 * @param {string} fillColor fill color in hex format
 * @param {number} fillOpacity fill opacity from 0 to 1
 * @param {string} strokeColor stroke color in hex format
 * @param {number} strokeOpacity stroke opacity from 0 to 1
 * @param {number} strokeWidth the width of the stroke or outline
 * @param {number} radius the radius of the circle representing the default marker for points
 * @param {string} geometryType one of 'GeometryCollection', 'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon' or 'MultiPolygon'
 * @returns {object} style in geostyler format
 */
export const createDefaultStyle = ({
    marker,
    fillColor = '#f2f2f2',
    fillOpacity = 0.3,
    strokeColor = '#3075e9',
    strokeOpacity = 1,
    strokeWidth = 2,
    radius = 10,
    geometryType = 'GeometryCollection'
}) => {
    return {
        format: 'geostyler',
        metadata: { editorType: 'visual' },
        body: {
            rules: [
                ...(marker ? [{
                    name: 'Default Marker Style',
                    ruleId: uuidv1(),
                    symbolizers: [
                        {
                            kind: 'Icon',
                            image: defaultIcon,
                            opacity: 1,
                            size: 32,
                            rotate: 0,
                            msBringToFront: true,
                            msHeightReference: 'none',
                            symbolizerId: uuidv1()
                        }
                    ]
                }] : []),
                ...(['GeometryCollection', 'Point', 'MultiPoint'].includes(geometryType) && !marker ? [{
                    name: 'Default Point Style',
                    ruleId: uuidv1(),
                    symbolizers: [
                        {
                            kind: 'Mark',
                            color: fillColor,
                            fillOpacity,
                            opacity: 1,
                            strokeColor,
                            strokeOpacity,
                            strokeWidth,
                            wellKnownName: 'Circle',
                            radius,
                            msBringToFront: true,
                            symbolizerId: uuidv1()
                        }
                    ]
                }] : []),
                ...(['GeometryCollection', 'LineString', 'MultiLineString'].includes(geometryType) && !marker ? [{
                    name: 'Default Line Style',
                    ruleId: uuidv1(),
                    symbolizers: [
                        {
                            kind: 'Line',
                            color: strokeColor,
                            opacity: strokeOpacity,
                            width: strokeWidth,
                            symbolizerId: uuidv1()
                        }
                    ]
                }] : []),
                ...(['GeometryCollection', 'Polygon', 'MultiPolygon'].includes(geometryType) && !marker ? [{
                    name: 'Default Polygon Style',
                    ruleId: uuidv1(),
                    symbolizers: [
                        {
                            kind: 'Fill',
                            color: fillColor,
                            fillOpacity: fillOpacity,
                            outlineColor: strokeColor,
                            outlineOpacity: strokeOpacity,
                            outlineWidth: strokeWidth,
                            symbolizerId: uuidv1()
                        }
                    ]
                }] : [])
            ]
        }
    };
};

/**
 * check if a layer contains a custom style
 * @param {object} layer options of a layer
 * @param {object} customStyle a simplified custom style configuration
 * @param {boolean} customStyle.marker if true creates a marker style but the layer features should be of type 'Point' or 'MultiPoint'
 * @param {object} customStyle.fill an object representing the fill color, eg: { r: 255, g: 0, b: 0, a: 1 }
 * @param {object} customStyle.color an object representing the stroke or outline color, eg: { r: 255, g: 0, b: 0, a: 1 }
 * @param {number} customStyle.width the width of the stroke or outline
 * @param {number} customStyle.radius the radius of the circle representing the default marker for points
 * @returns {object} layer configuration with the new style
 */
export const applyDefaultStyleToVectorLayer = (layer, customStyle) => {

    const features = flattenFeatures(layer?.features || []);
    const hasFeatureStyle = features.find(feature => !isEmpty(feature?.style || {}) && feature?.properties?.id);
    if (hasFeatureStyle
    || layer?.style?.format && !isEmpty(layer?.style?.body)
    || !layer?.style?.format && !isEmpty(layer.style)) {
        return layer;
    }

    const geometryType = getFeatureCollectionSingleGeometryType({ features });
    const markerStyle = !!(customStyle?.marker && ['Point', 'MultiPoint'].includes(geometryType));
    const fillColor = customStyle && tinycolor(customStyle.fill).toHexString();
    const fillOpacity = customStyle?.fill?.a;
    const strokeColor = customStyle && tinycolor(customStyle?.color).toHexString();
    const strokeOpacity = customStyle?.color?.a;
    const strokeWidth = customStyle?.width;
    const radius = customStyle?.radius;

    return {
        ...layer,
        ...(markerStyle && { handleClickOnLayer: true }),
        style: createDefaultStyle(customStyle
            ? {
                marker: markerStyle,
                fillColor,
                fillOpacity,
                strokeColor,
                strokeOpacity,
                strokeWidth,
                radius,
                geometryType
            }
            : { geometryType }
        )
    };
};

/**
 * Creates a marker SVG data URL
 * @param {string} fillColor - The color of the marker
 * @param {number} size - The size of the marker
 * @param {number} number - The number of the marker
 * @returns {string} The SVG data URL
 */
export const createMarkerSvgDataUrl = (fillColor, size, number) => {
    const svg = !number ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.5}" viewBox="0 0 32 48">
        <path
            d="M16 0C8 0 0 8 0 16c0 10 16 32 16 32s16-22 16-32c0-8-8-16-16-16z"
            fill="${fillColor}"
            stroke="#000"
            stroke-opacity="0.2"
            stroke-width="1"
        />
        <circle cx="16" cy="16" r="6" fill="#fff" />
        </svg>
    ` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.5}" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#fff" stroke="${fillColor}" stroke-width="4" />
            <text x="16" y="17" text-anchor="middle" dominant-baseline="middle"
            font-size="16" font-family="sans-serif" fill="#000">${number}</text>
        </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};
