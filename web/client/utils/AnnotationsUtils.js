/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const uuidv1 = require('uuid/v1');
const LocaleUtils = require('./LocaleUtils');
const {values, slice} = require('lodash');
const assign = require('object-assign');
const uuid = require('uuid');

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

const getStylesObject = ({type = "Point", geometries = []} = {}) => {
    return type === "GeometryCollection" ? geometries.reduce((p, {type: t}) => {
        p[t] = DEFAULT_ANNOTATIONS_STYLES[t];
        return p;
    }, {type: "GeometryCollection"}) : {...DEFAULT_ANNOTATIONS_STYLES[type]};
};
const getPropreties = (props = {}, messages = {}) => ({title: LocaleUtils.getMessageById(messages, "annotations.defaulttitle") || "Default title", id: uuidv1(), ...props});

const AnnotationsUtils = {
    /**
     * function used to convert a geojson into a internal model.
     * if it finds some textValues in the properties it will return this as Text
     * otherwise it will return the original geometry type.
     * @return {object} a transformed geojson with only geometry types
    */
    convertGeoJSONToInternalModel: ({type = "Point", geometries = [], features = []}, textValues = [], circles = []) => {
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
            case "FeatureCollection" : {
                const featuresTypes = features.map(f => {
                    if (f.properties && f.properties.isCircle) {
                        return {type: "Circle"};
                    }
                    if (f.properties && f.properties.isText) {
                        return {type: "Text"};
                    }
                    return {type: f.geometry.type};
                });
                return {type: "FeatureCollection", features: featuresTypes};
            }
            default: return {type};
        }
    },
    /**
     * Retrieves a non duplicated list of stylers
     * @return {string[]} it returns the array of available styler from geometry of a feature
    */
    getAvailableStyler: ({type = "Point", geometries = [], features = []} = {}) => {
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
            case "FeatureCollection": {
                return features.reduce((p, c) => {
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
    formatCoordinates: (coords) => {
        return coords.map(c => ({lat: c[1], lon: c[0]}));
    },
    getComponents: ({type, coordinates}) => {
        switch (type) {
            case "Polygon": return AnnotationsUtils.formatCoordinates(slice(coordinates[0], 0, coordinates[0].length - 1));
            case "LineString": return AnnotationsUtils.formatCoordinates(coordinates);
            default: return AnnotationsUtils.formatCoordinates([coordinates]);
        }
    },
    addIds: (features) => {
        return features.map(f => {
            if (f.properties && f.properties.id) {
                return f;
            }
            return assign({}, f, { properties: assign({}, f.properties, {id: uuid.v1()})});
        });
    },
    validateCoords: ({lat, lon}) => !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon)),
    validateCoordsArray: ([lon, lat]) => !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))
};

module.exports = AnnotationsUtils;
