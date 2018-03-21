/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const uuidv1 = require('uuid/v1');
const LocaleUtils = require('./LocaleUtils');
const {extraMarkers} = require('./MarkerUtils');
const {values} = require('lodash');


const STYLE_CIRCLE = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2,
    radius: 10
};
const STYLE_POINT = {
    iconGlyph: 'comment',
    iconShape: 'square',
    iconColor: 'blue'
};
const STYLE_TEXT = {
    fontStyle: 'normal',
    fontSize: '14',
    fontSizeUom: 'px',
    fontFamily: 'FontAwesome',
    fontWeight: 'normal',
    font: "14px FontAwesome",
    textAlign: 'center',
    color: '#000000',
    opacity: 1
};
const STYLE_LINE = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2,
    editing: {
        fill: 1
    }
};
const STYLE_POLYGON = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2,
    editing: {
        fill: 1
    }
};
const DEFAULT_ANNOTATIONS_STYLES = {
    "Text": STYLE_TEXT,
    "Point": STYLE_POINT,
    "Circle": STYLE_CIRCLE,
    "MultiPoint": STYLE_POINT,
    "LineString": STYLE_LINE,
    "MultiLineString": STYLE_LINE,
    "Polygon": STYLE_POLYGON,
    "MultiPolygon": STYLE_POLYGON
};

const rgbaTorgb = (rgba = "") => {
    return rgba.indexOf("rgba") !== -1 ? `rgb${rgba.slice(rgba.indexOf("("), rgba.lastIndexOf(","))})` : rgba;
};

const textAlignTolabelAlign = (a) => (a === "start" && "lm") || (a === "end" && "rm") || "cm";

const getStylesObject = ({type = "Point", geometries = []} = {}) => {
    return type === "GeometryCollection" ? geometries.reduce((p, {type: t}) => {
        p[t] = DEFAULT_ANNOTATIONS_STYLES[t];
        return p;
    }, {type: "GeometryCollection"}) : {...DEFAULT_ANNOTATIONS_STYLES[type]};
};

const getPropreties = (props = {}, messages = {}) => ({title: LocaleUtils.getMessageById(messages, "annotations.defaulttitle") || "Default title", id: uuidv1(), ...props});

const annStyleToOlStyle = (type, style, label = "") => {
    const s = style[type] || style;
    switch (type) {
        case "MultiPolygon":
        case "Polygon":
        case "Circle":
            return {
                "strokeColor": rgbaTorgb(s.color),
                "strokeOpacity": s.opacity,
                "strokeWidth": s.weight,
                "fillColor": rgbaTorgb(s.fillColor),
                "fillOpacity": s.fillOpacity
            };
        case "LineString":
        case "MultiLineString":
            return {
                "strokeColor": rgbaTorgb(s.color),
                "strokeOpacity": s.opacity,
                "strokeWidth": s.weight
            };
        case "Text":
            return {
                "fontStyle": s.fontStyle,
                "fontSize": s.fontSize,   // in mapfish is in px
                "fontFamily": s.fontFamily,
                "fontWeight": s.fontWeight,
                "labelAlign": textAlignTolabelAlign(s.textAlign),
                "fontColor": rgbaTorgb(s.color),
                "fontOpacity": s.opacity,
                "label": label,
                "fill": false,
                "stroke": false
            };
        case "Point":
        case "MultiPoint": {
            const externalGraphic = extraMarkers.markerToDataUrl(s);
            return externalGraphic ? {
                    externalGraphic: externalGraphic,
                    "graphicWidth": 36,
                    "graphicHeight": 46,
                    "graphicXOffset": -18,
                    "graphicYOffset": -46
                } : {
                    "fillColor": "#0000AE",
                    "fillOpacity": 0.5,
                    "strokeColor": "#0000FF",
                    "pointRadius": 10,
                    "strokeOpacity": 1,
                    "strokeWidth": 1
            };
        }
        default:
            return {
                "fillColor": "#FF0000",
                "fillOpacity": 0,
                "strokeColor": "#FF0000",
                "pointRadius": 5,
                "strokeOpacity": 1,
                "strokeWidth": 1
            };
    }
};

const AnnotationsUtils = {
    /**
     * function used to convert a geojson into a internal model.
     * if it finds some textValues in the properties it will return this as Text
     * otherwise it will return the original geometry type.
     * @return {object} a transformed geojson with only geometry types
    */
    convertGeoJSONToInternalModel: ({type = "Point", geometries = []}, textValues = [], circles = []) => {
        switch (type) {
            case "Point": case "MultiPoint": {
                return {type: textValues.length === 1 ? "Text" : type};
            }
            case "Polygon": {
                return {type: circles.length === 1 ? "Circle" : type};
            }
            case "GeometryCollection": {
                const onlyPoints = geometries.filter(g => g.type === "Point" || g.type === "MultiPoint");
                const onlyMultiPolygons = geometries.filter(g => g.type === "Polygon");
                let t = 0;
                let p = 0;
                return {type: "GeometryCollection", geometries: geometries.map(g => {
                    if (g.type === "Point" || g.type === "MultiPoint") {
                        if (onlyPoints.length === textValues.length) {
                            return {type: "Text"};
                        }
                        if (textValues.length === 0) {
                            return {type: g.type};
                        }
                        if (t === 0) {
                            t++;
                            return {type: "Text" };
                        }
                    }
                    if (g.type === "Polygon") {
                        if (onlyMultiPolygons.length === circles.length) {
                            return {type: "Circle"};
                        }
                        if (circles.length === 0) {
                            return {type: g.type};
                        }
                        if (p === 0) {
                            p++;
                            return {type: "Circle" };
                        }
                    }
                    return {type: g.type};
                })};
            }
            default: return {type};
        }
    },
    /**
     * Retrieves a non duplicated list of stylers
     * @return {string[]} it returns the array of available styler from geometry of a feature
    */
    getAvailableStyler: ({type = "Point", geometries = []} = {}) => {
        switch (type) {
            case "Point": case "MultiPoint": {
                return [AnnotationsUtils.getRelativeStyler(type)];
            }
            case "LineString": case "MultiLineString": {
                return [AnnotationsUtils.getRelativeStyler(type)];
            }
            case "Polygon": case "MultiPolygon": {
                return [AnnotationsUtils.getRelativeStyler(type)];
            }
            case "Text": {
                return [AnnotationsUtils.getRelativeStyler(type)];
            }
            case "Circle": {
                return [AnnotationsUtils.getRelativeStyler(type)];
            }
            case "GeometryCollection": {
                return geometries.reduce((p, c) => {
                    return (p.indexOf(AnnotationsUtils.getRelativeStyler(c.type)) !== -1) ? p : p.concat(AnnotationsUtils.getAvailableStyler(c));
                }, []);
            }
            default: return [];
        }
    },
    /**
     * it converts a geometryType to a stylertype
     * @return {string} a stylertype
    */
    getRelativeStyler: (type) => {
        switch (type) {
            case "Point": case "MultiPoint": {
                return "marker";
            }
            case "Circle": {
                return "circle";
            }
            case "LineString": case "MultiLineString": {
                return "lineString";
            }
            case "Polygon": case "MultiPolygon": {
                return "polygon";
            }
            case "Text": {
                return "text";
            }
            default: return "";
        }
    },
    /**
     * it converts some props of a CSS-font into a shorhand form
     * @return {string} a CSS-font
    */
    createFont: ({fontSize = "14", fontSizeUom = "px", fontFamily = "FontAwesome", fontStyle = "normal", fontWeight = "normal"} = {}) => {
        return `${fontStyle} ${fontWeight} ${fontSize}${fontSizeUom} ${fontFamily}`;
    },
    /**
     * some defaults for the style
    */
    DEFAULT_ANNOTATIONS_STYLES,
    STYLE_CIRCLE,
    STYLE_POINT,
    STYLE_TEXT,
    STYLE_LINE,
    STYLE_POLYGON,
    /**
    * it converts any geoJSONObject to an annotation
    * Mandatory elemets: MUST be a geoJSON type Feature => properties with an ID and a title
    * annotation style.
    */
    normalizeAnnotation: (ann, messages) => {
        const annotation = ann.type !== "Feature" && {type: "Feature", geometry: ann} || {...ann};
        const style = getStylesObject(annotation.geometry);
        const properties = getPropreties(annotation.properties, messages);
        return {style, properties, ...annotation};
    },
    removeDuplicate: (annotations) => values(annotations.reduce((p, c) => ({...p, [c.properties.id]: c}), {})),
    /**
    * Compress circle in a single MultyPolygon feature with style
    * @param (Object) geometry
    * @param (Object) properties
    * @param (Object) style
    * @return (OBject) feature
    */
    circlesToMultiPolygon: ({geometries}, {circles}, style = STYLE_CIRCLE) => {
        const coordinates = circles.reduce((coords, cIdx) => coords.concat([geometries[cIdx].coordinates]), []);
        return {type: "Feature", geometry: {type: "MultiPolygon", coordinates}, properties: {id: uuidv1(), ms_style: annStyleToOlStyle("Circle", style)}};
    },
    /**
    * Flatten text point to single point with style
    * @param (Object) geometry
    * @param (Object) properties
    * @param (Object) style
    * @return (array) features
    */
    textToPoint: ({geometries}, {textGeometriesIndexes, textValues}, style = STYLE_TEXT) => {
        return textGeometriesIndexes.map((tIdx, cIdx) => {
            return {type: "Feature", geometry: geometries[tIdx], properties: {id: uuidv1(), ms_style: annStyleToOlStyle("Text", style, textValues[cIdx])}};
        });

    },
    /**
    * Flatten geometry collection
    * @param (Object) GeometryCollection An annotation of type geometrycollection
    * @return (array) an array of features
    */
    flattenGeometryCollection: ({geometry, properties, style}) => {
        const circles = properties.circles && AnnotationsUtils.circlesToMultiPolygon(geometry, properties, style.Circle) || [];
        const texts = properties.textGeometriesIndexes && AnnotationsUtils.textToPoint(geometry, properties, style.Text) || [];
        const skeep = (properties.circles || []).concat(properties.textGeometriesIndexes || []);
        const features = geometry.geometries.filter((el, idx) => skeep.indexOf(idx) === -1)
            .map((geom) => ({
                type: "Feature",
                geometry: geom,
                properties: {id: uuidv1(), ms_style: annStyleToOlStyle(geom.type, style[geom.type])}
            }));
        return features.concat(circles, texts);
    },
    /**
    * Adapt annotation features to print pdf
    * @param (Array) features
    * @param (Object) style
    * @return (Array) features
    */
    annotationsToPrint: (features = []) => {
        return features.reduce((coll, f) => {
            return f.geometry.type === "GeometryCollection" && coll.concat(AnnotationsUtils.flattenGeometryCollection(f)) || coll.concat({type: "Feature", geometry: f.geometry, properties: {...f.properties, ms_style: annStyleToOlStyle(f.geometry.type, f.style)}});
        }, []);
    }
};

module.exports = AnnotationsUtils;
