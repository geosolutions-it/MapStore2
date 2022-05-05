/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNil, flatten, isEmpty, castArray, max, isArray } from 'lodash';

import { set } from './ImmutableUtils';
import { colorToRgbaStr } from './ColorUtils';
import axios from 'axios';
import tinycolor from 'tinycolor2';
import MarkerUtils from './MarkerUtils';

let imagesCache = {};

export function getImageIdFromSymbolizer({
    image,
    color,
    fillOpacity,
    strokeColor,
    strokeOpacity,
    strokeWidth,
    radius,
    wellKnownName
}) {
    if (image) {
        return image;
    }
    return [wellKnownName, color, fillOpacity, strokeColor, strokeOpacity, strokeWidth, radius].join(':');
}

export const flattenFeatures = (features, mapFunc = feature => feature) => {
    // check if features is a collection object or an array of features/feature collection
    const parsedFeatures = isArray(features) ? features : features?.features;
    return flatten( (parsedFeatures || []).map((feature) => {
        if (feature.type === 'FeatureCollection') {
            return feature.features || [];
        }
        return [feature];
    })).map(mapFunc);
};

function getImageFromSymbolizer(symbolizer) {
    const src = symbolizer.image;
    const id = getImageIdFromSymbolizer(symbolizer);
    if (imagesCache[id]) {
        return Promise.resolve(imagesCache[id]);
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
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
}

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

function getWellKnownNameImageFromSymbolizer(symbolizer) {
    const id = getImageIdFromSymbolizer(symbolizer);
    if (imagesCache[id]) {
        return Promise.resolve(imagesCache[id]);
    }
    return new Promise((resolve, reject) => {
        if (!document?.createElement) {
            reject(id);
        }
        const hasStroke = !!symbolizer?.strokeWidth
            && !!symbolizer?.strokeOpacity;
        const hasFill = !!symbolizer?.fillOpacity
            && !symbolizer.wellKnownName.includes('shape://');
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
        imagesCache[id] = { id, image: canvas, src: canvas.toDataURL(), width, height };
        resolve(imagesCache[id]);
    });
}

export function drawIcons(geoStylerStyle) {
    const { rules = [] } = geoStylerStyle || {};
    const symbolizers = flatten(rules.map(rule => rule.symbolizers));
    const marks = symbolizers.filter(({ kind }) => kind === 'Mark');
    const icons = symbolizers.filter(({ kind }) => kind === 'Icon');
    return new Promise((resolve) => {
        if (marks.length > 0 || icons.length > 0) {
            Promise.all([
                ...marks.map(getWellKnownNameImageFromSymbolizer),
                ...icons.map(getImageFromSymbolizer)
            ]).then((images) => {
                resolve(images);
            });
        } else {
            resolve(null);
        }
    });
}

// function extracted from the geostyler-openlayers-parser library
// https://github.com/geostyler/geostyler-openlayers-parser/blob/v3.0.2/src/OlStyleParser.ts#L694-L776
export const geoStylerStyleFilter = (feature, filter) => {
    const operatorMapping = {
        '&&': true,
        '||': true,
        '!': true
    };

    const operator = filter[0];
    let matchesFilter = true;
    let isNestedFilter = false;
    let intermediate;
    let restFilter;
    if (operatorMapping[operator]) {
        isNestedFilter = true;
    }
    try {
        if (isNestedFilter) {
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
                matchesFilter = !geoStylerStyleFilter(feature, filter[1]);
                break;
            default:
                throw new Error('Cannot parse Filter. Unknown combination or negation operator.');
            }
        } else {
            const prop = feature?.properties?.[filter[1]];
            switch (filter[0]) {
            case '==':
                matchesFilter = ('' + prop) === ('' + filter[2]);
                break;
            case '*=':
                // inspired by
                // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/String/includes#Polyfill
                if (typeof filter[2] === 'string' && typeof prop === 'string') {
                    if (filter[2].length > prop.length) {
                        matchesFilter = false;
                    } else {
                        matchesFilter = prop.indexOf(filter[2]) !== -1;
                    }
                }
                break;
            case '!=':
                matchesFilter = ('' + prop) !== ('' + filter[2]);
                break;
            case '<':
                matchesFilter = parseFloat(prop) < Number(filter[2]);
                break;
            case '<=':
                matchesFilter = parseFloat(prop) <= Number(filter[2]);
                break;
            case '>':
                matchesFilter = parseFloat(prop) > Number(filter[2]);
                break;
            case '>=':
                matchesFilter = parseFloat(prop) >= Number(filter[2]);
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

function initParserLib(mod, options = {}) {
    const Parser = mod.default;
    return new Parser(options);
}

const StyleParsers = {
    'sld': () => import('@geosolutions/geostyler-sld-parser').then(initParserLib),
    'css': () => import('@geosolutions/geostyler-geocss-parser').then(initParserLib),
    'openlayers': () =>  import('./styleparser/OLStyleParser').then((mod) => initParserLib(mod, { drawIcons, getImageIdFromSymbolizer, geoStylerStyleFilter })),
    '3dtiles': () => import('./styleparser/ThreeDTilesStyleParser').then(initParserLib),
    'cesium': () => import('./styleparser/CesiumStyleParser').then((mod) => initParserLib(mod, { drawIcons, getImageIdFromSymbolizer, geoStylerStyleFilter })),
    'leaflet': () => import('./styleparser/LeafletStyleParser').then((mod) => initParserLib(mod, { drawIcons, getImageIdFromSymbolizer, geoStylerStyleFilter })),
    'geostyler': () => import('./styleparser/GeoStylerStyleParser').then(initParserLib)
};

/**
 * checks if there is at least one attrbute in the object
 * @param {object} style the object to use for filtering the list of attributes
 * @param {string[]} attributes to use as filter list
 * @return {boolean} the result of the check
*/
export const isAttrPresent = (style = {}, attributes) => (attributes.filter(prop => !isNil(style[prop])).length > 0);

/**
 * check if the style is assignable to an ol.Stroke style
 * @param {object} style to check
 * @param {string[]} attibutes of a stroke style
 * @return {boolean} if the style is compatible with an ol.Stroke
*/
export const isStrokeStyle = (style = {}, attributes = ["color", "opacity", "dashArray", "dashOffset", "lineCap", "lineJoin", "weight"]) => {
    return isAttrPresent(style, attributes);
};

/**
 * check if the style is assignable to an ol.Fill style
 * @param {object} style to check
 * @param {string[]} attibutes of a fill style
 * @return {boolean} if the style is compatible with an ol.Fill style
*/
export const isFillStyle = (style = {}, attributes = ["fillColor", "fillOpacity"]) => {
    return isAttrPresent(style, attributes);
};

/**
 * check if the style is assignable to an ol.Text style
 * @param {object} style to check
 * @param {string[]} attibutes of a text style
 * @return {boolean} if the style is compatible with an ol.Text style
*/
export const isTextStyle = (style = {}, attributes = ["label", "font", "fontFamily", "fontSize", "fontStyle", "fontWeight", "textAlign", "textRotationDeg"]) => {
    return isAttrPresent(style, attributes);
};

/**
 * check if the style is assignable to an ol.Circle style
 * Note that sometimes circles can have a style similar to the polygons,
 * and that a property isCircle tells if it is an ol.Circle
 * @param {object} style to check
 * @param {string[]} attibutes of a circle style
 * @return {boolean} if the style is compatible with an ol.Circle style
*/
export const isCircleStyle = (style = {}, attributes = ["radius"]) => {
    return isAttrPresent(style, attributes);
};

/**
 * check if the style is assignable to an ol.Icon style, as marker
 * @param {object} style to check
 * @param {string[]} attibutes of a marker style
 * @return {boolean} if the style is compatible with an ol.Icon style
*/
export const isMarkerStyle = (style = {}, attributes = ["iconGlyph", "iconShape", "iconUrl"]) => {
    return isAttrPresent(style, attributes);
};

/**
 * check if the style is assignable to an ol.Icon style, as symbol
 * @param {object} style to check
 * @param {string[]} attibutes of a symbol style
 * @return {boolean} if the style is compatible with an ol.Icon style
*/
export const isSymbolStyle = (style = {}, attributes = ["symbolUrl"]) => {
    return isAttrPresent(style, attributes);
};


/**
 * gets a name from the style
 * @param {object} style to check
 * @return {string} the name
*/
export const getStylerTitle = (style = {}) => {
    if (isMarkerStyle(style)) {
        return "Marker";
    }
    if (isSymbolStyle(style)) {
        return "Symbol";
    }
    if (isTextStyle(style) ) {
        return "Text";
    }
    if (isCircleStyle(style) || style.title === "Circle Style") {
        return "Circle";
    }
    if (isFillStyle(style) ) {
        return "Polygon";
    }
    if (isStrokeStyle(style) ) {
        return "Polyline";
    }
    return "";
};

/**
 * local cache for ol geometry functions
 * TODO needs maptype management (although, on leaflet they must interact
 * on the original  geojson feature)
*/
export let geometryFunctions = {
    "centerPoint": {
        type: "Point",
        func: () => {}
    },
    "lineToArc": {
        type: "LineString",
        func: () => {}
    },
    "startPoint": {
        type: "Point",
        func: () => {}
    },
    "endPoint": {
        type: "Point",
        func: () => {}
    }
};

/**
* getdata relative to geometry function in the local cache
* @param {string} functionName the function name
* @param {string} item to be returned
* @return {string|function} the geometry function or the type
*/
export const getGeometryFunction = (functionName, item) => {
    return geometryFunctions[functionName] && geometryFunctions[functionName][item];
};

/**
 * register new geometry function in the local cache
 * @param {string} functionName the function name
 * @param {function} func the implementation of the function
 * @param {type} geometry type associated with this function
*/
export const registerGeometryFunctions = (functionName, func, type) => {
    if (functionName && func && type) {
        geometryFunctions[functionName] = {func, type};
    } else {
        throw new Error("specify all the params: functionName, func, type");
    }
};

/**
 * add the opacity to an object color {r, g, b}
 * @param {object} color to update
 * @param {number} opacity to add
 * @return {object} color updated
*/
export const addOpacityToColor = (color = "#FFCC33", opacity = 0.2) => (set("a", opacity, color));

/**
 * creates an has string from a string
 * https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @param {string} str to hash
 * @return the hash number
*/
export const hashCode = function(str) {
    let hash = 0;
    let i;
    let chr;
    if (str.length === 0) {
        return hash;
    }
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

/**
 * SymbolsStyles local cache
*/
let SymbolsStyles = {
};


/**
* register a symbol style in a local cache
* @param {number} sha unique id generated from the json stringify of the style object
* @param {object} styleItems object to register {style, base64, svg} etc.
*/
export const registerStyle = (sha, styleItems) => {
    if (sha && styleItems) {
        SymbolsStyles[sha] = styleItems;
    } else {
        throw new Error("specify all the params: sha, style");
    }
};

/**
* reset Styles
*/
export const setSymbolsStyles = (symbStyles = {}) => {
    SymbolsStyles = symbStyles;
};

/**
* get data relative to symbols style in the local caches
* @param {string} sha the sha generated from the style
* @param {string} item to be returned. Default is 'style'
* @return {object} the style object
*/
export const fetchStyle = (sha, item = "style") => {
    return SymbolsStyles[sha] && SymbolsStyles[sha][item];
};

/**
* get SymbolStyles
* @return {object} the object containing all the symbols Styles
*/
export const getSymbolsStyles = () => {
    return SymbolsStyles;
};

/**
* creates an hashCode after having stringified an object
* @param {object} style object
* @return {number} the sha
*/
export const hashAndStringify = (style) => {
    // style to has in case we want to exclude in future some props
    if (style) {
        return hashCode(JSON.stringify(style));
    }
    throw new Error("hashAndStringify: specify mandatory params: style");
};

/**
 * takes a dom element and parses it to a string
 * @param {object} domNode to parse
*/
export const domNodeToString = (domNode) => {
    let element = document.createElement("div");
    element.appendChild(domNode);
    return element.innerHTML;
};

export const createSvgUrl = (style = {}, url) => {
    /**
     * it loads an svg and it overrides some style option,
     * then it create and object URL that can be cached in a dictionary
    */
    // TODO think about adding a try catch for loading the not found icon
    return isSymbolStyle(style) && style.symbolUrl/* && !fetchStyle(hashAndStringify(style))*/ ?
        axios.get(url, { 'Content-Type': "image/svg+xml;charset=utf-8" })
            .then(response => {
                const DOMURL = window.URL || window.webkitURL || window;
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.data, 'image/svg+xml'); // create a dom element
                const svg = doc.firstElementChild; // fetch svg element

                // override attributes to the first svg tag
                svg.setAttribute("fill", style.fillColor || "#FFCC33");
                svg.setAttribute("fill-opacity", !isNil(style.fillOpacity) ? style.fillOpacity : 0.2);
                svg.setAttribute("stroke", colorToRgbaStr(style.color || "#FFCC33", !isNil(style.opacity) ? style.opacity : 1) );
                svg.setAttribute("stroke-opacity", !isNil(style.opacity) ? style.opacity : 1);
                svg.setAttribute("stroke-width", style.weight || 1);
                svg.setAttribute("width", style.size || 32);
                svg.setAttribute("height", style.size || 32);
                svg.setAttribute("stroke-dasharray", style.dashArray || "none");

                const svgBlob = new Blob([domNodeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
                const symbolUrlCustomized = DOMURL.createObjectURL(svgBlob);


                // ******** retrieving the base64 conversion of svg ********
                let canvas = document.createElement('canvas');
                canvas.width = style.size;
                canvas.height = style.size;
                let ctx = canvas.getContext("2d");
                let icon = new Image();

                icon.src = symbolUrlCustomized;
                let base64 = "";
                let sha = hashAndStringify(style);
                icon.onload = () => {
                    try {
                    // only when loaded draw the customized svg
                        ctx.drawImage(icon, (canvas.width / 2) - (icon.width / 2), (canvas.height / 2) - (icon.height / 2));
                        base64 = canvas.toDataURL("image/png");
                        canvas = null;
                        registerStyle(sha, {style: {...style, symbolUrlCustomized}, base64});
                    } catch (e) {
                        return;
                    }
                };
                registerStyle(sha, {style: {...style, symbolUrlCustomized}, svg, base64});

                return symbolUrlCustomized;
            }).catch(()=> {
                return require('../product/assets/symbols/symbolMissing.svg');
            }) : new Promise((resolve) => {
            resolve(null);
        });
};

export const createStylesAsync = (styles = []) => {
    return styles.map(style => {
        return isSymbolStyle(style) && !fetchStyle(hashAndStringify(style)) ? createSvgUrl(style, style.symbolUrl || style.symbolUrlCustomized)
            .then(symbolUrlCustomized => {
                return symbolUrlCustomized ? {...style, symbolUrlCustomized} : fetchStyle(hashAndStringify(style));
            }).catch(() => {
                return {...style, symbolUrlCustomized: require('../product/assets/symbols/symbolMissing.svg')};
            }) : new Promise((resolve) => {
            resolve(isSymbolStyle(style) ? fetchStyle(hashAndStringify(style)) : style);
        });
    });
};

/**
 * Import a style parser based on the format
 * @param  {string} format format encoding of the style: css, sld or openlayers
 * @return {promise} returns the parser instance if available
 */
export const getStyleParser = (format = 'sld') => {
    if (!StyleParsers[format]) {
        return Promise.resolve(null);
    }
    // import parser libraries dynamically
    return StyleParsers[format]();
};

function msStyleToSymbolizer(style, feature) {
    if (isTextStyle(style) && feature?.properties?.valueText) {
        const fontParts = (style.font || '').split(' ');
        return Promise.resolve({
            kind: 'Text',
            label: feature.properties.valueText,
            font: [fontParts[fontParts.length - 1]],
            size: parseFloat(style.fontSize),
            fontStyle: style.fontStyle,
            fontWeight: style.fontWeight,
            color: style.fillColor,
            haloColor: style.color,
            haloWidth: 1
        });
    }
    if (style.symbolizerKind === 'Mark') {
        return Promise.resolve({
            kind: 'Mark',
            color: style.fillColor,
            fillOpacity: style.fillOpacity,
            strokeColor: style.color,
            strokeOpacity: style.opacity,
            strokeWidth: style.weight,
            radius: style.radius ?? 10,
            wellKnownName: 'Circle'
        });
    }
    if (isAttrPresent(style, ['iconUrl']) && !style.iconGlyph && !style.iconShape) {
        return Promise.resolve({
            kind: 'Icon',
            image: style.iconUrl,
            size: max(style.iconSize || [32]),
            opacity: 1,
            rotate: 0
        });
    }
    if (isMarkerStyle(style)) {
        return Promise.resolve({
            kind: 'Icon',
            image: MarkerUtils.extraMarkers.markerToDataUrl(style),
            size: 45,
            opacity: 1,
            rotate: 0
        });
    }
    if (isSymbolStyle(style)) {
        const cachedSymbol = fetchStyle(hashAndStringify(style));
        return (
            cachedSymbol?.symbolUrlCustomized
                ? Promise.resolve(cachedSymbol?.symbolUrlCustomized)
                : createSvgUrl(style, style.symbolUrl || style.symbolUrlCustomized)
        )
            .then((symbolUrlCustomized) => {
                return {
                    kind: 'Icon',
                    image: symbolUrlCustomized,
                    size: style.size,
                    opacity: 1,
                    rotate: 0
                };
            })
            .catch(() => ({}));
    }
    if (isCircleStyle(style) || style.title === "Circle Style") {
        return Promise.resolve({
            kind: 'Fill',
            color: style.fillColor,
            opacity: style.fillOpacity,
            fillOpacity: style.fillOpacity,
            outlineColor: style.color,
            outlineOpacity: style.opacity,
            outlineWidth: style.weight
        });
    }
    if (isFillStyle(style) ) {
        return Promise.resolve({
            kind: 'Fill',
            color: style.fillColor,
            opacity: style.fillOpacity,
            fillOpacity: style.fillOpacity,
            outlineColor: style.color,
            outlineOpacity: style.opacity,
            outlineWidth: style.weight
        });
    }
    if (isStrokeStyle(style) ) {
        return Promise.resolve({
            kind: 'Line',
            color: style.color,
            opacity: style.opacity,
            width: style.weight,
            ...(style?.dashArray && { dasharray: style.dashArray.map((value) => parseFloat(value)) })
        });
    }
    return Promise.resolve({});
}

function splitStyles(styles) {
    return flatten(styles.map(style => {
        return [
            ...(isAttrPresent(style, ['iconUrl'])
                ? [
                    {

                        iconAnchor: style.iconAnchor,
                        iconSize: style.iconSize,
                        iconUrl: style.iconUrl,
                        popupAnchor: style.popupAnchor,
                        shadowSize: style.shadowSize,
                        shadowUrl: style.shadowUrl
                    }
                ]
                : []),

            ...(isFillStyle(style) && style.radius
                ? [
                    {
                        symbolizerKind: 'Mark',
                        fillColor: style.fillColor,
                        fillOpacity: style.fillOpacity ?? 1,
                        color: style.color,
                        opacity: style.opacity ?? 1,
                        weight: style.weight ?? 1,
                        radius: style.radius ?? 10
                    }
                ]
                : []),
            ...(isStrokeStyle(style)
                ? [
                    {
                        color: style.color,
                        opacity: style.opacity ?? 1,
                        weight: style.weight ?? 1,
                        dashArray: style.dashArray
                    }
                ]
                : []),
            ...(isFillStyle(style)
                ? [
                    {
                        fillColor: style.fillColor,
                        fillOpacity: style.fillOpacity ?? 1,
                        color: style.color,
                        opacity: style.opacity ?? 1,
                        weight: style.weight ?? 1
                    }
                ]
                : [])
        ];
    }));
}

export function layerToGeoStylerStyle(layer) {
    const features = flattenFeatures(layer?.features || []);
    const hasFeatureStyle = features.find(feature => !isEmpty(feature?.style || {}) && feature?.properties?.id);
    if (hasFeatureStyle) {
        const filteredFeatures = features.filter(feature => feature?.style && feature?.properties?.id);
        return Promise.all(
            flatten(filteredFeatures.map((feature) => {
                const styles = castArray(feature.style);
                return styles.map((style) =>
                    msStyleToSymbolizer(style, feature)
                        .then((symbolizer) => ({ symbolizer, filter: ['==', 'id', feature.properties.id] }))
                );
            }))
        ).then((symbolizers) => {
            return {
                format: 'geostyler',
                body: {
                    name: '',
                    rules: symbolizers.map(({ filter, symbolizer }) => ({
                        name: '',
                        filter,
                        symbolizers: [symbolizer]
                    }))
                },
                metadata: {
                    editorType: 'visual'
                }
            };
        });
    }
    if (!isEmpty(layer.style) && !layer?.style?.format && !layer?.style?.body) {
        return Promise.all(
            splitStyles(castArray(layer.style)).map((style) => msStyleToSymbolizer(style))
        )
            .then((symbolizers) => {
                const geometryTypeToKind = {
                    'point': ['Mark', 'Icon', 'Text'],
                    'linestring': ['Line'],
                    'polygon': ['Fill']
                };
                return {
                    format: 'geostyler',
                    body: {
                        name: '',
                        rules: symbolizers
                            .filter(({ kind }) => !geometryTypeToKind[layer.geometryType] || geometryTypeToKind[layer.geometryType].includes(kind))
                            .map(symbolizer => ({
                                name: '',
                                symbolizers: [symbolizer]
                            }))
                    },
                    metadata: {
                        editorType: 'visual'
                    }
                };
            });
    }
    return Promise.resolve(layer.style);
}

export function getStyle({ style }, parserFormat) {
    const { format = 'geostyler', body } = style || {};
    if (!format || !body) {
        return Promise.resolve(null);
    }
    if (format === 'geostyler') {
        return getStyleParser(parserFormat)
            .then((parser) => parser.writeStyle(body));
    }
    return Promise.all([
        getStyleParser(format),
        getStyleParser(parserFormat)
    ])
        .then(([inParser, outParser]) =>
            inParser
                .readStyle(body)
                .then(parsedStyle => outParser.writeStyle(parsedStyle))
        );
}


export function applyDefaultStyleToLayer(layer) {
    const features = flattenFeatures(layer?.features || []);
    const hasFeatureStyle = features.find(feature => !isEmpty(feature?.style || {}) && feature?.properties?.id);
    if (hasFeatureStyle
    || layer?.style?.format && !isEmpty(layer?.style?.body)
    || !layer?.style?.format && !isEmpty(layer.style)) {
        return layer;
    }

    return {
        ...layer,
        style: {
            format: 'geostyler',
            body: {
                name: 'Default Style',
                rules: [
                    {
                        name: 'Default Point Style',
                        symbolizers: [
                            {
                                kind: 'Mark',
                                color: '#f2f2f2',
                                fillOpacity: 0.3,
                                opacity: 0.5,
                                strokeColor: '#3075e9',
                                strokeOpacity: 1,
                                strokeWidth: 2,
                                wellKnownName: 'Circle',
                                radius: 10
                            }
                        ]
                    },
                    {
                        name: 'Default Line Style',
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: '#3075e9',
                                opacity: 1,
                                width: 2
                            }
                        ]
                    },
                    {
                        name: 'Default Polygon Style',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#f2f2f2',
                                fillOpacity: 0.3,
                                outlineColor: '#3075e9',
                                outlineOpacity: 1,
                                outlineWidth: 2
                            }
                        ]
                    }
                ]
            }
        }
    };
}
