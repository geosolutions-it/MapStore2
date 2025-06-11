/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import L from 'leaflet';
import { castArray, flatten } from 'lodash';
import 'ol/geom/Polygon';
import {
    resolveAttributeTemplate,
    geoStylerStyleFilter,
    getImageIdFromSymbolizer,
    parseSymbolizerExpressions
} from './StyleParserUtils';
import { drawIcons } from './IconUtils';

import { geometryFunctionsLibrary } from './GeometryFunctionsUtils';
import { circleToPolygon } from '../DrawGeometryUtils';

const geometryTypeToKind = {
    'Point': ['Mark', 'Icon', 'Text', 'Circle'],
    'MultiPoint': ['Mark', 'Icon', 'Text'],
    'LineString': ['Line'],
    'MultiLineString': ['Line'],
    'Polygon': ['Fill'],
    'MultiPolygon': ['Fill']
};

const getGeometryFunction = geometryFunctionsLibrary.geojson();

const anchorToPoint = (anchor, width, height) => {
    switch (anchor) {
    case 'top-left':
        return [0, 0];
    case 'top':
        return [width / 2, 0];
    case 'top-right':
        return [width, 0];
    case 'left':
        return [0, height / 2];
    case 'center':
        return [width / 2, height / 2];
    case 'right':
        return [width, height / 2];
    case 'bottom-left':
        return [0, height];
    case 'bottom':
        return [width / 2, height];
    case 'bottom-right':
        return [width, height];
    default:
        return [width / 2, height / 2];
    }
};

const anchorToTransform = (anchor) => {
    switch (anchor) {
    case 'top-left':
        return ['0px', '0px'];
    case 'top':
        return ['-50%', '0px'];
    case 'top-right':
        return ['-100%', '0px'];
    case 'left':
        return ['0px', '-50%'];
    case 'center':
        return ['-50%', '-50%'];
    case 'right':
        return ['-100%', '-50%'];
    case 'bottom-left':
        return ['0px', '-100%'];
    case 'bottom':
        return ['-50%', '-100%'];
    case 'bottom-right':
        return ['-100%', '-100%'];
    default:
        return ['-50%', '-50%'];
    }
};

function getStyleFuncFromRules({ rules: geoStylerStyleRules = [] }) {

    // the last rules of the array should the one we'll apply
    // in case we have multiple symbolizers on the same features
    // we ensure to find the last symbolizer matching the filter and geometry type
    // by reversing all the rules
    const rules = [...geoStylerStyleRules].reverse();
    return ({
        opacity: globalOpacity = 1,
        layer = {},
        features
    } = {}) => drawIcons({ rules: geoStylerStyleRules }, { features }).then((images = []) =>  {

        if (layer._msAdditionalLayers) {
            layer._msAdditionalLayers.forEach((additionalLayer) => {
                additionalLayer.remove();
            });
        }

        layer._msAdditionalLayers = [];

        const pointToLayer = ({ symbolizer: _symbolizer, latlng, feature }) => {
            const symbolizer = parseSymbolizerExpressions(_symbolizer, feature);
            if (symbolizer.kind === 'Mark') {
                const { image, src, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(symbolizer, _symbolizer)) || {};
                if (image) {
                    const aspect = width / height;
                    const size = symbolizer.radius * 2;
                    let iconSizeW = size;
                    let iconSizeH = iconSizeW / aspect;
                    if (height > width) {
                        iconSizeH = size;
                        iconSizeW = iconSizeH * aspect;
                    }
                    return L.marker(latlng, {
                        icon: L.icon({
                            iconUrl: src,
                            iconSize: [iconSizeW, iconSizeH],
                            iconAnchor: [iconSizeW / 2, iconSizeH / 2]
                        }),
                        opacity: 1 * globalOpacity
                    });
                }
            }
            if (symbolizer.kind === 'Icon') {
                const { image, src, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(symbolizer, _symbolizer)) || {};
                if (image) {
                    const aspect = width / height;
                    let iconSizeW = symbolizer.size;
                    let iconSizeH = iconSizeW / aspect;
                    if (height > width) {
                        iconSizeH = symbolizer.size;
                        iconSizeW = iconSizeH * aspect;
                    }
                    return L.marker(latlng, {
                        icon: L.icon({
                            iconUrl: src,
                            iconSize: [iconSizeW, iconSizeH],
                            iconAnchor: anchorToPoint(symbolizer.anchor, iconSizeW, iconSizeH)
                        }),
                        opacity: symbolizer.opacity * globalOpacity
                    });
                }
            }
            if (symbolizer.kind === 'Text') {
                const label = resolveAttributeTemplate(feature, symbolizer.label, '');
                const haloProperties = `
                    -webkit-text-stroke-width:${symbolizer.haloWidth}px;
                    -webkit-text-stroke-color:${symbolizer.haloColor || ''};
                `;
                const [anchorH, anchorV] = anchorToTransform(symbolizer.anchor);
                const textIcon = L.divIcon({
                    html: `<div style="
                        color:${symbolizer.color};
                        font-family: ${castArray(symbolizer.font || []).join(', ')};
                        font-style: ${symbolizer.fontStyle || 'normal'};
                        font-weight: ${symbolizer.fontWeight || 'normal'};
                        font-size: ${symbolizer.size}px;

                        position: absolute;
                        transform: translate(calc(${anchorH} + ${symbolizer?.offset?.[0] ?? 0}px), calc(${anchorV} + ${symbolizer?.offset?.[1] ?? 0}px)) rotateZ(${symbolizer?.rotate ?? 0}deg);

                        ${symbolizer.haloWidth > 0 ? haloProperties : ''}
                    ">
                        ${label}
                        </div>`,
                    className: ''
                });
                return L.marker(latlng, {
                    icon: textIcon,
                    opacity: 1 * globalOpacity
                });
            }
            if (symbolizer.kind === 'Circle') {
                const radius = symbolizer.radius;
                const geodesic = symbolizer.geodesic;
                const geoJSONLayer = L.geoJSON({
                    ...feature,
                    geometry: circleToPolygon(feature.geometry.coordinates, radius, geodesic)
                });
                geoJSONLayer.setStyle({
                    fill: true,
                    stroke: true,
                    fillColor: symbolizer.color,
                    fillOpacity: symbolizer.opacity * globalOpacity,
                    color: symbolizer.outlineColor,
                    opacity: (symbolizer.outlineOpacity ?? 0) * globalOpacity,
                    weight: symbolizer.outlineWidth ?? 0,
                    ...(symbolizer.outlineDasharray && { dashArray: symbolizer.outlineDasharray.join(' ') })
                });
                return geoJSONLayer;
            }
            return null;
        };
        return {
            filter: (feature) => {
                const geometryType = feature?.geometry?.type;
                if (rules.length === 0) {
                    return false;
                }
                const supportedKinds = geometryTypeToKind[geometryType] || [];
                if (rules
                    .find(rule =>
                        // the symbolizer should be included in the supported ones
                        rule?.symbolizers?.find(symbolizer => ['Fill', 'Line'].includes(symbolizer.kind) || supportedKinds.includes(symbolizer.kind))
                        // the filter should match the expression or be undefined
                        && (!rule.filter || geoStylerStyleFilter(feature, rule.filter))
                    )
                ) {
                    return true;
                }
                return false;
            },
            pointToLayer: (feature, latlng) => {
                const geometryType = feature?.geometry?.type;
                const supportedKinds = geometryTypeToKind[geometryType] || [];
                const validRules = rules
                    .filter(rule =>
                        // the symbolizer should be included in the supported ones
                        rule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind))
                        // the filter should match the expression or be undefined
                        && (!rule.filter || geoStylerStyleFilter(feature, rule.filter))
                    ) || {};
                const symbolizers = flatten(validRules.map((rule) => rule.symbolizers.filter(({ kind }) => supportedKinds.includes(kind))));
                symbolizers.forEach((symbolizer, idx) => {
                    if (idx > 0) {
                        const pointLayer = pointToLayer({ symbolizer, latlng, feature });
                        layer._msAdditionalLayers.push(pointLayer);
                        layer.addLayer(pointLayer);
                    }
                });
                const firstValidSymbolizer = symbolizers[0];
                return pointToLayer({
                    symbolizer: firstValidSymbolizer,
                    latlng,
                    feature
                });
            },
            style: (feature) => {
                if (feature?.geometry?.type === 'Point') {
                    return null;
                }
                const geometryType = feature?.geometry?.type;
                const supportedKinds = geometryTypeToKind[geometryType] || [];
                const validRules = rules
                    .filter(rule =>
                        // the filter should match the expression or be undefined
                        (!rule.filter || geoStylerStyleFilter(feature, rule.filter))
                    ) || {};

                (['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(geometryType)
                    ? flatten(validRules.map((rule) => rule.symbolizers.filter(({ kind }) => ['Mark', 'Icon', 'Text'].includes(kind))))
                    : [])
                    .forEach((_symbolizer) => {
                        const symbolizer = parseSymbolizerExpressions(_symbolizer, feature);
                        const geometryFunction = getGeometryFunction({ msGeometry: { name: 'centerPoint' }, ...symbolizer});
                        if (geometryFunction) {
                            const coordinates = geometryFunction(feature);
                            if (coordinates) {
                                const latlng = L.latLng(coordinates[1], coordinates[0]);
                                const pointLayer = pointToLayer({ symbolizer, latlng, feature });
                                layer._msAdditionalLayers.push(pointLayer);
                                layer.addLayer(pointLayer);
                            }
                        }
                    });

                const firstValidRule = validRules
                    .find(rule =>
                        // the symbolizer should be included in the supported ones
                        rule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind))
                    ) || {};
                const firstValidSymbolizer = parseSymbolizerExpressions(firstValidRule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind)) || {}, feature);
                if (firstValidSymbolizer.kind === 'Line') {
                    const geometryFunction = getGeometryFunction(firstValidSymbolizer);
                    const style = {
                        stroke: true,
                        fill: false,
                        color: firstValidSymbolizer.color,
                        opacity: firstValidSymbolizer.opacity * globalOpacity,
                        weight: firstValidSymbolizer.width,
                        ...(firstValidSymbolizer.dasharray && { dashArray: firstValidSymbolizer.dasharray.join(' ') }),
                        ...(firstValidSymbolizer.cap && { lineCap: firstValidSymbolizer.cap }),
                        ...(firstValidSymbolizer.join && { lineJoin: firstValidSymbolizer.join })
                    };
                    if (geometryFunction && feature.geometry.type === 'LineString') {
                        const coordinates = geometryFunction(feature);
                        const geoJSONLayer = L.geoJSON({ ...feature, geometry: { type: 'LineString', coordinates }});
                        geoJSONLayer.setStyle(style);
                        layer._msAdditionalLayers.push(geoJSONLayer);
                        layer.addLayer(geoJSONLayer);
                        return {
                            stroke: false,
                            fill: false
                        };
                    }

                    return style;
                }
                if (firstValidSymbolizer.kind === 'Fill') {
                    const geometryFunction = getGeometryFunction(firstValidSymbolizer);
                    const style = {
                        fill: true,
                        stroke: true,
                        fillColor: firstValidSymbolizer.color,
                        fillOpacity: firstValidSymbolizer.fillOpacity * globalOpacity,
                        color: firstValidSymbolizer.outlineColor,
                        opacity: (firstValidSymbolizer.outlineOpacity ?? 0) * globalOpacity,
                        weight: firstValidSymbolizer.outlineWidth ?? 0,
                        ...(firstValidSymbolizer.outlineDasharray && { dashArray: firstValidSymbolizer.outlineDasharray.join(' ') })
                    };
                    if (geometryFunction && feature.geometry.type === 'Polygon') {
                        const coordinates = geometryFunction(feature);
                        const geoJSONLayer = L.geoJSON({ ...feature, geometry: { type: 'Polygon', coordinates }});
                        geoJSONLayer.setStyle(style);
                        layer._msAdditionalLayers.push(geoJSONLayer);
                        layer.addLayer(geoJSONLayer);
                        return {
                            stroke: false,
                            fill: false
                        };
                    }
                }
                return {
                    stroke: false,
                    fill: false
                };
            }
        };
    });
}

class LeafletStyleParser {

    readStyle() {
        return new Promise((resolve, reject) => {
            try {
                resolve(null);
            } catch (error) {
                reject(error);
            }
        });
    }

    writeStyle(geoStylerStyle) {
        return new Promise((resolve, reject) => {
            try {
                const styleFunc = getStyleFuncFromRules(geoStylerStyle);
                resolve(styleFunc);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default LeafletStyleParser;
