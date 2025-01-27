/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// part of the code below is from https://github.com/geostyler/geostyler-openlayers-parser/tree/v4.1.2
// BSD 2-Clause License

// Copyright (c) 2018, terrestris GmbH & Co. KG
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:

// * Redistributions of source code must retain the above copyright notice, this
//   list of conditions and the following disclaimer.

// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import tinycolor from 'tinycolor2';
import axios from 'axios';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import MarkerUtils from '../MarkerUtils';
import {randomInt} from '../RandomUtils';
import { getConfigProp } from '../ConfigUtils';
import { loadFontAwesome } from '../FontUtils';

export const isGeoStylerBooleanFunction = (got) => [
    'between',
    'double2bool',
    'in',
    'parseBoolean',
    'strEndsWith',
    'strEqualsIgnoreCase',
    'strMatches',
    'strStartsWith'
].includes(got?.name);
export const isGeoStylerNumberFunction = (got) => [
    'abs',
    'acos',
    'asin',
    'atan',
    'atan2',
    'ceil',
    'cos',
    'exp',
    'floor',
    'log',
    'max',
    'min',
    'modulo',
    'pi',
    'pow',
    'random',
    'rint',
    'round',
    'sin',
    'sqrt',
    'strIndexOf',
    'strLastIndexOf',
    'strLength',
    'tan',
    'toDegrees',
    'toRadians'
].includes(got?.name);
export const isGeoStylerStringFunction = (got) => [
    'numberFormat',
    'strAbbreviate',
    'strCapitalize',
    'strConcat',
    'strDefaultIfBlank',
    'strReplace',
    'strStripAccents',
    'strSubstring',
    'strSubstringStart',
    'strToLowerCase',
    'strToUpperCase',
    'strTrim'
].includes(got?.name);
export const isGeoStylerUnknownFunction = (got) => [
    'property'
].includes(got?.name);
export const isGeoStylerMapStoreFunction = (got) => got?.type === 'attribute' || [
    'msMarkerIcon'
].includes(got?.name);
export const isGeoStylerFunction = (got) =>
    isGeoStylerBooleanFunction(got)
    || isGeoStylerNumberFunction(got)
    || isGeoStylerStringFunction(got)
    || isGeoStylerUnknownFunction(got)
    || isGeoStylerMapStoreFunction(got);
const getFeatureProperties = (feature) => {
    return (feature?.getProperties
        ? feature.getProperties()
        : feature?.properties) || {};
};
export const expressionsUtils = {
    evaluateFunction: (func, feature) => {
        const properties = getFeatureProperties(feature);
        if (func.name === 'property') {
            if (!feature) {
                throw new Error(`Could not evalute 'property' function. Feature ${feature} is not defined.`);
            }
            if (isGeoStylerStringFunction(func.args[0])) {
                return properties[expressionsUtils.evaluateStringFunction(func.args[0], feature)];
            }
            return properties[func.args[0]];
        }
        if (isGeoStylerStringFunction(func)) {
            return expressionsUtils.evaluateStringFunction(func, feature);
        }
        if (isGeoStylerNumberFunction(func)) {
            return expressionsUtils.evaluateNumberFunction(func, feature);
        }
        if (isGeoStylerBooleanFunction(func)) {
            return expressionsUtils.evaluateBooleanFunction(func, feature);
        }
        if (isGeoStylerUnknownFunction(func)) {
            return expressionsUtils.evaluateUnknownFunction(func, feature);
        }
        if (isGeoStylerMapStoreFunction(func)) {
            return expressionsUtils.evaluateMapStoreFunction(func, feature);
        }
        return null;
    },
    evaluateBooleanFunction: (func, feature) => {
        const args = func.args.map(arg => {
            if (isGeoStylerFunction(arg)) {
                return expressionsUtils.evaluateFunction(arg, feature);
            }
            return arg;
        });
        switch (func.name) {
        case 'between':
            return (args[0]) >= (args[1]) && (args[0]) <= (args[2]);
        case 'double2bool':
            // TODO: evaluate this correctly
            return false;
        case 'in':
            return args.slice(1).includes(args[0]);
        case 'parseBoolean':
            return !!args[0];
        case 'strEndsWith':
            return (args[0]).endsWith(args[1]);
        case 'strEqualsIgnoreCase':
            return (args[0]).toLowerCase() === (args[1]).toLowerCase();
        case 'strMatches':
            return new RegExp(args[1]).test(args[0]);
        case 'strStartsWith':
            return (args[0]).startsWith(args[1]);
        default:
            return false;
        }
    },
    evaluateNumberFunction: (func, feature) => {
        if (func.name === 'pi') {
            return Math.PI;
        }
        if (func.name === 'random') {
            return randomInt();
        }
        const args = func.args.map(arg => {
            if (isGeoStylerFunction(arg)) {
                return expressionsUtils.evaluateFunction(arg, feature);
            }
            return arg;
        });
        switch (func.name) {
        case 'abs':
            return Math.abs(args[0]);
        case 'acos':
            return Math.acos(args[0]);
        case 'asin':
            return Math.asin(args[0]);
        case 'atan':
            return Math.atan(args[0]);
        case 'atan2':
            // TODO: evaluate this correctly
            return args[0];
        case 'ceil':
            return Math.ceil(args[0]);
        case 'cos':
            return Math.cos(args[0]);
        case 'exp':
            return Math.exp(args[0]);
        case 'floor':
            return Math.floor(args[0]);
        case 'log':
            return Math.log(args[0]);
        case 'max':
            return Math.max(...(args));
        case 'min':
            return Math.min(...(args));
        case 'modulo':
            return (args[0]) % (args[1]);
        case 'pow':
            return Math.pow(args[0], args[1]);
        case 'rint':
            // TODO: evaluate this correctly
            return args[0];
        case 'round':
            return Math.round(args[0]);
        case 'sin':
            return Math.sin(args[0]);
        case 'sqrt':
            return Math.sqrt(args[0]);
        case 'strIndexOf':
            return (args[0]).indexOf(args[1]);
        case 'strLastIndexOf':
            return (args[0]).lastIndexOf(args[1]);
        case 'strLength':
            return (args[0]).length;
        case 'tan':
            return Math.tan(args[0]);
        case 'toDegrees':
            return (args[0]) * (180 / Math.PI);
        case 'toRadians':
            return (args[0]) * (Math.PI / 180);
        default:
            return args[0];
        }
    },
    evaluateUnknownFunction: (func, feature) => {
        const args = func.args.map(arg => {
            if (isGeoStylerFunction(arg)) {
                return expressionsUtils.evaluateFunction(arg, feature);
            }
            return arg;
        });
        const properties = getFeatureProperties(feature);
        switch (func.name) {
        case 'property':
            return properties[args[0]];
        default:
            return args[0];
        }
    },
    evaluateStringFunction: (func, feature) => {
        const args = func.args.map(arg => {
            if (isGeoStylerFunction(arg)) {
                return expressionsUtils.evaluateFunction(arg, feature);
            }
            return arg;
        });
        switch (func.name) {
        case 'numberFormat':
            // TODO: evaluate this correctly
            return args[0];
        case 'strAbbreviate':
            // TODO: evaluate this correctly
            return args[0];
        case 'strCapitalize':
            // https://stackoverflow.com/a/32589289/10342669
            let splitStr = (args[0]).toLowerCase().split(' ');
            for (let part of splitStr) {
                part = part.charAt(0).toUpperCase() + part.substring(1);
            }
            return splitStr.join(' ');
        case 'strConcat':
            return args.join();
        case 'strDefaultIfBlank':
            return (args[0])?.length < 1 ? args[1] : args[0];
        case 'strReplace':
            if (args[3] === true) {
                return (args[0]).replaceAll(args[1], args[2]);
            }
            return (args[0]).replace(args[1], args[2]);
        case 'strStripAccents':
            // https://stackoverflow.com/a/37511463/10342669
            return (args[0]).normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
        case 'strSubstring':
            return (args[0]).substring(args[1], args[2]);
        case 'strSubstringStart':
            return (args[0]).substring(args[1]);
        case 'strToLowerCase':
            return (args[0]).toLowerCase();
        case 'strToUpperCase':
            return (args[0]).toUpperCase();
        case 'strTrim':
            return (args[0]).trim();
        default:
            return args[0];
        }
    },
    evaluateMapStoreFunction: (func, feature) => {
        if (func.type === 'attribute') {
            return expressionsUtils.evaluateFunction({
                name: 'property',
                args: [func.name]
            }, feature);
        }
        const args = func.args.map(arg => {
            if (isGeoStylerFunction(arg)) {
                return expressionsUtils.evaluateFunction(arg, feature);
            }
            return arg;
        });
        switch (func.name) {
        case 'msMarkerIcon':
            return MarkerUtils.markers.extra.markerToDataUrl({
                iconColor: args[0].color,
                iconShape: args[0].shape,
                iconGlyph: args[0].glyph
            });
        default:
            return args[0];
        }
    }
};
/**
 * creates geometry function utils for Cesium library
 * @param {object} feature a GeoJSON feature
 * @param {array} filter array expresses the filter structure in geostyler format
 * @returns {boolean} true if the feature should be visualize based on the filter content
 */
export const geoStylerStyleFilter = (feature, filter) => {
    const properties = getFeatureProperties(feature);
    const operatorMapping = {
        '&&': true,
        '||': true,
        '!': true
    };
    let matchesFilter = true;
    const operator = filter[0];
    let isNestedFilter = false;
    if (operatorMapping[operator]) {
        isNestedFilter = true;
    }
    try {
        if (isNestedFilter) {
            let intermediate;
            let restFilter;
            switch (filter[0]) {
            case '&&':
                intermediate = true;
                restFilter = filter.slice(1);
                restFilter.forEach((f) => {
                    if (!geoStylerStyleFilter(feature, f)) {
                        intermediate = false;
                    }
                });
                matchesFilter = intermediate;
                break;
            case '||':
                intermediate = false;
                restFilter = filter.slice(1);
                restFilter.forEach((f) => {
                    if (geoStylerStyleFilter(feature, f)) {
                        intermediate = true;
                    }
                });
                matchesFilter = intermediate;
                break;
            case '!':
                matchesFilter = !this.geoStylerFilterToOlParserFilter(feature, filter[1]);
                break;
            default:
                throw new Error('Cannot parse Filter. Unknown combination or negation operator.');
            }
        } else {
            let arg1;
            if (isGeoStylerFunction(filter[1])) {
                arg1 = expressionsUtils.evaluateFunction(filter[1], feature);
            } else {
                arg1 = properties[filter[1]];
            }
            let arg2;
            if (isGeoStylerFunction(filter[2])) {
                arg2 = properties[expressionsUtils.evaluateFunction(filter[2], feature)];
            } else {
                arg2 = filter[2];
            }
            switch (filter[0]) {
            case '==':
                matchesFilter = ('' + arg1) === ('' + arg2);
                break;
            case '*=':
                // inspired by
                // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/String/includes#Polyfill
                if (typeof arg2 === 'string' && typeof arg1 === 'string') {
                    if (arg2.length > arg1.length) {
                        matchesFilter = false;
                    } else {
                        matchesFilter = arg1.indexOf(arg2) !== -1;
                    }
                }
                break;
            case '!=':
                matchesFilter = ('' + arg1) !== ('' + arg2);
                break;
            case '<':
                matchesFilter = Number(arg1) < Number(arg2);
                break;
            case '<=':
                matchesFilter = Number(arg1) <= Number(arg2);
                break;
            case '>':
                matchesFilter = Number(arg1) > Number(arg2);
                break;
            case '>=':
                matchesFilter = Number(arg1) >= Number(arg2);
                break;
            default:
                throw new Error('Cannot parse Filter. Unknown comparison operator.');
            }
        }
    } catch (e) {
        throw new Error('Cannot parse Filter. Invalid structure.');
    }
    return matchesFilter;
};
/**
 * parse a string template and replace the placeholders with feature properties
 * @param {object} feature a GeoJSON feature
 * @param {string} template a string with properties placeholder, eg '{{label}} some plain text'
 * @param {string} noValueFoundText a fallback string for placeholder
 * @returns {string} true if the feature should be visualize based on the filter content
 */
export const resolveAttributeTemplate = (
    feature,
    template,
    noValueFoundText = 'n.v.',
    valueAdjust = (key, val) => val
) => {

    const properties = getFeatureProperties(feature);

    let _template = template || '';
    let attributeTemplatePrefix = '\\{\\{';
    let attributeTemplateSuffix = '\\}\\}';

    // Find any character between two braces (including the braces in the result)
    let regExp = new RegExp(attributeTemplatePrefix + '(.*?)' + attributeTemplateSuffix, 'g');
    let regExpRes = _template.match(regExp);

    // If we have a regex result, it means we found a placeholder in the
    // template and have to replace the placeholder with its appropriate value.
    if (regExpRes) {
        // Iterate over all regex match results and find the proper attribute
        // for the given placeholder, finally set the desired value to the hover.
        // field text
        regExpRes.forEach(res => {
            // We count every non matching candidate. If this count is equal to
            // the objects length, we assume that there is no match at all and
            // set the output value to the value of "noValueFoundText".
            let noMatchCnt = 0;

            for (let [key, value] of Object.entries(properties)) {
                // Remove the suffixes and find the matching attribute column.
                let attributeName = res.slice(2, res.length - 2);

                if (attributeName.toLowerCase() === key.toLowerCase()) {
                    _template = _template.replace(res, valueAdjust(key, value));
                    break;
                } else {
                    noMatchCnt++;
                }
            }

            // No key match found for this feature (e.g. if key not
            // present or value is null).
            if (noMatchCnt === Object.keys(properties).length) {
                _template = _template.replace(res, noValueFoundText);
            }
        });
    }

    return _template;
};

let imagesCache = {};

/**
 * generate an id based on a Mark symbolizer
 * @param {object} symbolizer mark symbolizer
 * @returns {string} an id for the mark symbolizer
 */
export const _getImageIdFromSymbolizer = ({
    image,
    color,
    fillOpacity,
    strokeColor,
    strokeOpacity,
    strokeWidth,
    strokeDasharray,
    radius,
    wellKnownName
}) => {
    if (image) {
        return image?.name === 'msMarkerIcon' ? `msMarkerIcon:${image?.args?.[0]?.color}:${image?.args?.[0]?.shape}:${image?.args?.[0]?.glyph}` : image;
    }
    return [wellKnownName, color, fillOpacity, strokeColor, strokeOpacity, (strokeDasharray || []).join('_'), strokeWidth, radius].join(':');
};
/**
 * generate an id based on a Mark symbolizer
 * @param {object} parsedSymbolizer the parsed mark symbolizer
 * @param {object} originalSymbolizer the original mark symbolizer
 * @returns {string} an id for the mark symbolizer
 */
export const getImageIdFromSymbolizer = (parsedSymbolizer, originalSymbolizer) => {
    return _getImageIdFromSymbolizer(originalSymbolizer?.image?.name === 'msMarkerIcon' ? originalSymbolizer : parsedSymbolizer);
};

/**
 * prefetch images of a icon symbolizer
 * @param {object} symbolizer icon symbolizer
 * @returns {promise} returns the image
 */
const getImageFromSymbolizer = (symbolizer) => {
    const image = symbolizer.image;
    const id = getImageIdFromSymbolizer(symbolizer);
    if (imagesCache[id]) {
        return Promise.resolve(imagesCache[id]);
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        let src = image;
        if (isObject(src) && src.name === 'msMarkerIcon') {
            try {
                const msMarkerIcon = src.args[0];
                src = MarkerUtils.markers.extra.markerToDataUrl({
                    iconColor: msMarkerIcon.color,
                    iconShape: msMarkerIcon.shape,
                    iconGlyph: msMarkerIcon.glyph
                });
            } catch (e) {
                reject(id);
            }
        }
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imagesCache[id] = { id, image: img, src, width: img.naturalWidth, height: img.naturalHeight };
            resolve(imagesCache[id]);
        };
        img.onerror = () => {
            reject(id);
        };
        img.src = src;
    });
};

// http://jsfiddle.net/m1erickson/8j6kdf4o/
const paintStar = (ctx, cx, cy, spikes = 5, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
};

const paintCross = (ctx, cx, cy, r, p) => {
    const w = r * p;
    const wm = w / 2;
    const rm = r / 2;
    ctx.moveTo(cx - wm, cy - rm);
    ctx.lineTo(cx + wm, cy - rm);
    ctx.lineTo(cx + wm, cy - wm);
    ctx.lineTo(cx + rm, cy - wm);
    ctx.lineTo(cx + rm, cy + wm);
    ctx.lineTo(cx + wm, cy + wm);
    ctx.lineTo(cx + wm, cy + rm);
    ctx.lineTo(cx - wm, cy + rm);
    ctx.lineTo(cx - wm, cy + wm);
    ctx.lineTo(cx - rm, cy + wm);
    ctx.lineTo(cx - rm, cy - wm);
    ctx.lineTo(cx - wm, cy - wm);
    ctx.closePath();
};

/**
 * draw on a canvas the mark symbol
 * @param {object} symbolizer mark symbolizer
 * @returns {object} { width, height, canvas }
 */
export const drawWellKnownNameImageFromSymbolizer = (symbolizer) => {
    const id = getImageIdFromSymbolizer(symbolizer);
    if (imagesCache[id]) {
        const { image, ...other } = imagesCache[id];
        return { ...other, canvas: image };
    }
    const hasStroke = !!symbolizer?.strokeWidth
        && !!symbolizer?.strokeOpacity;
    const hasFill = !!symbolizer?.fillOpacity
        && !(symbolizer.wellKnownName || '').includes('shape://');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const radius = symbolizer.radius;
    const strokePadding = hasStroke ? symbolizer.strokeWidth / 2 : 4;
    const x = strokePadding;
    const y = strokePadding;
    const cx = radius + strokePadding;
    const cy = radius + strokePadding;
    const width = symbolizer.radius * 2;
    const height = symbolizer.radius * 2;
    canvas.setAttribute('width', width + strokePadding * 2);
    canvas.setAttribute('height', height + strokePadding * 2);

    if (hasFill) {
        const fill = tinycolor(symbolizer.color);
        fill.setAlpha(symbolizer.fillOpacity);
        ctx.fillStyle = fill.toRgbString();
    }
    if (hasStroke) {
        const stroke = tinycolor(symbolizer.strokeColor);
        stroke.setAlpha(symbolizer.strokeOpacity);
        ctx.strokeStyle = stroke.toRgbString();
        ctx.lineWidth = symbolizer.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        if (symbolizer.strokeDasharray) {
            ctx.setLineDash(symbolizer.strokeDasharray);
        }
    }

    switch (symbolizer.wellKnownName) {
    case 'Circle': {
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        break;
    }
    case 'Square': {
        ctx.rect(x, y, width, height);
        break;
    }
    case 'Triangle': {
        const h = Math.sqrt(3) * radius;
        const bc = h / 3;
        const marginY = (height - h) / 2;
        ctx.moveTo(cx, cy + marginY - 2 * bc);
        ctx.lineTo(cx + radius, cy + marginY + bc);
        ctx.lineTo(cx - radius, cy + marginY + bc);
        ctx.closePath();
        break;
    }
    case 'Star': {
        paintStar(ctx, cx, cy, 5, radius, radius / 2);
        break;
    }
    case 'Cross': {
        paintCross(ctx, cx, cy, radius * 2, 0.2);
        break;
    }
    case 'X': {
        ctx.translate(cx, cy);
        ctx.rotate(45 * Math.PI / 180);
        ctx.translate(-cx, -cy);
        paintCross(ctx, cx, cy, radius * 2, 0.2);
        break;
    }
    case 'shape://vertline': {
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, height);
        ctx.closePath();
        break;
    }
    case 'shape://horline': {
        ctx.moveTo(x, cy);
        ctx.lineTo(width, cy);
        ctx.closePath();
        break;
    }
    case 'shape://slash': {
        ctx.translate(cx, cy);
        ctx.rotate(45 * Math.PI / 180);
        ctx.translate(-cx, -cy);
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, height);
        ctx.closePath();
        break;
    }
    case 'shape://backslash': {
        ctx.translate(cx, cy);
        ctx.rotate(-45 * Math.PI / 180);
        ctx.translate(-cx, -cy);
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, height);
        break;
    }
    case 'shape://dot': {
        ctx.moveTo(cx - 1, cy - 1);
        ctx.lineTo(cx + 1, cy + 1);
        ctx.closePath();
        break;
    }
    case 'shape://plus': {
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, height);
        ctx.moveTo(x, cy);
        ctx.lineTo(width, cy);
        ctx.closePath();
        break;
    }
    case 'shape://times': {
        ctx.translate(cx, cy);
        ctx.rotate(45 * Math.PI / 180);
        ctx.translate(-cx, -cy);
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, height);
        ctx.moveTo(x, cy);
        ctx.lineTo(width, cy);
        ctx.closePath();
        break;
    }
    case 'shape://oarrow': {
        ctx.moveTo(x, y);
        ctx.lineTo(width, cy);
        ctx.lineTo(x, height);
        break;
    }
    case 'shape://carrow': {
        ctx.moveTo(x, y);
        ctx.lineTo(width, cy);
        ctx.lineTo(x, height);
        ctx.closePath();
        break;
    }
    default:
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    }
    if (hasFill) {
        ctx.fill();
    }
    if (hasStroke) {
        ctx.stroke();
    }
    return { width, height, canvas};
};

const svgUrlToCanvas = (svgUrl, options) => {
    return new Promise((resolve, reject) => {
        axios.get(svgUrl, { 'Content-Type': "image/svg+xml;charset=utf-8" })
            .then((response) => {
                const DOMURL = window.URL || window.webkitURL || window;
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.data, 'image/svg+xml'); // create a dom element
                const svg = doc.firstElementChild; // fetch svg element

                const size = options.size || 32;
                const strokeWidth = options.strokeWidth ?? 1;
                const width = size + strokeWidth;
                const height = size + strokeWidth;
                // override attributes to the first svg tag
                svg.setAttribute("fill", options.fillColor || "#FFCC33");
                svg.setAttribute("fill-opacity", !isNil(options.fillOpacity) ? options.fillOpacity : 0.2);
                svg.setAttribute("stroke", options.strokeColor || "#FFCC33");
                svg.setAttribute("stroke-opacity", !isNil(options.strokeOpacity) ? options.strokeOpacity : 1);
                svg.setAttribute("stroke-width", strokeWidth);
                svg.setAttribute("width", width);
                svg.setAttribute("height", height);
                svg.setAttribute("stroke-dasharray", options.strokeDasharray || "none");

                const element = document.createElement("div");
                element.appendChild(svg);

                const svgBlob = new Blob([element.innerHTML], { type: "image/svg+xml;charset=utf-8" });
                const symbolUrlCustomized = DOMURL.createObjectURL(svgBlob);
                const icon = new Image();
                icon.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(icon, (canvas.width / 2) - (icon.width / 2), (canvas.height / 2) - (icon.height / 2));
                        resolve({
                            width,
                            height,
                            canvas
                        });
                    } catch (e) {
                        reject(e);
                    }
                };
                icon.onerror = (e) => { reject(e); };
                icon.src = symbolUrlCustomized;
            })
            .catch((e) => {
                reject(e);
            });
    });
};

/**
 * prefetch images of a mark symbolizer
 * @param {object} symbolizer mark symbolizer
 * @returns {promise} returns the canvas with additional information
 */
export const getWellKnownNameImageFromSymbolizer = (symbolizer) => {
    const id = getImageIdFromSymbolizer(symbolizer);
    if (imagesCache[id]) {
        return Promise.resolve(imagesCache[id]);
    }
    return new Promise((resolve, reject) => {
        if (!document?.createElement) {
            reject(id);
        }
        if (symbolizer?.wellKnownName?.includes('.svg')) {
            svgUrlToCanvas(symbolizer.wellKnownName, {
                fillColor: symbolizer.color,
                fillOpacity: symbolizer.fillOpacity,
                strokeColor: symbolizer.strokeColor,
                strokeOpacity: symbolizer.strokeOpacity,
                strokeWidth: symbolizer.strokeWidth,
                strokeDasharray: symbolizer.strokeDasharray,
                size: symbolizer.radius * 2
            })
                .then(({ width, height, canvas }) => {
                    imagesCache[id] = { id, image: canvas, src: canvas.toDataURL(), width, height };
                    resolve(imagesCache[id]);
                })
                .catch(() => {
                    reject(id);
                });
        } else {
            const { width, height, canvas} = drawWellKnownNameImageFromSymbolizer(symbolizer);
            imagesCache[id] = { id, image: canvas, src: canvas.toDataURL(), width, height };
            resolve(imagesCache[id]);
        }
    });
};

export const parseSymbolizerExpressions = (symbolizer, feature) => {
    if (!symbolizer) {
        return {};
    }
    return Object.keys(symbolizer).reduce((acc, key) => ({
        ...acc,
        [key]: isGeoStylerFunction(symbolizer[key])
            ? expressionsUtils.evaluateFunction(symbolizer[key], feature)
            : symbolizer[key]
    }), {});
};

/**
 * prefetch all image or mark symbol in a geostyler style
 * @param {object} geoStylerStyle geostyler style
 * @returns {promise} all the prefetched images
 */
export const drawIcons = (geoStylerStyle, options) => {
    const { rules = [] } = geoStylerStyle || {};
    const symbolizers = rules.reduce((acc, rule) => {
        const markIconSymbolizers = (rule?.symbolizers || []).filter(({ kind }) => ['Mark', 'Icon'].includes(kind));
        const symbolizerHasExpression = markIconSymbolizers
            .some(properties => Object.keys(properties).some(key => !!properties[key]?.name));
        if (!symbolizerHasExpression) {
            return [
                ...acc,
                ...markIconSymbolizers
            ];
        }
        const features = options.features || [];
        const supportedFeatures = rule.filter === undefined
            ? features
            : features.filter((feature) => geoStylerStyleFilter(feature, rule.filter));
        return [
            ...acc,
            ...markIconSymbolizers.reduce((newSymbolizers, symbolizer) => {
                return [
                    ...newSymbolizers,
                    ...(supportedFeatures || []).map((feature) => {
                        const newSymbolizer = parseSymbolizerExpressions(symbolizer, feature);
                        return {
                            ...newSymbolizer,
                            // exclude msMarkerIcon from parsing
                            // the getImageFromSymbolizer is already taking into account this case
                            ...(symbolizer?.image?.name === 'msMarkerIcon' && { image: symbolizer.image })
                        };
                    })
                ];
            }, [])
        ];
    }, []);
    const marks = symbolizers.filter(({ kind }) => kind === 'Mark');
    const icons = symbolizers.filter(({ kind }) => kind === 'Icon');
    const loadFontAwesomeForIcons = getConfigProp("loadFontAwesomeForIcons");
    // if undefined or true it will load it to preserve previous behaviour
    const loadingPromise =  (isNil(loadFontAwesomeForIcons) || loadFontAwesomeForIcons) && icons?.length ? loadFontAwesome() : Promise.resolve();
    return loadingPromise
        .then(
            () => new Promise((resolve) => {
                if (marks.length > 0 || icons.length > 0) {
                    Promise.all([
                        ...marks.map(getWellKnownNameImageFromSymbolizer),
                        ...icons.map(getImageFromSymbolizer)
                    ]).then((images) => {
                        resolve(images);
                    });
                } else {
                    resolve([]);
                }
            })
        );
};
export const getCachedImageById = (symbolizer) => {
    const id = getImageIdFromSymbolizer(symbolizer);
    return imagesCache[id] || {};
};
