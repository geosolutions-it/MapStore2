/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import L from 'leaflet';
import { castArray } from 'lodash';

const geometryTypeToKind = {
    'Point': ['Mark', 'Icon', 'Text'],
    'MultiPoint': ['Mark', 'Icon', 'Text'],
    'LineString': ['Line'],
    'MultiLineString': ['Line'],
    'Polygon': ['Fill'],
    'MultiPolygon': ['Fill']
};

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

function getStyleFuncFromRules({ rules: geoStylerStyleRules = [] }, {
    geoStylerStyleFilter,
    images,
    getImageIdFromSymbolizer
}) {

    // the last rules of the array should the one we'll apply
    // in case we have multiple symbolizers on the same features
    // we ensure to find the last symbolizer matching the filter and geometry type
    // by reversing all the rules
    const rules = [...geoStylerStyleRules].reverse();
    return ({
        opacity: globalOpacity = 1
    } = {}) => {
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
                        rule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind))
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
                const firstValidRule = rules
                    .find(rule =>
                        // the symbolizer should be included in the supported ones
                        rule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind))
                        // the filter should match the expression or be undefined
                        && (!rule.filter || geoStylerStyleFilter(feature, rule.filter))
                    ) || {};
                const firstValidSymbolizer = firstValidRule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind)) || {};
                if (firstValidSymbolizer.kind === 'Mark') {
                    const { image, src, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(firstValidSymbolizer)) || {};
                    if (image) {
                        const aspect = width / height;
                        const size = firstValidSymbolizer.radius * 2;
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
                if (firstValidSymbolizer.kind === 'Icon') {
                    const { image, src, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(firstValidSymbolizer)) || {};
                    if (image) {
                        const aspect = width / height;
                        let iconSizeW = firstValidSymbolizer.size;
                        let iconSizeH = iconSizeW / aspect;
                        if (height > width) {
                            iconSizeH = firstValidSymbolizer.size;
                            iconSizeW = iconSizeH * aspect;
                        }
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: src,
                                iconSize: [iconSizeW, iconSizeH],
                                iconAnchor: [iconSizeW / 2, iconSizeH / 2]
                            }),
                            opacity: firstValidSymbolizer.opacity * globalOpacity
                        });
                    }
                }
                if (firstValidSymbolizer.kind === 'Text') {
                    const label = parseLabel(feature, firstValidSymbolizer.label);
                    const haloProperties = `
                        -webkit-text-stroke-width:${firstValidSymbolizer.haloWidth}px;
                        -webkit-text-stroke-color:${firstValidSymbolizer.haloColor || ''};
                    `;
                    const textIcon = L.divIcon({
                        html: `<div style="
                            color:${firstValidSymbolizer.color};
                            font-family: ${castArray(firstValidSymbolizer.font || []).join(', ')};
                            font-style: ${firstValidSymbolizer.fontStyle || 'normal'};
                            font-weight: ${firstValidSymbolizer.fontWeight || 'normal'};
                            font-size: ${firstValidSymbolizer.size}px;

                            position: absolute;
                            transform: translate(${firstValidSymbolizer?.offset?.[0] ?? 0}px, ${firstValidSymbolizer?.offset?.[1] ?? 0}px) rotateZ(${firstValidSymbolizer?.rotate ?? 0}deg);

                            ${firstValidSymbolizer.haloWidth > 0 ? haloProperties : ''}
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
                return null;
            },
            style: (feature) => {
                const geometryType = feature?.geometry?.type;
                const supportedKinds = geometryTypeToKind[geometryType] || [];
                const firstValidRule = rules
                    .find(rule =>
                        // the symbolizer should be included in the supported ones
                        rule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind))
                        // the filter should match the expression or be undefined
                        && (!rule.filter || geoStylerStyleFilter(feature, rule.filter))
                    ) || {};
                const firstValidSymbolizer = firstValidRule?.symbolizers?.find(symbolizer => supportedKinds.includes(symbolizer.kind)) || {};
                if (firstValidSymbolizer.kind === 'Line') {
                    return {
                        stroke: true,
                        fill: false,
                        color: firstValidSymbolizer.color,
                        opacity: firstValidSymbolizer.opacity * globalOpacity,
                        weight: firstValidSymbolizer.width,
                        ...(firstValidSymbolizer.dasharray && { dashArray: firstValidSymbolizer.dasharray.join(' ') }),
                        ...(firstValidSymbolizer.cap && { lineCap: firstValidSymbolizer.cap }),
                        ...(firstValidSymbolizer.join && { lineJoin: firstValidSymbolizer.join })
                    };
                }
                if (firstValidSymbolizer.kind === 'Fill') {
                    return {
                        fill: true,
                        stroke: true,
                        fillColor: firstValidSymbolizer.color,
                        fillOpacity: firstValidSymbolizer.fillOpacity * globalOpacity,
                        color: firstValidSymbolizer.outlineColor,
                        opacity: (firstValidSymbolizer.outlineOpacity ?? 0) * globalOpacity,
                        weight: firstValidSymbolizer.outlineWidth ?? 0
                    };
                }
                return {
                    stroke: false,
                    fill: false
                };
            }
        };
    };
}

class LeafletStyleParser {

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

export default LeafletStyleParser;
