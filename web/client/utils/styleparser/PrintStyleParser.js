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
    drawIcons
} from './StyleParserUtils';
import { geometryFunctionsLibrary } from './GeometryFunctionsUtils';

const getGeometryFunction = geometryFunctionsLibrary.geojson();

const symbolizerToPrintMSStyle = (symbolizer, feature, layer) => {
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
        return {
            graphicWidth: symbolizer.size,
            graphicHeight: symbolizer.size,
            externalGraphic: symbolizer.image,
            graphicXOffset: -symbolizer.size / 2,
            graphicYOffset: -symbolizer.size / 2,
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
            // Valid values for horizontal alignment: "l"=left, "c"=center,
            // "r"=right. Valid values for vertical alignment: "t"=top,
            // "m"=middle, "b"=bottom.
            labelAlign: 'cm',
            labelXOffset: symbolizer?.offset?.[0] || 0,
            labelYOffset: -(symbolizer?.offset?.[1] || 0),
            rotation: -(symbolizer.rotate || 0),
            fontColor: symbolizer.color,
            fontOpacity: 1 * globalOpacity,
            label: resolveAttributeTemplate(feature, symbolizer.label, ''),
            // does not work
            // the halo color cover the text
            /*
            ...(symbolizer.haloWidth > 0 && {
                labelOutlineColor: symbolizer.haloColor,
                labelOutlineOpacity: 1 * globalOpacity,
                labelOutlineWidth: symbolizer.haloWidth
            }),
            */
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
            fillColor: symbolizer.color,
            fillOpacity: symbolizer.fillOpacity * globalOpacity
        };
    }
    return {
        display: 'none'
    };
};

export const getPrintStyleFuncFromRules = (geoStylerStyle) => {
    return ({
        layer
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

                    const additionalPointSymbolizers = symbolizers.filter((symbolizer, idx) =>
                        ['Mark', 'Icon', 'Text', 'Model'].includes(symbolizer.kind)
                        && (
                            ['Polygon'].includes(geometryType)
                            || ['LineString'].includes(geometryType)
                            || ['Point'].includes(geometryType) && idx < pointGeometrySymbolizers.length - 1
                        )
                    );

                    const symbolizer = pointGeometrySymbolizers[pointGeometrySymbolizers.length - 1]
                        || polylineGeometrySymbolizers[polylineGeometrySymbolizers.length - 1]
                        || polygonGeometrySymbolizers[polygonGeometrySymbolizers.length - 1];

                    let geometry = feature.geometry;
                    const geometryFunction = getGeometryFunction(symbolizer);
                    if (geometryFunction && geometryType === 'LineString') {
                        geometry = {
                            type: 'LineString',
                            coordinates: geometryFunction(feature)
                        };
                    }

                    return [
                        {
                            ...feature,
                            geometry,
                            properties: {
                                ...feature?.properties,
                                ms_style: symbolizerToPrintMSStyle(symbolizer, feature, layer)
                            }
                        },
                        ...additionalPointSymbolizers.map((additionalSymbolizer) => {
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
                                            ms_style: symbolizerToPrintMSStyle(additionalSymbolizer, feature, layer)
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
                drawIcons(geoStylerStyle)
                    .then((images = []) => {
                        const styleFunc = getPrintStyleFuncFromRules(geoStylerStyle, { images });
                        resolve(styleFunc);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default PrintStyleParser;
