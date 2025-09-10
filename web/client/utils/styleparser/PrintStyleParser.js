/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { flatten } from 'lodash';
import turfFlatten from '@turf/flatten';
import {
    resolveAttributeTemplate,
    geoStylerStyleFilter,
    drawWellKnownNameImageFromSymbolizer,
    parseSymbolizerExpressions,
    getCachedImageById
} from './StyleParserUtils';
import { drawIcons } from './IconUtils';

import { geometryFunctionsLibrary } from './GeometryFunctionsUtils';
import { circleToPolygon } from '../DrawGeometryUtils';

const getGeometryFunction = geometryFunctionsLibrary.geojson();

const anchorToGraphicOffset = (anchor, width, height) => {
    switch (anchor) {
    case 'top-left':
        return [0, 0];
    case 'top':
        return [-(width / 2), 0];
    case 'top-right':
        return [-width, 0];
    case 'left':
        return [0, -(height / 2)];
    case 'center':
        return [-(width / 2), -(height / 2)];
    case 'right':
        return [-width, -(height / 2)];
    case 'bottom-left':
        return [0, -height];
    case 'bottom':
        return [-(width / 2), -height];
    case 'bottom-right':
        return [-width, -height];
    default:
        return [-(width / 2), -(height / 2)];
    }
};

const anchorToLabelAlign = (anchor) => {
    switch (anchor) {
    case 'top-left':
        return 'lt';
    case 'top':
        return 'ct';
    case 'top-right':
        return 'rt';
    case 'left':
        return 'lm';
    case 'center':
        return 'cm';
    case 'right':
        return 'rm';
    case 'bottom-left':
        return 'lb';
    case 'bottom':
        return 'cb';
    case 'bottom-right':
        return 'rb';
    default:
        return 'cm';
    }
};

const symbolizerToPrintMSStyle = (symbolizer, feature, layer, originalSymbolizer) => {
    const globalOpacity = layer.opacity === undefined ? 1 : layer.opacity;
    if (symbolizer.kind === 'Mark') {
        const { width, height, canvas }  = drawWellKnownNameImageFromSymbolizer(symbolizer);
        return {
            graphicWidth: width,
            graphicHeight: height,
            externalGraphic: canvas.toDataURL(),
            graphicXOffset: -width / 2,
            graphicYOffset: -height / 2,
            rotation: symbolizer.rotate || 0,
            graphicOpacity: globalOpacity
        };
    }
    if (symbolizer.kind === 'Icon') {
        const { width = symbolizer.size, height = symbolizer.size }  = getCachedImageById(originalSymbolizer);
        const aspect = width / height;
        let iconSizeW = symbolizer.size;
        let iconSizeH = iconSizeW / aspect;
        if (height > width) {
            iconSizeH = symbolizer.size;
            iconSizeW = iconSizeH * aspect;
        }
        const [graphicXOffset, graphicYOffset] = anchorToGraphicOffset(symbolizer.anchor, iconSizeW, iconSizeH);
        return {
            graphicWidth: iconSizeW,
            graphicHeight: iconSizeH,
            externalGraphic: symbolizer.image,
            graphicXOffset,
            graphicYOffset,
            rotation: symbolizer.rotate || 0,
            graphicOpacity: symbolizer.opacity * globalOpacity
        };
    }
    if (symbolizer.kind === 'Text') {
        return {
            // not supported
            // fontStyle: symbolizer.fontStyle,
            fontSize: symbolizer.size, // in mapfish is in px
            // Supported itext fonts: COURIER, HELVETICA, TIMES_ROMAN
            fontFamily: (symbolizer.font || ['TIMES_ROMAN'])[0],
            fontWeight: symbolizer.fontWeight,
            labelAlign: anchorToLabelAlign(symbolizer.anchor),
            labelXOffset: symbolizer?.offset?.[0] || 0,
            labelYOffset: -(symbolizer?.offset?.[1] || 0),
            rotation: -(symbolizer.rotate || 0),
            fontColor: symbolizer.color,
            fontOpacity: 1 * globalOpacity,
            label: resolveAttributeTemplate(feature, symbolizer.label, ''),
            // Halo information
            ...(symbolizer.haloWidth > 0 && {
                labelOutlineColor: symbolizer.haloColor,
                labelOutlineOpacity: 1 * globalOpacity,
                labelOutlineWidth: symbolizer.haloWidth,
                labelOutlineMode: 'halo'
            }),
            // hide default point
            fillOpacity: 0,
            pointRadius: 0,
            strokeOpacity: 0,
            strokeWidth: 0
        };
    }
    if (symbolizer.kind === 'Line') {
        return {
            strokeColor: symbolizer.color,
            strokeOpacity: symbolizer.opacity * globalOpacity,
            strokeWidth: symbolizer.width,
            ...(symbolizer.dasharray && { strokeDashstyle: symbolizer.dasharray.join(" ") })
        };
    }
    if (symbolizer.kind === 'Fill') {
        return {
            strokeColor: symbolizer.outlineColor,
            strokeOpacity: (symbolizer.outlineOpacity ?? 0) * globalOpacity,
            strokeWidth: symbolizer.outlineWidth ?? 0,
            ...(symbolizer.outlineDasharray && { strokeDashstyle: symbolizer.outlineDasharray.join(" ") }),
            fillColor: symbolizer.color,
            fillOpacity: symbolizer.fillOpacity * globalOpacity
        };
    }
    if (symbolizer.kind === 'Circle') {
        return {
            strokeColor: symbolizer.outlineColor,
            strokeOpacity: (symbolizer.outlineOpacity ?? 0) * globalOpacity,
            strokeWidth: symbolizer.outlineWidth ?? 0,
            ...(symbolizer.outlineDasharray && { strokeDashstyle: symbolizer.outlineDasharray.join(" ") }),
            fillColor: symbolizer.color,
            fillOpacity: symbolizer.opacity * globalOpacity
        };
    }
    return {
        display: 'none'
    };
};

export const getPrintStyleFuncFromRules = (geoStylerStyle) => {
    return ({
        layer,
        spec = { projection: 'EPSG:3857' }
    }) => {
        if (!layer?.features) {
            return [];
        }
        const collection = turfFlatten({ type: 'FeatureCollection', features: layer.features});
        return flatten(collection.features
            .map((feature) => {
                const validRules = geoStylerStyle?.rules?.filter((rule) => !rule.filter || geoStylerStyleFilter(feature, rule.filter));
                if (validRules.length > 0) {
                    const geometryType = feature.geometry.type;
                    const symbolizers = validRules.reduce((acc, rule) => [...acc, ...rule?.symbolizers], []);
                    const pointGeometrySymbolizers = symbolizers.filter((symbolizer) =>
                        ['Mark', 'Icon', 'Text', 'Model'].includes(symbolizer.kind) && ['Point'].includes(geometryType)
                    );
                    const polylineGeometrySymbolizers = symbolizers.filter((symbolizer) =>
                        symbolizer.kind === 'Line' && ['LineString'].includes(geometryType)
                    );
                    const polygonGeometrySymbolizers = symbolizers.filter((symbolizer) =>
                        symbolizer.kind === 'Fill' && ['Polygon'].includes(geometryType)
                    );

                    const circleGeometrySymbolizers = symbolizers.filter((symbolizer) =>
                        symbolizer.kind === 'Circle' && ['Point'].includes(geometryType)
                    );

                    const additionalPointSymbolizers = symbolizers.filter((symbolizer, idx) =>
                        ['Mark', 'Icon', 'Text', 'Model'].includes(symbolizer.kind)
                        && (
                            ['Polygon'].includes(geometryType)
                            || ['LineString'].includes(geometryType)
                            || ['Point'].includes(geometryType) && (circleGeometrySymbolizers.length === 0
                                ? idx < pointGeometrySymbolizers.length - 1
                                : true)
                        )
                    );
                    const originalSymbolizer = circleGeometrySymbolizers[circleGeometrySymbolizers.length - 1]
                    || pointGeometrySymbolizers[pointGeometrySymbolizers.length - 1]
                    || polylineGeometrySymbolizers[polylineGeometrySymbolizers.length - 1]
                    || polygonGeometrySymbolizers[polygonGeometrySymbolizers.length - 1];

                    const symbolizer = parseSymbolizerExpressions(originalSymbolizer, feature);

                    let geometry = feature.geometry;
                    const geometryFunction = getGeometryFunction(symbolizer);
                    if (geometryFunction && (geometryType === 'LineString' || geometryType === 'Polygon')) {
                        geometry = {
                            type: geometryType,
                            coordinates: geometryFunction(feature)
                        };
                    }
                    if (geometryType === 'Point' && circleGeometrySymbolizers.length) {
                        geometry = circleToPolygon(feature.geometry.coordinates, symbolizer.radius, symbolizer.geodesic, {
                            projection: spec.projection
                        });
                    }

                    return [
                        {
                            ...feature,
                            geometry,
                            properties: {
                                ...feature?.properties,
                                ms_style: symbolizerToPrintMSStyle(symbolizer, feature, layer, originalSymbolizer)
                            }
                        },
                        ...additionalPointSymbolizers.map((_additionalSymbolizer) => {
                            const additionalSymbolizer = parseSymbolizerExpressions(_additionalSymbolizer, feature);
                            const geomFunction = getGeometryFunction({ msGeometry: { name: 'centerPoint' }, ...additionalSymbolizer});
                            if (geomFunction) {
                                const coordinates = geomFunction(feature);
                                if (coordinates) {
                                    return {
                                        ...feature,
                                        geometry: {
                                            type: 'Point',
                                            coordinates
                                        },
                                        properties: {
                                            ...feature?.properties,
                                            ms_style: symbolizerToPrintMSStyle(additionalSymbolizer, feature, layer, _additionalSymbolizer)
                                        }
                                    };
                                }
                            }
                            return null;
                        }).filter((feat) => !!feat)
                    ];
                }
                return [];
            }));
    };
};

class PrintStyleParser {

    readStyle() {
        return new Promise((resolve, reject) => {
            try {
                resolve(null);
            } catch (error) {
                reject(error);
            }
        });
    }

    writeStyle(geoStylerStyle, sync) {
        if (sync) {
            return getPrintStyleFuncFromRules(geoStylerStyle);
        }
        return new Promise((resolve, reject) => {
            try {
                const styleFunc = (options) => drawIcons(geoStylerStyle)
                    .then((images = []) => {
                        return getPrintStyleFuncFromRules(geoStylerStyle, { images })(options);
                    });
                resolve(styleFunc);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default PrintStyleParser;
