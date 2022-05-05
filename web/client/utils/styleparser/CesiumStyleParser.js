/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import chroma from 'chroma-js';
import { castArray } from 'lodash';
import range from 'lodash/range';

function getCesiumColor({ color, opacity }) {
    const [r, g, b, a] = chroma(color).gl();
    if (opacity !== undefined) {
        return new Cesium.Color(r, g, b, opacity);
    }
    return new Cesium.Color(r, g, b, a);
}

function getPositionByGraphicKey(graphicKey, entity) {
    switch (graphicKey) {
    case 'polyline':
        return entity[graphicKey]?.positions;
    case 'polygon':
        return entity[graphicKey]?.hierarchy;
    default:
        return null;
    }
}

function getCesiumDashArray({ color, opacity, dasharray }) {
    if (dasharray?.length <= 0) {
        return getCesiumColor({ color, opacity });
    }
    const dashLength = dasharray.reduce((acc, value) => acc + value, 0);
    return new Cesium.PolylineDashMaterialProperty({
        color: getCesiumColor({ color, opacity }),
        dashLength,
        dashPattern: parseInt((dasharray
            .map((value) => Math.floor(value / dashLength * 16))
            .map((value, idx) => range(value).map(() => idx % 2 === 0 ? '1' : '0').join(''))
            .join('')), 2)
    });
}

function parseLabel(feature, label = '') {
    if (!feature.properties) {
        return label;
    }
    return Object.keys(feature.properties)
        .reduce((str, key) => {
            const regExp = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            return str.replace(regExp, feature.properties[key] ?? '');
        }, label);
}

const GRAPHIC_KEYS = [
    'billboard',
    'box',
    'corridor',
    'cylinder',
    'ellipse',
    'ellipsoid',
    'label',
    'model',
    'tileset',
    'path',
    'plane',
    'point',
    'polygon',
    'polyline',
    'polylineVolume',
    'rectangle',
    'wall'
];

function getStyleFuncFromRules({
    rules = []
} = {}, {
    images = [],
    getImageIdFromSymbolizer,
    geoStylerStyleFilter = () => true
}) {
    return ({
        entities,
        opacity: globalOpacity = 1
    }) => {

        entities.forEach((entity) => {
            let coordinates = {};
            GRAPHIC_KEYS.forEach((graphicKey) => {
                if (!entity._msStoredCoordinates) {
                    coordinates[graphicKey] = getPositionByGraphicKey(graphicKey, entity) || undefined;
                }
                entity[graphicKey] = undefined;
            });
            if (!entity._msStoredCoordinates) {
                entity._msStoredCoordinates = coordinates;
            }
        });

        // TODO: optimize the rule loop
        // we could loop on entities instead o the rules
        // but this needs a logic to get the last rule that match the filter
        rules.forEach((rule) => {
            rule.symbolizers.forEach(symbolizer => {
                entities.forEach((entity) => {
                    const properties = entity?.properties?.getValue(Cesium.JulianDate.now()) || {};
                    if (!rule.filter || geoStylerStyleFilter({ properties: properties || {}}, rule.filter)) {

                        if (symbolizer.kind === 'Mark' && entity.position) {
                            const { image, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(symbolizer)) || {};
                            if (image) {
                                const side = width > height ? width : height;
                                const scale = (symbolizer.radius * 2) / side;
                                entity.billboard = new Cesium.BillboardGraphics({
                                    image,
                                    scale,
                                    rotation: Cesium.Math.toRadians(-1 * symbolizer.rotate || 0),
                                    color: getCesiumColor({
                                        color: '#ffffff',
                                        opacity: 1 * globalOpacity
                                    })
                                });
                            }
                        }
                        if (symbolizer.kind === 'Icon' && entity.position) {
                            const { image, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(symbolizer)) || {};
                            if (image) {
                                const side = width > height ? width : height;
                                const scale = symbolizer.size / side;
                                entity.billboard = new Cesium.BillboardGraphics({
                                    image,
                                    scale,
                                    rotation: Cesium.Math.toRadians(-1 * symbolizer.rotate || 0),
                                    color: getCesiumColor({
                                        color: '#ffffff',
                                        opacity: symbolizer.opacity * globalOpacity
                                    })
                                });
                            }
                        }
                        if (symbolizer.kind === 'Line' && entity._msStoredCoordinates.polyline) {
                            entity.polyline = new Cesium.PolylineGraphics({
                                material: symbolizer?.dasharray
                                    ? getCesiumDashArray({
                                        color: symbolizer.color,
                                        opacity: symbolizer.opacity * globalOpacity,
                                        dasharray: symbolizer.dasharray
                                    })
                                    : getCesiumColor({
                                        color: symbolizer.color,
                                        opacity: symbolizer.opacity * globalOpacity
                                    }),
                                width: symbolizer.width,
                                positions: entity._msStoredCoordinates.polyline,
                                // by default the line will try to follow the terrain/3d tiles profile
                                clampToGround: true
                            });
                        }
                        if (symbolizer.kind === 'Fill' && entity._msStoredCoordinates.polygon) {
                            entity.polygon = new Cesium.PolygonGraphics({
                                material: getCesiumColor({
                                    color: symbolizer.color,
                                    opacity: symbolizer.fillOpacity * globalOpacity
                                }),
                                hierarchy: entity._msStoredCoordinates.polygon,
                                // height should be introduced with concept of extrusion
                                // height: 0,
                                classificationType: Cesium.ClassificationType.BOTH
                            });

                            // outline properties is not working in some browser see https://github.com/CesiumGS/cesium/issues/40
                            // this is a workaround to visualize the outline with the correct side
                            // this only for the footprint
                            if (symbolizer.outlineColor && symbolizer.outlineWidth !== 0) {
                                entity.polyline = new Cesium.PolylineGraphics({
                                    material: getCesiumColor({
                                        color: symbolizer.outlineColor,
                                        opacity: symbolizer.outlineOpacity * globalOpacity
                                    }),
                                    width: symbolizer.outlineWidth,
                                    positions: entity._msStoredCoordinates.polygon.getValue().positions,
                                    // by default the line will try to follow the terrain/3d tiles profile
                                    clampToGround: true
                                });
                            }
                        }
                        if (symbolizer.kind === 'Text' && entity.position) {
                            entity.label = new Cesium.LabelGraphics({
                                text: parseLabel({ properties }, symbolizer.label),
                                font: [symbolizer.fontStyle, symbolizer.fontWeight,  `${symbolizer.size}px`, castArray(symbolizer.font || ['serif']).join(', ')]
                                    .filter(val => val)
                                    .join(' '),
                                fillColor: getCesiumColor({
                                    color: symbolizer.color,
                                    opacity: 1 * globalOpacity
                                }),
                                pixelOffset: new Cesium.Cartesian2(symbolizer?.offset?.[0] ?? 0, symbolizer?.offset?.[1] ?? 0),
                                // outline is not working
                                // rotation is not available as property
                                outlineColor: getCesiumColor({
                                    color: symbolizer.haloColor,
                                    opacity: 1 * globalOpacity
                                }),
                                outlineWidth: symbolizer.haloWidth
                            });
                        }
                    }
                });
            });
        });
    };
}

class CesiumStyleParser {

    constructor({ drawIcons, getImageIdFromSymbolizer, geoStylerStyleFilter } = {}) {
        this._drawIcons = drawIcons ? drawIcons : () => Promise.resolve(null);
        this._getImageIdFromSymbolizer = getImageIdFromSymbolizer
            ? getImageIdFromSymbolizer
            : (symbolizer) => symbolizer.symbolizerId;
        this._geoStylerStyleFilter = geoStylerStyleFilter ? geoStylerStyleFilter : () => true;
    }

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
                this._drawIcons(geoStylerStyle)
                    .then((images = []) => {
                        const styleFunc = getStyleFuncFromRules(geoStylerStyle, {
                            images,
                            getImageIdFromSymbolizer: this._getImageIdFromSymbolizer,
                            geoStylerStyleFilter: this._geoStylerStyleFilter
                        });
                        resolve(styleFunc);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default CesiumStyleParser;
