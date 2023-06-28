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

import OlImageState from 'ol/ImageState';

import OlGeomPoint from 'ol/geom/Point';

import OlStyle from 'ol/style/Style';
import OlStyleImage from 'ol/style/Image';
import OlStyleStroke from 'ol/style/Stroke';
import OlStyleText from 'ol/style/Text';
import OlStyleCircle from 'ol/style/Circle';
import OlStyleFill from 'ol/style/Fill';
import OlStyleIcon from 'ol/style/Icon';
import OlStyleRegularshape from 'ol/style/RegularShape';
import { METERS_PER_UNIT } from 'ol/proj/Units';
import { getCenter } from 'ol/extent';
import OlGeomLineString from 'ol/geom/LineString';
import { toContext } from 'ol/render';
import GeoJSON from 'ol/format/GeoJSON';
import {
    expressionsUtils,
    resolveAttributeTemplate,
    isGeoStylerFunction,
    isGeoStylerStringFunction,
    isGeoStylerNumberFunction,
    geoStylerStyleFilter,
    drawIcons,
    getImageIdFromSymbolizer
} from './StyleParserUtils';
import isString from 'lodash/isString';
import { geometryFunctionsLibrary } from './GeometryFunctionsUtils';

const getGeometryFunction = geometryFunctionsLibrary.openlayers({
    Point: OlGeomPoint,
    LineString: OlGeomLineString,
    GeoJSON,
    getCenter
});

const WELLKNOWNNAME_TTF_REGEXP = /^ttf:\/\/(.+)#(.+)$/;
const DUMMY_MARK_SYMBOLIZER_FONT = 'geostyler-mark-symbolizer';

const getRgbaColor = (_colorString, _opacity) => {
    let colorString = _colorString;
    let opacity = _opacity;
    if (isGeoStylerStringFunction(colorString)) {
        colorString = expressionsUtils.evaluateStringFunction(colorString);
    }

    if (typeof (colorString) !== 'string') {
        return null;
    }
    if (colorString.startsWith('rgba(')) {
        return colorString;
    }

    // check if is valid HEX color - see also here
    // https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation/8027444
    const isHexColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colorString);
    if (!isHexColor) {
        return null;
    }

    const r = parseInt(colorString.slice(1, 3), 16);
    const g = parseInt(colorString.slice(3, 5), 16);
    const b = parseInt(colorString.slice(5, 7), 16);

    if (isGeoStylerNumberFunction(opacity)) {
        opacity = expressionsUtils.evaluateNumberFunction(opacity);
    }

    if (opacity < 0) {
        opacity = 1;
    }
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
};
/**
     * Returns true if the given mark symbolizer is based on a font glyph
     * (i.e. has a well known name property starting with 'ttf://').
     *
     * @param symbolizer The TextSymbolizer to derive the font string from
     */
const getIsFontGlyphBased = (symbolizer) => {
    return WELLKNOWNNAME_TTF_REGEXP.test(symbolizer.wellKnownName);
};

/**
 * Returns an OL compliant font string, to be used for mark symbolizers
 * using a font glyph.
 * This also includes a dummy DUMMY_MARK_SYMBOLIZER_FONT font name at the end of the
 * string to allow determining that this font was intended for a mark symbolizer
 * later on.
 *
 * @param symbolizer The TextSymbolizer to derive the font string from
 */
const getTextFontForMarkSymbolizer = (symbolizer) => {
    const parts = symbolizer.wellKnownName.match(WELLKNOWNNAME_TTF_REGEXP);
    if (!parts) {
        throw new Error(`Could not parse font-based well known name: ${symbolizer.wellKnownName}`);
    }
    const fontFamily = parts[1];
    return `Normal ${symbolizer.radius || 5}px '${fontFamily}', ${DUMMY_MARK_SYMBOLIZER_FONT}`;
};

/**
 * Returns a 1-char string to be used as text for mark symbolizers using a font glyph.
 *
 * @param symbolizer The MarkSymbolizer to derive the character string from
 */
const getCharacterForMarkSymbolizer = (symbolizer) => {
    const parts = symbolizer.wellKnownName.match(WELLKNOWNNAME_TTF_REGEXP);
    if (!parts) {
        throw new Error(`Could not parse font-based well known name: ${symbolizer.wellKnownName}`);
    }
    return String.fromCharCode(parseInt(parts[2], 16));
};

/**
 * This parser can be used with the GeoStyler.
 * It implements the GeoStyler-Style Parser interface to work with OpenLayers styles.
 *
 * @class OlStyleParser
 * @implements StyleParser
 */
export class OlStyleParser {

    /**
     * The name of the OlStyleParser.
     */
    static title = 'OpenLayers Style Parser';

    unsupportedProperties = {
        Symbolizer: {
            MarkSymbolizer: {
                avoidEdges: 'none',
                blur: 'none',
                offsetAnchor: 'none',
                pitchAlignment: 'none',
                pitchScale: 'none',
                visibility: 'none'
            },
            FillSymbolizer: {
                antialias: 'none',
                fillOpacity: {
                    support: 'none',
                    info: 'Use opacity instead.'
                },
                visibility: 'none'
            },
            IconSymbolizer: {
                allowOverlap: 'none',
                anchor: 'none',
                avoidEdges: 'none',
                color: 'none',
                haloBlur: 'none',
                haloColor: 'none',
                haloWidth: 'none',
                keepUpright: 'none',
                offsetAnchor: 'none',
                size: {
                    support: 'partial',
                    info: 'Will set/get the width of the ol Icon.'
                },
                optional: 'none',
                padding: 'none',
                pitchAlignment: 'none',
                rotationAlignment: 'none',
                textFit: 'none',
                textFitPadding: 'none',
                visibility: 'none'
            },
            LineSymbolizer: {
                blur: 'none',
                gapWidth: 'none',
                gradient: 'none',
                miterLimit: 'none',
                roundLimit: 'none',
                spacing: 'none',
                visibility: 'none',
                graphicFill: 'none',
                graphicStroke: 'none',
                perpendicularOffset: 'none'
            },
            RasterSymbolizer: 'none'
        },
        Function: {
            double2bool: {
                support: 'none',
                info: 'Always returns false'
            },
            atan2: {
                support: 'none',
                info: 'Currently returns the first argument'
            },
            rint: {
                support: 'none',
                info: 'Currently returns the first argument'
            },
            numberFormat: {
                support: 'none',
                info: 'Currently returns the first argument'
            },
            strAbbreviate: {
                support: 'none',
                info: 'Currently returns the first argument'
            }
        }
    };

    title = 'OpenLayers Style Parser';
    olIconStyleCache = {};

    OlStyleConstructor = OlStyle;
    OlStyleImageConstructor = OlStyleImage;
    OlStyleFillConstructor = OlStyleFill;
    OlStyleStrokeConstructor = OlStyleStroke;
    OlStyleTextConstructor = OlStyleText;
    OlStyleCircleConstructor = OlStyleCircle;
    OlStyleIconConstructor = OlStyleIcon;
    OlStyleRegularshapeConstructor = OlStyleRegularshape;

    constructor(ol) {
        if (ol) {
            this.OlStyleConstructor = ol.style.Style;
            this.OlStyleImageConstructor = ol.style.Image;
            this.OlStyleFillConstructor = ol.style.Fill;
            this.OlStyleStrokeConstructor = ol.style.Stroke;
            this.OlStyleTextConstructor = ol.style.Text;
            this.OlStyleCircleConstructor = ol.style.Circle;
            this.OlStyleIconConstructor = ol.style.Icon;
            this.OlStyleRegularshapeConstructor = ol.style.RegularShape;
        }
    }

    isOlParserStyleFct = x => {
        return typeof x === 'function';
    };

    readStyle() {
        return new Promise((resolve, reject) => {
            try {
                resolve(null);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * The writeStyle implementation of the GeoStyler-Style StyleParser interface.
     * It reads a GeoStyler-Style Style and returns a Promise.
     * The Promise itself resolves one of three types
     *
     * 1. OlStyle if input Style consists of
     *    one rule with one symbolizer, no filter, no scaleDenominator, no TextSymbolizer
     * 2. OlStyle[] if input Style consists of
     *    one rule with multiple symbolizers, no filter, no scaleDenominator, no TextSymbolizer
     * 3. OlParserStyleFct for everything else
     *
     * @param geoStylerStyle A GeoStyler-Style Style.
     * @return The Promise resolving with one of above mentioned style types.
     */
    writeStyle(geoStylerStyle) {
        return drawIcons(geoStylerStyle)
            .then((images) => {
                this._computeIconScaleBasedOnSymbolizer = (symbolizer) => {
                    const { image, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(symbolizer)) || {};
                    if (image && width && height) {
                        const side = width > height ? width : height;
                        const scale = symbolizer.size / side;
                        return scale;
                    }
                    return symbolizer.size;
                };
                return new Promise((resolve) => {
                    const unsupportedProperties = this.checkForUnsupportedProperties(geoStylerStyle);
                    try {
                        const olStyle = this.getOlStyleTypeFromGeoStylerStyle(geoStylerStyle);
                        resolve(olStyle, {
                            unsupportedProperties,
                            warnings: unsupportedProperties && ['Your style contains unsupportedProperties!']
                        });
                    } catch (error) {
                        resolve({
                            errors: [error]
                        });
                    }
                });
            });
    }

    checkForUnsupportedProperties(geoStylerStyle) {
        const capitalizeFirstLetter = (a) => a[0].toUpperCase() + a.slice(1);
        const unsupportedProperties = {};
        geoStylerStyle?.rules?.forEach(rule => {
            // ScaleDenominator and Filters are completly supported so we just check for symbolizers
            rule.symbolizers.forEach(symbolizer => {
                const key = capitalizeFirstLetter(`${symbolizer.kind}Symbolizer`);
                const value = this.unsupportedProperties?.Symbolizer?.[key];
                if (value) {
                    if (typeof value === 'string' || value instanceof String) {
                        if (!unsupportedProperties.Symbolizer) {
                            unsupportedProperties.Symbolizer = {};
                        }
                        unsupportedProperties.Symbolizer[key] = value;
                    } else {
                        Object.keys(symbolizer).forEach(property => {
                            if (value[property]) {
                                if (!unsupportedProperties.Symbolizer) {
                                    unsupportedProperties.Symbolizer = {};
                                }
                                if (!unsupportedProperties.Symbolizer[key]) {
                                    unsupportedProperties.Symbolizer[key] = {};
                                }
                                unsupportedProperties.Symbolizer[key][property] = value[property];
                            }
                        });
                    }
                }
            });
        });
        if (Object.keys(unsupportedProperties).length > 0) {
            return unsupportedProperties;
        }
        return null;
    }

    /**
     * Decides which OlStyleType should be returned depending on given geoStylerStyle.
     * Three OlStyleTypes are possible:
     *
     * 1. OlStyle if input Style consists of
     *    one rule with one symbolizer, no filter, no scaleDenominator, no TextSymbolizer
     * 2. OlStyle[] if input Style consists of
     *    one rule with multiple symbolizers, no filter, no scaleDenominator, no TextSymbolizer
     * 3. OlParserStyleFct for everything else
     *
     * @param geoStylerStyle A GeoStyler-Style Style
     */
    getOlStyleTypeFromGeoStylerStyle(geoStylerStyle) {
        return this.geoStylerStyleToOlParserStyleFct(geoStylerStyle);
    }

    /**
     * Get the OpenLayers Style object from an GeoStyler-Style Style
     *
     * @param geoStylerStyle A GeoStyler-Style Style.
     * @return An OlParserStyleFct
     */
    geoStylerStyleToOlParserStyleFct(geoStylerStyle) {
        const rules = geoStylerStyle.rules;
        const olStyle = ({ map } = {}) => (feature, resolution) => {
            this._getMap = () => map;
            const styles = [];

            // calculate scale for resolution (from ol-util MapUtil)
            const units = map
                ? map.getView().getProjection().getUnits()
                : 'm';
            const dpi = 25.4 / 0.28;
            const mpu = METERS_PER_UNIT[units];
            const inchesPerMeter = 39.37;
            const scale = resolution * mpu * inchesPerMeter * dpi;

            rules.forEach((rule) => {
                // handling scale denominator
                let minScale = rule?.scaleDenominator?.min;
                let maxScale = rule?.scaleDenominator?.max;
                let isWithinScale = true;
                if (minScale || maxScale) {
                    minScale = isGeoStylerFunction(minScale) ? expressionsUtils.evaluateNumberFunction(minScale) : minScale;
                    maxScale = isGeoStylerFunction(maxScale) ? expressionsUtils.evaluateNumberFunction(maxScale) : maxScale;
                    if (minScale && scale < minScale) {
                        isWithinScale = false;
                    }
                    if (maxScale && scale >= maxScale) {
                        isWithinScale = false;
                    }
                }

                // handling filter
                let matchesFilter = false;
                if (!rule.filter) {
                    matchesFilter = true;
                } else {
                    try {
                        matchesFilter = geoStylerStyleFilter(feature, rule.filter);
                    } catch (e) {
                        matchesFilter = false;
                    }
                }

                if (isWithinScale && matchesFilter) {
                    rule.symbolizers.forEach((symb) => {
                        const olSymbolizer = this.getOlSymbolizerFromSymbolizer(symb, feature);

                        // either an OlStyle or an ol.StyleFunction. OpenLayers only accepts an array
                        // of OlStyles, not ol.StyleFunctions.
                        // So we have to check it and in case of an ol.StyleFunction call that function
                        // and add the returned style to const styles.
                        if (typeof olSymbolizer !== 'function') {
                            styles.push(olSymbolizer);
                        } else {
                            const styleFromFct = olSymbolizer(feature, resolution);
                            styles.push(styleFromFct);
                        }
                    });
                }
            });
            return styles;
        };
        const olStyleFct = olStyle;
        olStyleFct.__geoStylerStyle = geoStylerStyle;
        return olStyleFct;
    }

    /**
     * Get the OpenLayers Style object or an OL StyleFunction from an
     * GeoStyler-Style Symbolizer.
     *
     * @param symbolizer A GeoStyler-Style Symbolizer.
     * @return The OpenLayers Style object or a StyleFunction
     */
    getOlSymbolizerFromSymbolizer(symbolizer, feature) {
        let olSymbolizer;

        switch (symbolizer.kind) {
        case 'Mark':
            olSymbolizer = this.getOlPointSymbolizerFromMarkSymbolizer(symbolizer, feature);
            break;
        case 'Icon':
            olSymbolizer = this.getOlIconSymbolizerFromIconSymbolizer(symbolizer, feature);
            break;
        case 'Text':
            olSymbolizer = this.getOlTextSymbolizerFromTextSymbolizer(symbolizer, feature);
            break;
        case 'Line':
            olSymbolizer = this.getOlLineSymbolizerFromLineSymbolizer(symbolizer, feature);
            break;
        case 'Fill':
            olSymbolizer = this.getOlPolygonSymbolizerFromFillSymbolizer(symbolizer, feature);
            break;
        default:
            // Return the OL default style since the TS type binding does not allow
            // us to set olSymbolizer to undefined
            const fill = new this.OlStyleFillConstructor({
                color: 'rgba(255,255,255,0.4)'
            });
            const stroke = new this.OlStyleStrokeConstructor({
                color: '#3399CC',
                width: 1.25
            });
            olSymbolizer = new this.OlStyleConstructor({
                image: new this.OlStyleCircleConstructor({
                    fill: fill,
                    stroke: stroke,
                    radius: 5
                }),
                fill: fill,
                stroke: stroke
            });
            break;
        }

        return olSymbolizer;
    }

    /**
     * Get the OL Style object  from an GeoStyler-Style MarkSymbolizer.
     *
     * @param markSymbolizer A GeoStyler-Style MarkSymbolizer.
     * @return The OL Style object
     */
    getOlPointSymbolizerFromMarkSymbolizer(markSymbolizer, feature) {
        let stroke;

        for (const key of Object.keys(markSymbolizer)) {
            if (isGeoStylerFunction(markSymbolizer[key])) {
                markSymbolizer[key] = expressionsUtils.evaluateFunction(markSymbolizer[key], feature);
            }
        }

        const strokeColor = markSymbolizer.strokeColor;
        const strokeOpacity = markSymbolizer.strokeOpacity;

        const sColor = strokeColor && (strokeOpacity !== undefined)
            ? getRgbaColor(strokeColor, strokeOpacity)
            : markSymbolizer.strokeColor;

        if (markSymbolizer.strokeColor || markSymbolizer.strokeWidth !== undefined) {
            stroke = new this.OlStyleStrokeConstructor({
                color: sColor,
                width: markSymbolizer.strokeWidth
            });
        }
        const { geometry } = getGeometryFunction(markSymbolizer, feature, this._getMap()) || {};
        const color = markSymbolizer.color;
        const opacity = markSymbolizer.opacity;
        const radius = markSymbolizer.radius;
        const fillOpacity = markSymbolizer.fillOpacity;
        const fColor = color && (fillOpacity !== undefined)
            ? getRgbaColor(color, fillOpacity ?? 1)
            : color;

        const fill = new this.OlStyleFillConstructor({
            color: fColor
        });

        let olStyle;
        const shapeOpts = {
            fill: fill,
            radius: radius ?? 5,
            rotation: typeof (markSymbolizer.rotate) === 'number' ? markSymbolizer.rotate * Math.PI / 180 : undefined,
            stroke: stroke,
            displacement: typeof (markSymbolizer.offset) === 'number' ? markSymbolizer.offset : undefined
        };

        switch (markSymbolizer.wellKnownName.toLowerCase()) {
        case 'shape://dot':
        case 'circle':
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleCircleConstructor(shapeOpts)
            });
            break;
        case 'square':
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 4,
                    angle: 45 * Math.PI / 180
                })
            });
            break;
        case 'triangle':
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 3,
                    angle: 0
                })
            });
            break;
        case 'star':
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 5,
                    radius2: shapeOpts.radius / 2.5,
                    angle: 0
                })
            });
            break;
        case 'shape://plus':
        case 'cross':
            // openlayers does not seem to set a default stroke color,
            // which is needed for regularshapes with radius2 = 0
            if (shapeOpts.stroke === undefined) {
                shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                    color: '#000'
                });
            }
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 4,
                    radius2: 0,
                    angle: 0
                })
            });
            break;
        case 'shape://times':
        case 'x':
            // openlayers does not seem to set a default stroke color,
            // which is needed for regularshapes with radius2 = 0
            if (shapeOpts.stroke === undefined) {
                shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                    color: '#000'
                });
            }
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 4,
                    radius2: 0,
                    angle: 45 * Math.PI / 180
                })
            });
            break;
        case 'shape://backslash':
            // openlayers does not seem to set a default stroke color,
            // which is needed for regularshapes with radius2 = 0
            if (shapeOpts.stroke === undefined) {
                shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                    color: '#000'
                });
            }
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 2,
                    angle: 2 * Math.PI - (Math.PI / 4)
                })
            });
            break;
        case 'shape://horline':
            // openlayers does not seem to set a default stroke color,
            // which is needed for regularshapes with radius2 = 0
            if (shapeOpts.stroke === undefined) {
                shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                    color: '#000'
                });
            }
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 2,
                    angle: Math.PI / 2
                })
            });
            break;
        // so far, both arrows are closed arrows. Also, shape is a regular triangle with
        // all sides of equal length. In geoserver arrows only have two sides of equal length.
        // TODO redefine shapes of arrows?
        case 'shape://oarrow':
        case 'shape://carrow':
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 3,
                    angle: Math.PI / 2
                })
            });
            break;
        case 'shape://slash':
            // openlayers does not seem to set a default stroke color,
            // which is needed for regularshapes with radius2 = 0
            if (shapeOpts.stroke === undefined) {
                shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                    color: '#000'
                });
            }
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 2,
                    angle: Math.PI / 4
                })
            });
            break;
        case 'shape://vertline':
            // openlayers does not seem to set a default stroke color,
            // which is needed for regularshapes with radius2 = 0
            if (shapeOpts.stroke === undefined) {
                shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                    color: '#000'
                });
            }
            olStyle = new this.OlStyleConstructor({
                image: new this.OlStyleRegularshapeConstructor({
                    ...shapeOpts,
                    points: 2,
                    angle: 0
                })
            });
            break;
        default:
            if (getIsFontGlyphBased(markSymbolizer)) {
                olStyle = new this.OlStyleConstructor({
                    text: new this.OlStyleTextConstructor({
                        text: getCharacterForMarkSymbolizer(markSymbolizer),
                        font: getTextFontForMarkSymbolizer(markSymbolizer),
                        fill: shapeOpts.fill,
                        stroke: shapeOpts.stroke,
                        rotation: shapeOpts.rotation
                    })
                });
                break;
            }
            throw new Error('MarkSymbolizer cannot be parsed. Unsupported WellKnownName.');
        }

        if (Number.isFinite(opacity) && olStyle.getImage()) {
            olStyle.getImage().setOpacity(opacity);
        }

        if (geometry) {
            olStyle.setGeometry(geometry);
        }
        return olStyle;
    }

    /**
     * Get the OL Style object  from an GeoStyler-Style IconSymbolizer.
     *
     * @param symbolizer  A GeoStyler-Style IconSymbolizer.
     * @return The OL Style object
     */
    getOlIconSymbolizerFromIconSymbolizer(
        symbolizer,
        feat
    ) {
        for (const key of Object.keys(symbolizer)) {
            if (isGeoStylerFunction(symbolizer[key])) {
                symbolizer[key] = expressionsUtils.evaluateFunction(symbolizer[key], feat);
            }
        }
        const geometryFunc = getGeometryFunction(symbolizer, feat, this._getMap());
        const baseProps = {
            src: symbolizer.image,
            crossOrigin: 'anonymous',
            opacity: symbolizer.opacity,
            scale: this._computeIconScaleBasedOnSymbolizer(symbolizer),
            // Rotation in openlayers is radians while we use degree
            rotation: (typeof (symbolizer.rotate) === 'number' ? symbolizer.rotate * Math.PI / 180 : undefined),
            displacement: symbolizer.offset,
            anchor: symbolizer.anchor

        };
        // check if IconSymbolizer.image contains a placeholder
        const prefix = '\\{\\{';
        const suffix = '\\}\\}';
        const regExp = new RegExp(prefix + '.*?' + suffix, 'g');
        const regExpRes = typeof (symbolizer.image) === 'string' ? symbolizer.image.match(regExp) : null;
        if (regExpRes) {
            // if it contains a placeholder
            // return olStyleFunction
            const olPointStyledIconFn = (feature) => {
                let src = resolveAttributeTemplate(feature, symbolizer.image, '');
                // src can't be blank, would trigger ol errors
                if (!src) {
                    src = symbolizer.image + '';
                }
                let image;
                if (this.olIconStyleCache[src]) {
                    image = this.olIconStyleCache[src];
                    if (baseProps.rotation !== undefined) {
                        image.setRotation(baseProps.rotation);
                    }
                    if (baseProps.opacity !== undefined) {
                        image.setOpacity(baseProps.opacity);
                    }
                } else {
                    image = new this.OlStyleIconConstructor({
                        ...baseProps,
                        src // order is important
                    });
                    this.olIconStyleCache[src] = image;
                }
                const style = new this.OlStyleConstructor({
                    image,
                    ...geometryFunc
                });
                return style;
            };
            return olPointStyledIconFn;
        }

        return new this.OlStyleConstructor({
            image: new this.OlStyleIconConstructor({
                ...baseProps
            }),
            ...geometryFunc
        });
    }

    /**
     * Get the OL Style object from an GeoStyler-Style LineSymbolizer.
     *
     * @param symbolizer A GeoStyler-Style LineSymbolizer.
     * @return The OL Style object
     */
    getOlLineSymbolizerFromLineSymbolizer(symbolizer, feat) {
        for (const key of Object.keys(symbolizer)) {
            if (isGeoStylerFunction(symbolizer[key])) {
                symbolizer[key] = expressionsUtils.evaluateFunction(symbolizer[key], feat);
            }
        }
        const color = symbolizer.color;
        const opacity = symbolizer.opacity;
        const sColor = (color && opacity !== null && opacity !== undefined) ?
            getRgbaColor(color, opacity) : color;

        const geometryFunc = getGeometryFunction(symbolizer, feat, this._getMap());

        return new this.OlStyleConstructor({
            ...geometryFunc,
            stroke: new this.OlStyleStrokeConstructor({
                color: sColor,
                width: symbolizer.width,
                lineCap: symbolizer.cap,
                lineJoin: symbolizer.join,
                lineDash: symbolizer.dasharray,
                lineDashOffset: symbolizer.dashOffset
            })
        });
    }

    /**
     * Get the OL Style object from an GeoStyler-Style FillSymbolizer.
     *
     * @param symbolizer A GeoStyler-Style FillSymbolizer.
     * @return The OL Style object
     */
    getOlPolygonSymbolizerFromFillSymbolizer(symbolizer, feat) {
        for (const key of Object.keys(symbolizer)) {
            if (isGeoStylerFunction(symbolizer[key])) {
                symbolizer[key] = expressionsUtils.evaluateFunction(symbolizer[key], feat);
            }
        }

        const color = symbolizer.color;
        // fillOpacity is needed for legacy support
        const opacity = symbolizer.fillOpacity ?? symbolizer.opacity;
        const fColor = color && Number.isFinite(opacity)
            ? getRgbaColor(color, opacity)
            : color;

        let fill = color
            ? new this.OlStyleFillConstructor({ color: fColor })
            : undefined;

        const outlineColor = symbolizer.outlineColor;
        const outlineOpacity = symbolizer.outlineOpacity;
        const oColor = (outlineColor && Number.isFinite(outlineOpacity))
            ? getRgbaColor(outlineColor, outlineOpacity)
            : outlineColor;

        const stroke = outlineColor || symbolizer.outlineWidth ? new this.OlStyleStrokeConstructor({
            color: oColor,
            width: symbolizer.outlineWidth,
            lineDash: symbolizer.outlineDasharray
        }) : undefined;

        const olStyle = new this.OlStyleConstructor({
            fill,
            stroke
        });

        if (symbolizer.graphicFill) {
            const pattern = this.getOlPatternFromGraphicFill(symbolizer.graphicFill);
            if (!fill) {
                fill = new this.OlStyleFillConstructor({});
            }
            if (pattern) {
                fill.setColor(pattern);
            }
            olStyle.setFill(fill);
        }

        return olStyle;
    }

    /**
     * Get the pattern for a graphicFill.
     *
     * This creates a CanvasPattern based on the
     * properties of the given PointSymbolizer. Currently,
     * only IconSymbolizer and MarkSymbolizer are supported.
     *
     * @param graphicFill The Symbolizer that holds the pattern config.
     * @returns The created CanvasPattern, or null.
     */
    getOlPatternFromGraphicFill(graphicFill) {
        let graphicFillStyle;
        if (graphicFill?.kind === 'Icon') {
            graphicFillStyle = this.getOlIconSymbolizerFromIconSymbolizer(graphicFill);
            const graphicFillImage = graphicFillStyle?.getImage();
            graphicFillImage?.load(); // Needed for Icon type images with a remote src
            // We can only work with the image once it's loaded
            if (graphicFillImage?.getImageState() !== OlImageState.LOADED) {
                return null;
            }
        } else if (graphicFill?.kind === 'Mark' && isString(graphicFill?.wellKnownName)) {
            graphicFillStyle = this.getOlPointSymbolizerFromMarkSymbolizer(graphicFill);
        } else {
            return null;
        }

        // We need to clone the style and image since we'll be changing the scale below (hack)
        const graphicFillStyleCloned = graphicFillStyle.clone();
        const imageCloned = graphicFillStyleCloned.getImage();

        // Temporary canvas.
        // TODO: Can/should we reuse an pre-existing one for efficiency?
        const tmpCanvas = document.createElement('canvas');
        const tmpContext = tmpCanvas.getContext('2d');

        // Hack to make scaling work for Icons.
        // TODO: find a better way than this.
        const scale = imageCloned.getScale() || 1;
        const pixelRatio = scale;
        imageCloned.setScale(1);

        const size = imageCloned.getSize();

        // Create the context where we'll be drawing the style on
        const vectorContext = toContext(tmpContext, {
            pixelRatio,
            size
        });

        // Draw the graphic
        vectorContext.setStyle(graphicFillStyleCloned);
        const pointCoords = size.map(item => item / 2);
        vectorContext.drawGeometry(new OlGeomPoint(pointCoords));

        // Create the actual pattern and return style
        return tmpContext.createPattern(tmpCanvas, 'repeat');
    }

    /**
     * Get the OL StyleFunction object from an GeoStyler-Style TextSymbolizer.
     *
     * @param {TextSymbolizer} textSymbolizer A GeoStyler-Style TextSymbolizer.
     * @return {object} The OL StyleFunction
     */
    getOlTextSymbolizerFromTextSymbolizer(
        symbolizer,
        feat
    ) {
        for (const key of Object.keys(symbolizer)) {
            if (isGeoStylerFunction(symbolizer[key])) {
                symbolizer[key] = expressionsUtils.evaluateFunction(symbolizer[key], feat);
            }
        }
        const geometryFunc = getGeometryFunction(symbolizer, feat, this._getMap());
        const color = symbolizer.color;
        const opacity = symbolizer.opacity;
        const fColor = color && Number.isFinite(opacity)
            ? getRgbaColor(color, opacity)
            : color;

        const haloColor = symbolizer.haloColor;
        const haloWidth = symbolizer.haloWidth;
        const sColor = haloColor && Number.isFinite(opacity)
            ? getRgbaColor(haloColor, opacity)
            : haloColor;
        const fontWeight = symbolizer.fontWeight ?? 'normal';
        const fontStyle = symbolizer.fontStyle ?? 'normal';
        const size = symbolizer.size;
        const font = symbolizer.font;
        const baseProps = {
            font: fontWeight + ' ' + fontStyle + ' ' + size + 'px ' + font?.join(', '),
            fill: new this.OlStyleFillConstructor({
                color: fColor
            }),
            stroke: new this.OlStyleStrokeConstructor({
                color: sColor,
                width: haloWidth ? haloWidth : 0
            }),
            overflow: symbolizer.allowOverlap,
            offsetX: (symbolizer.offset ? symbolizer.offset[0] : 0),
            offsetY: (symbolizer.offset ? symbolizer.offset[1] : 0),
            rotation: typeof (symbolizer.rotate) === 'number' ? symbolizer.rotate * Math.PI / 180 : undefined
            // TODO check why props match
            // textAlign: symbolizer.pitchAlignment,
            // textBaseline: symbolizer.anchor
        };

        // check if TextSymbolizer.label contains a placeholder
        const prefix = '\\{\\{';
        const suffix = '\\}\\}';
        const regExp = new RegExp(prefix + '.*?' + suffix, 'g');
        let regExpRes;
        if (!isGeoStylerStringFunction(symbolizer.label)) {
            regExpRes = symbolizer.label ? symbolizer.label.match(regExp) : null;
        }
        if (regExpRes) {
            // if it contains a placeholder
            // return olStyleFunction
            const olPointStyledLabelFn = (feature) => {

                const text = new this.OlStyleTextConstructor({
                    text: resolveAttributeTemplate(feature, symbolizer.label, ''),
                    ...baseProps
                });

                const style = new this.OlStyleConstructor({
                    ...geometryFunc,
                    text: text
                });

                return style;
            };
            return olPointStyledLabelFn;
        }
        // if TextSymbolizer does not contain a placeholder
        // return OlStyle
        return new this.OlStyleConstructor({
            ...geometryFunc,
            text: new this.OlStyleTextConstructor({
                text: symbolizer.label,
                ...baseProps
            })
        });
    }

}

export default OlStyleParser;
