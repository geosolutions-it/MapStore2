/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import chroma from 'chroma-js';
import { castArray, isNumber } from 'lodash';
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

const getNumberAttributeValue = (value, properties) => {
    const constantHeight = parseFloat(value);

    if (!isNaN(constantHeight) && isNumber(constantHeight)) {
        return constantHeight;
    }

    const attributeValue = value?.type === "attribute" && parseFloat(properties[value.name]);

    if (!isNaN(attributeValue) && isNumber(attributeValue)) {
        return attributeValue;
    }
    return null;
};

function modifyPointHeight(map, entity, symbolizer, properties) {
    // store the initial position of the feature created from the GeoJSON feature
    if (!entity._msPosition) {
        entity._msPosition = entity.position.getValue(Cesium.JulianDate.now());
    }

    const height = getNumberAttributeValue(symbolizer.msHeight, properties);

    if (height === null) {
        entity.position.setValue(entity._msPosition);
        return;
    }
    const ellipsoid = map?.scene?.globe?.ellipsoid;
    if (!ellipsoid) {
        return;
    }

    const cartographic = ellipsoid.cartesianToCartographic(entity._msPosition);
    cartographic.height = height;
    entity.position.setValue(ellipsoid.cartographicToCartesian(cartographic));
    return;
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

const HEIGHT_REFERENCE_CONSTANTS_MAP = {
    none: 'NONE',
    relative: 'RELATIVE_TO_GROUND',
    clamp: 'CLAMP_TO_GROUND'
};

function getStyleFuncFromRules({
    rules = []
} = {}, {
    images = [],
    getImageIdFromSymbolizer,
    geoStylerStyleFilter = () => true
}) {
    return ({
        entities,
        map,
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
                                    disableDepthTestDistance: symbolizer.msBringToFront ? Number.POSITIVE_INFINITY : 0,
                                    heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[symbolizer.msHeightReference] || 'NONE'],
                                    color: getCesiumColor({
                                        color: '#ffffff',
                                        opacity: 1 * globalOpacity
                                    })
                                });
                                modifyPointHeight(map, entity, symbolizer, properties);
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
                                    disableDepthTestDistance: symbolizer.msBringToFront ? Number.POSITIVE_INFINITY : 0,
                                    heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[symbolizer.msHeightReference] || 'NONE'],
                                    color: getCesiumColor({
                                        color: '#ffffff',
                                        opacity: symbolizer.opacity * globalOpacity
                                    })
                                });
                                modifyPointHeight(map, entity, symbolizer, properties);
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
                                clampToGround: symbolizer.msClampToGround
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
                                classificationType: symbolizer.msClassificationType === 'terrain' ?
                                    Cesium.ClassificationType.TERRAIN :
                                    symbolizer.msClassificationType === '3d' ?
                                        Cesium.ClassificationType.CESIUM_3D_TILE :
                                        Cesium.ClassificationType.BOTH
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
                                    clampToGround: symbolizer.msClampToGround
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
                                heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[symbolizer.msHeightReference] || 'NONE'],
                                pixelOffset: new Cesium.Cartesian2(symbolizer?.offset?.[0] ?? 0, symbolizer?.offset?.[1] ?? 0),
                                // outline is not working
                                // rotation is not available as property
                                outlineColor: getCesiumColor({
                                    color: symbolizer.haloColor,
                                    opacity: 1 * globalOpacity
                                }),
                                outlineWidth: symbolizer.haloWidth
                            });
                            modifyPointHeight(map, entity, symbolizer, properties);
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
