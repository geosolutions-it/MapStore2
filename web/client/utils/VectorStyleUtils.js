/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { isNil, get, uniq, isArray } = require('lodash');
const { set } = require('./ImmutableUtils');
const { colorToRgbaStr } = require('./ColorUtils');
const axios = require('axios');
const SLDParser = require('geostyler-sld-parser').default;
const MBStyleParser = require('geostyler-mapbox-parser').default;
const { parseString, Builder } = require('xml2js');
const StyleParsers = {
    sld: new SLDParser(),
    mbstyle: new MBStyleParser()
};

/**
 * checks if there is at least one attrbute in the object
 * @param {object} style the object to use for filtering the list of attributes
 * @param {string[]} attributes to use as filter list
 * @return {boolean} the result of the check
*/
const isAttrPresent = (style = {}, attributes) => (attributes.filter(prop => !isNil(style[prop])).length > 0);

/**
 * check if the style is assignable to an ol.Stroke style
 * @param {object} style to check
 * @param {string[]} attibutes of a stroke style
 * @return {boolean} if the style is compatible with an ol.Stroke
*/
const isStrokeStyle = (style = {}, attributes = ["color", "opacity", "dashArray", "dashOffset", "lineCap", "lineJoin", "weight"]) => {
    return isAttrPresent(style, attributes);
};

/**
 * check if the style is assignable to an ol.Fill style
 * @param {object} style to check
 * @param {string[]} attibutes of a fill style
 * @return {boolean} if the style is compatible with an ol.Fill style
*/
const isFillStyle = (style = {}, attributes = ["fillColor", "fillOpacity"]) => {
    return isAttrPresent(style, attributes);
};

/**
 * check if the style is assignable to an ol.Text style
 * @param {object} style to check
 * @param {string[]} attibutes of a text style
 * @return {boolean} if the style is compatible with an ol.Text style
*/
const isTextStyle = (style = {}, attributes = ["label", "font", "fontFamily", "fontSize", "fontStyle", "fontWeight", "textAlign"]) => {
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
const isCircleStyle = (style = {}, attributes = ["radius"]) => {
    return isAttrPresent(style, attributes);
};

/**
 * check if the style is assignable to an ol.Icon style, as marker
 * @param {object} style to check
 * @param {string[]} attibutes of a marker style
 * @return {boolean} if the style is compatible with an ol.Icon style
*/
const isMarkerStyle = (style = {}, attributes = ["iconGlyph", "iconShape", "iconUrl"]) => {
    return isAttrPresent(style, attributes);
};

/**
 * check if the style is assignable to an ol.Icon style, as symbol
 * @param {object} style to check
 * @param {string[]} attibutes of a symbol style
 * @return {boolean} if the style is compatible with an ol.Icon style
*/
const isSymbolStyle = (style = {}, attributes = ["symbolUrl"]) => {
    return isAttrPresent(style, attributes);
};


/**
 * gets a name from the style
 * @param {object} style to check
 * @return {string} the name
*/
const getStylerTitle = (style = {}) => {
    if (isMarkerStyle(style)) {
        return "Marker";
    }
    if (isSymbolStyle(style)) {
        return "Symbol";
    }
    if (isTextStyle(style)) {
        return "Text";
    }
    if (isCircleStyle(style) || style.title === "Circle Style") {
        return "Circle";
    }
    if (isFillStyle(style)) {
        return "Polygon";
    }
    if (isStrokeStyle(style)) {
        return "Polyline";
    }
    return "";
};

/**
 * local cache for ol geometry functions
 * TODO needs maptype management (although, on leaflet they must interact
 * on the original  geojson feature)
*/
let geometryFunctions = {
    "centerPoint": {
        type: "Point",
        func: () => { }
    },
    "lineToArc": {
        type: "LineString",
        func: () => { }
    },
    "startPoint": {
        type: "Point",
        func: () => { }
    },
    "endPoint": {
        type: "Point",
        func: () => { }
    }
};

/**
* getdata relative to geometry function in the local cache
* @param {string} functionName the function name
* @param {string} item to be returned
* @return {string|function} the geometry function or the type
*/
const getGeometryFunction = (functionName, item) => {
    return geometryFunctions[functionName] && geometryFunctions[functionName][item];
};

/**
 * register new geometry function in the local cache
 * @param {string} functionName the function name
 * @param {function} func the implementation of the function
 * @param {type} geometry type associated with this function
*/
const registerGeometryFunctions = (functionName, func, type) => {
    if (functionName && func && type) {
        geometryFunctions[functionName] = { func, type };
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
const addOpacityToColor = (color = "#FFCC33", opacity = 0.2) => (set("a", opacity, color));

/**
 * creates an has string from a string
 * https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @param {string} str to hash
 * @return the hash number
*/
const hashCode = function(str) {
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
const registerStyle = (sha, styleItems) => {
    if (sha && styleItems) {
        SymbolsStyles[sha] = styleItems;
    } else {
        throw new Error("specify all the params: sha, style");
    }
};

/**
* reset Styles
*/
const setSymbolsStyles = (symbStyles = {}) => {
    SymbolsStyles = symbStyles;
};

/**
* get data relative to symbols style in the local caches
* @param {string} sha the sha generated from the style
* @param {string} item to be returned. Default is 'style'
* @return {object} the style object
*/
const fetchStyle = (sha, item = "style") => {
    return SymbolsStyles[sha] && SymbolsStyles[sha][item];
};

/**
* get SymbolStyles
* @return {object} the object containing all the symbols Styles
*/
const getSymbolsStyles = () => {
    return SymbolsStyles;
};

/**
* creates an hashCode after having stringified an object
* @param {object} style object
* @return {number} the sha
*/
const hashAndStringify = (style) => {
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
const domNodeToString = (domNode) => {
    let element = document.createElement("div");
    element.appendChild(domNode);
    return element.innerHTML;
};

const createSvgUrl = (style = {}, url) => {
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
                svg.setAttribute("stroke", colorToRgbaStr(style.color || "#FFCC33", !isNil(style.opacity) ? style.opacity : 1));
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
                        registerStyle(sha, { style: { ...style, symbolUrlCustomized }, base64 });
                    } catch (e) {
                        return;
                    }
                };
                registerStyle(sha, { style: { ...style, symbolUrlCustomized }, svg, base64 });

                return symbolUrlCustomized;
            }).catch(() => {
                return require('../product/assets/symbols/symbolMissing.svg');
            }) : new Promise((resolve) => {
                resolve(null);
            });
};

const createStylesAsync = (styles = []) => {
    return styles.map(style => {
        return isSymbolStyle(style) && !fetchStyle(hashAndStringify(style)) ? createSvgUrl(style, style.symbolUrl || style.symbolUrlCustomized)
            .then(symbolUrlCustomized => {
                return symbolUrlCustomized ? { ...style, symbolUrlCustomized } : fetchStyle(hashAndStringify(style));
            }).catch(() => {
                return { ...style, symbolUrlCustomized: require('../product/assets/symbols/symbolMissing.svg') };
            }) : new Promise((resolve) => {
                resolve(isSymbolStyle(style) ? fetchStyle(hashAndStringify(style)) : style);
            });
    });
};

const getStyleParser = (format = 'sld') => {
    return StyleParsers[format];
};

function mergeStyleSheet(format, styleSheets) {
    const styleParser = StyleParsers[format];
    if (format === 'sld') {
        const mergedSldObj = styleSheets
            .map(function({ group }) {
                return group
                    .map(function(styleSheet) {
                        let response;
                        parseString(styleSheet, {
                            tagNameProcessors: [styleParser.tagNameProcessor]
                        }, function(jsonError, json) {
                            response = json;
                        });
                        return response;
                    })
                    .reduce(function(fullSldObj, sldObj) {
                        const { StyledLayerDescriptor } = sldObj;
                        const { NamedLayer } = StyledLayerDescriptor;
                        const { UserStyle } = NamedLayer[0];
                        const { FeatureTypeStyle } = UserStyle[0];
                        const featureTypeStyles = get(fullSldObj, 'StyledLayerDescriptor.NamedLayer[0].UserStyle[0].FeatureTypeStyle') || [];
                        return {
                            StyledLayerDescriptor: {
                                ...StyledLayerDescriptor,
                                NamedLayer: [{
                                    ...NamedLayer[0],
                                    UserStyle: [
                                        {
                                            ...UserStyle[0],
                                            FeatureTypeStyle: [
                                                ...featureTypeStyles,
                                                ...FeatureTypeStyle
                                            ]
                                        }
                                    ]
                                }]
                            }
                        };
                    }, {});
            })
            .reduce(function(fullSldObj, sldObj) {
                const { StyledLayerDescriptor } = sldObj;
                const { NamedLayer } = StyledLayerDescriptor;
                const namedLayers = get(fullSldObj, 'StyledLayerDescriptor.NamedLayer') || [];
                return {
                    StyledLayerDescriptor: {
                        ...StyledLayerDescriptor,
                        NamedLayer: [
                            ...namedLayers,
                            ...NamedLayer
                        ]
                    }
                };
            }, {});

        let builderOpts = {
            renderOpts: { pretty: styleParser.prettyOutput }
        };
        const builder = new Builder(builderOpts);
        return builder.buildObject(mergedSldObj);
    } else if (format === 'mbstyle') {
        const mergedMBStyle = styleSheets
            .map(function({ group }) {
                return group
                    .map(function(styleSheet) {
                        try {
                            return JSON.parse(styleSheet);
                        } catch(e) {
                            return {};
                        }
                    })
                    .reduce(function(fullMBStyleObj, mbStyleObj) {
                        const layers = fullMBStyleObj.layers || [];
                        return {
                            ...fullMBStyleObj,
                            ...mbStyleObj,
                            layers: [ ...layers, ...(mbStyleObj.layers || []) ]
                        };
                    }, {});
            })
            .reduce(function(fullMBStyleObj, mbStyleObj) {
                const layers = fullMBStyleObj.layers || [];
                return {
                    ...fullMBStyleObj,
                    ...mbStyleObj,
                    layers: [ ...layers, ...(mbStyleObj.layers || []) ]
                };
            }, {});
        return mergedMBStyle;
    }
    return styleSheets;
}

function splitStyleSheet(format, styleSheet, options = {}) {
    const {
        onlyLayers
    } = options;
    const styleParser = StyleParsers[format];
    if (format === 'sld') {
        let response;
        parseString(styleSheet, {
            tagNameProcessors: [styleParser.tagNameProcessor]
        }, function(jsonError, json) {
            response = json;
        });
        let builderOpts = {
            renderOpts: { pretty: styleParser.prettyOutput }
        };
        const builder = new Builder(builderOpts);
        const { StyledLayerDescriptor } = response;
        const { NamedLayer } = StyledLayerDescriptor;
        const styleSheets = NamedLayer.map((namedLayer) => {
            const { Name, UserStyle } = namedLayer;
            const { FeatureTypeStyle } = UserStyle[0];
            const featureTypeStyles = FeatureTypeStyle.map((featureTypeStyle) => {
                const geoStylerStyle = styleParser.sldObjectToGeoStylerStyle({
                    StyledLayerDescriptor: {
                        ...StyledLayerDescriptor,
                        NamedLayer: [{
                            ...namedLayer,
                            UserStyle: [
                                {
                                    ...UserStyle[0],
                                    FeatureTypeStyle: [
                                        featureTypeStyle
                                    ]
                                }
                            ]
                        }]
                    }
                });
                return styleParser.geoStylerStyleToSldObject(geoStylerStyle);
            });

            const group = onlyLayers
                ? builder.buildObject({
                    StyledLayerDescriptor: {
                        ...StyledLayerDescriptor,
                        NamedLayer: [{
                            ...namedLayer,
                            UserStyle: [
                                {
                                    ...UserStyle[0],
                                    FeatureTypeStyle: featureTypeStyles
                                        .map(sld => get(sld, 'StyledLayerDescriptor.NamedLayer[0].UserStyle[0].FeatureTypeStyle[0]'))
                                }
                            ]
                        }]
                    }
                })
                : featureTypeStyles.map(featureTypeStyle => builder.buildObject(featureTypeStyle));
            return {
                group,
                layerName: Name[0]
            };
        });
        return styleSheets;
    }
    if (format === 'mbstyle') {
        const { layers = [] } = styleSheet || {};
        const layersNames = uniq(layers.map(rule => rule['source-layer']));
        return layersNames.map((layerName) => ({
            layerName,
            group: onlyLayers
                ? {
                    ...styleSheet,
                    layers: layers.filter(rule => rule['source-layer'] === layerName)
                }
                : [
                    {
                        ...styleSheet,
                        layers: layers.filter(rule => rule['source-layer'] === layerName)
                    }
                ]
        }));
    }
    return styleSheet;
}

function styleSheetToGeoStylerStyle(format, styleSheet) {
    const styleParser = StyleParsers[format];
    const splitStyle = splitStyleSheet(format, styleSheet);
    const layersStyles = isArray(splitStyle) && splitStyle;
    return Promise.all(
        layersStyles
            .reduce((acc, { layerName, group }) => [
                ...acc,
                ...group
                    .map((layerStyleBody) =>
                        styleParser
                            .readStyle(layerStyleBody)
                                .then((style) => ({ ...style }))
                                .catch(() => ({ rules: [], name: layerName }))
                    )
                ],
            [])
    )
    .then(function(geoStylerStyles) {
        return geoStylerStyles
            .reduce(function(acc, { name, rules }) {
                const currentStyle = acc.find((style) => style.layerName === name);
                if (currentStyle) {
                    return acc.map(function(style) {
                        return style.layerName === name
                            ? {
                                layerName: name,
                                group: [
                                    ...style.group,
                                    { name, rules }
                                ]
                            } : style;
                    });
                }
                return [ ...acc, { layerName: name, group: [ { name, rules } ] } ];
            }, []);
    });
}

function geoStylerStyleToStyleSheet(format, geoStylerStyles) {
    const styleParser = StyleParsers[format];
    const layersStyles = isArray(geoStylerStyles) && geoStylerStyles;
    return Promise.all(
        layersStyles
            .reduce((acc, { group, layerName }) => [
                ...acc,
                ...group
                    .map((layerStyleBody) =>
                        styleParser
                            .writeStyle(layerStyleBody)
                                .then((styleSheet) => ({ layerName, styleSheet }))
                                .catch(() => null)
                    )
                ],
            [])
    )
    .then((styles) => {
        const splitStyle = styles
            .filter(val => val)
            .reduce(function(acc, { layerName, styleSheet }) {
                const currentStyle = acc.find((style) => style.layerName === layerName);
                if (currentStyle) {
                    return acc.map(function(style) {
                        return style.layerName === name
                            ? {
                                layerName: name,
                                group: [
                                    ...style.group,
                                    styleSheet
                                ]
                            } : style;
                    });
                }
                return [ ...acc, { layerName: name, group: [ styleSheet ] } ];
            }, []);
        return mergeStyleSheet(format, splitStyle);
    });
}

function mimeTypeToStyleFormat(mimeType) {
    const formats = [
        {
            format: 'mbstyle',
            types: [ 'application/vnd.geoserver.mbstyle+json' ]
        },
        {
            format: 'sld',
            types: ['application/vnd.ogc.sld+xml']
        }
    ];
    const { format = 'sld' } = formats.find(({ types }) => types.indexOf(mimeType) !== -1) || {};
    return format;
}

module.exports = {
    getGeometryFunction,
    SymbolsStyles,
    registerStyle,
    fetchStyle,
    hashCode,
    hashAndStringify,
    domNodeToString,
    createSvgUrl,
    registerGeometryFunctions,
    geometryFunctions,
    getStylerTitle,
    isAttrPresent,
    addOpacityToColor,
    isMarkerStyle,
    isSymbolStyle,
    isTextStyle,
    isCircleStyle,
    isStrokeStyle,
    isFillStyle,
    getSymbolsStyles,
    setSymbolsStyles,
    createStylesAsync,
    getStyleParser,
    splitStyleSheet,
    mergeStyleSheet,
    styleSheetToGeoStylerStyle,
    geoStylerStyleToStyleSheet,
    mimeTypeToStyleFormat
};
