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
const {geometryFunctions, fetchStyle, hashAndStringify} = require('./VectorStyleUtils');
const {set} = require('./ImmutableUtils');
const {values, isNil, slice, head, castArray, last, isArray, findIndex, isString} = require('lodash');
const uuid = require('uuid');
const turfCenter = require('@turf/center').default;
const assign = require('object-assign');


const STYLE_CIRCLE = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2
};
const STYLE_POINT_MARKER = {
    iconGlyph: 'comment',
    iconShape: 'square',
    iconColor: 'blue'
};
const STYLE_POINT_SYMBOL = {
    iconAnchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    color: "#000000",
    fillColor: "#000000",
    opacity: 1,
    size: 64,
    fillOpacity: 1
};
const STYLE_TEXT = {
    fontStyle: 'normal',
    fontSize: '14',
    fontSizeUom: 'px',
    fontFamily: 'Arial',
    fontWeight: 'normal',
    font: "14px Arial",
    textAlign: 'center',
    color: '#000000',
    opacity: 1,
    fillColor: '#000000',
    fillOpacity: 1
};
const STYLE_LINE = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
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
    "Point": STYLE_POINT_MARKER,
    "Circle": STYLE_CIRCLE,
    "MultiPoint": STYLE_POINT_MARKER,
    "LineString": STYLE_LINE,
    "MultiLineString": STYLE_LINE,
    "Polygon": STYLE_POLYGON,
    "MultiPolygon": STYLE_POLYGON
};

const ANNOTATION_TYPE = "ms2-annotations";

/**
 * return two styles object for start and end point.
 * usually added to a LineString
 * @return {object[]} the two styles
*/
const getStartEndPointsForLinestring = () => {
    return [{...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: true, iconAnchor: [0.5, 0.5], type: "Point", title: "StartPoint Style", geometry: "startPoint", filtering: false, id: uuidv1()},
        {...DEFAULT_ANNOTATIONS_STYLES.Point, highlight: true, iconAnchor: [0.5, 0.5], type: "Point", title: "EndPoint Style", geometry: "endPoint", filtering: false, id: uuidv1()}];
};

const rgbaTorgb = (rgba = "") => {
    return rgba.indexOf("rgba") !== -1 ? `rgb${rgba.slice(rgba.indexOf("("), rgba.lastIndexOf(","))})` : rgba;
};

const textAlignTolabelAlign = (a) => (a === "start" && "lm") || (a === "end" && "rm") || "cm";

const getStylesObject = ({type = "Point", features = []} = {}) => {
    return type === "FeatureCollection" ? features.reduce((p, c) => {
        p[c.geometry.type] = DEFAULT_ANNOTATIONS_STYLES[c.geometry.type];
        return p;
    }, {type: "FeatureCollection"}) : {...DEFAULT_ANNOTATIONS_STYLES[type]};
};
const getProperties = (props = {}, messages = {}) => ({title: LocaleUtils.getMessageById(messages, "annotations.defaulttitle") !== "annotations.defaulttitle" ? LocaleUtils.getMessageById(messages, "annotations.defaulttitle") : "Default title", id: uuidv1(), ...props});

const getDashArrayFromStyle = dashArray => {
    return isString(dashArray) && dashArray || isArray(dashArray) && dashArray.join(" ");
};

const hasOutline = (style) => {
    return style.color && style.opacity && style.weight;
};

const annStyleToOlStyle = (type, tempStyle, label = "") => {
    let style = tempStyle && tempStyle[type] ? tempStyle[type] : tempStyle;
    const s = style;
    const dashArray = s.dashArray ? getDashArrayFromStyle(s.dashArray) : "solid";
    switch (type) {
    case "MultiPolygon":
    case "Polygon":
    case "Circle":
        return {
            "strokeColor": rgbaTorgb(s.color),
            "strokeOpacity": s.opacity,
            "strokeWidth": s.weight,
            "fillColor": rgbaTorgb(s.fillColor),
            "fillOpacity": s.fillOpacity,
            "strokeDashstyle": dashArray
        };
    case "LineString":
    case "MultiLineString":
        return {
            "strokeColor": rgbaTorgb(s.color),
            "strokeOpacity": s.opacity,
            "strokeWidth": s.weight,
            "strokeDashstyle": dashArray
        };
    case "Text":
        const outline = hasOutline(s) ? {
            "labelOutlineColor": rgbaTorgb(s.color),
            "labelOutlineOpacity": s.opacity,
            "labelOutlineWidth": s.weight
        } : {};
        return {
            "fontStyle": s.fontStyle,
            "fontSize": s.fontSize,   // in mapfish is in px
            "fontFamily": s.fontFamily,
            "fontWeight": s.fontWeight,
            "labelAlign": textAlignTolabelAlign(s.textAlign),
            "fontColor": rgbaTorgb(s.fillColor),
            "fontOpacity": s.fillOpacity,
            "label": label,
            "stroke": true,
            "strokeColor": rgbaTorgb(s.color),
            "strokeOpacity": s.opacity,
            "strokeWidth": s.weight,
            "strokeDashstyle": dashArray,
            ...outline
        };
    case "Point":
    case "MultiPoint": {
        // TODO TEST THIS
        const externalGraphic = s.symbolUrl && fetchStyle(hashAndStringify(s), "base64") || extraMarkers.markerToDataUrl(s);
        let graphicXOffset = -18;
        let graphicYOffset = -46;
        if (s.iconAnchor && isArray(s.iconAnchor) && s.size) {
            if (s.anchorXUnits === "pixels") {
                graphicXOffset = -1 * s.iconAnchor[0];
            } else {
                graphicXOffset = -1 * s.size * s.iconAnchor[0];
            }
            if (s.anchorYUnits === "pixels") {
                graphicYOffset = -1 * s.iconAnchor[1];
            } else {
                graphicYOffset = -1 * s.size * s.iconAnchor[1];
            }
        }
        return externalGraphic ? {
            "graphicWidth": s.size || 36,
            "graphicHeight": s.size || 46,
            externalGraphic,
            graphicXOffset,
            graphicYOffset,
            "display": s.filtering === false && "none"
        } : {
            "fillColor": "#0000AE",
            "fillOpacity": 0.5,
            "strokeColor": "#0000FF",
            "pointRadius": 10,
            "strokeOpacity": 1,
            "strokeWidth": 1,
            "display": s.filtering === false && "none"
        };
    }
    default:
        return {
            "fillColor": "#FF0000",
            "fillOpacity": 0,
            "strokeColor": "#FF0000",
            "pointRadius": 5,
            "strokeOpacity": 1,
            "strokeDashstyle": dashArray,
            "strokeWidth": 1
        };
    }
};

const AnnotationsUtils = {
    /**
     * The constant for annotation type
     */
    ANNOTATION_TYPE,
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
        case "Symbol": {
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
        case "Symbol": {
            return "symbol";
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
    createFont: ({fontSize = "14", fontSizeUom = "px", fontFamily = "Arial", fontStyle = "normal", fontWeight = "normal"} = {}) => {
        return `${fontStyle} ${fontWeight} ${fontSize}${fontSizeUom} ${fontFamily}`;
    },
    /**
     * some defaults for the style
    */
    DEFAULT_ANNOTATIONS_STYLES,
    STYLE_CIRCLE,
    STYLE_POINT_MARKER,
    STYLE_POINT_SYMBOL,
    STYLE_TEXT,
    STYLE_LINE,
    STYLE_POLYGON,
    /**
     * Converts any feature to a geometry type
     * @param {object} feature
     * @return {string} a geometry type
     */
    getGeometryType: (feature) => {
        if (feature?.properties?.isCircle) {
            return 'Circle';
        }
        if (feature?.properties?.isText) {
            return 'Text';
        }
        return feature?.geometry?.type;
    },
    /**
     * Converts any geometry type to a glyph
     * @param {string} type of geometry
     * @return {object} a glyph name and label
     */
    getGeometryGlyphInfo: (type = 'Point') => {
        const glyphs = {
            Point: {glyph: 'point', label: 'Point'},
            MultiPoint: {glyph: 'point', label: 'Point'},
            LineString: {glyph: 'polyline', label: 'Line'},
            MultiLineString: {glyph: 'polyline', label: 'Line'},
            Polygon: {glyph: 'polygon', label: 'Polygon'},
            MultiPolygon: {glyph: 'polygon', label: 'Polygon'},
            Text: {glyph: 'font', label: 'Text'},
            Circle: {glyph: '1-circle', label: 'Circle'}
        };
        return glyphs[type];
    },
    /**
    * it converts any geoJSONObject to an annotation
    * Mandatory elements: MUST be a geoJSON type Feature => properties with an ID and a title
    * annotation style.
    */
    normalizeAnnotation: (ann = {}, messages = {}) => {
        const annotation = ann.type === "FeatureCollection" ? {...ann} : {type: "Feature", geometry: ann};
        const style = getStylesObject(annotation);
        const properties = getProperties(annotation.properties, messages);
        return {style, properties, ...annotation};
    },
    removeDuplicate: (annotations) => values(annotations.reduce((p, c) => ({...p, [c.properties.id]: c}), {})),
    /**
    * Compress circle in a single MultiPolygon feature with style
    * @param {object} geometry
    * @param {object} properties
    * @param {object} style
    * @return {object} feature
    */
    circlesToMultiPolygon: ({geometries = []}, {circles = []}, style = STYLE_CIRCLE) => {
        const coordinates = circles.reduce((coords, cIdx) => coords.concat([geometries[cIdx].coordinates]), []);
        return {type: "Feature", geometry: {type: "MultiPolygon", coordinates}, properties: {id: uuidv1(), ms_style: annStyleToOlStyle("Circle", style)}};
    },
    /**
    * Transform circle in a single Polygon feature with style
    * @param {object} geometry
    * @param {object} properties
    * @param {object} style
    * @return {object} feature
    */
    fromCircleToPolygon: (geometry, properties, style = STYLE_CIRCLE) => {
        return {type: "Feature", geometry: properties.polygonGeom || geometry, properties: {id: properties.id || uuidv1(), ms_style: annStyleToOlStyle("Circle", style)}};
    },
    /**
    * Transform text point to single point with style
    * @param {object} geometry
    * @param {object} properties
    * @param {object} style
    * @return {object} feature
    */
    fromTextToPoint: (geometry, properties, style = STYLE_TEXT) => {
        return {type: "Feature", geometry, properties: {id: properties.id || uuidv1(), ms_style: annStyleToOlStyle("Text", style, properties.valueText)}};
    },
    /**
    * Transform LineString to geodesic LineString (with more points)
    * @param {object} geometry
    * @param {object} properties
    * @param {object} style
    * @return {object} feature
    */
    fromLineStringToGeodesicLineString: (properties, style = STYLE_LINE) => {
        return {type: "Feature", geometry: properties.geometryGeodesic, properties: {id: properties.id || uuidv1(), ms_style: annStyleToOlStyle(properties.geometryGeodesic.type, style)}};
    },
    /**
    * Flatten text point to single point with style
    * @param {object} geometry
    * @param {object} properties
    * @param {object} style
    * @return {object[]} features
    */
    textToPoint: ({geometries = []}, {textGeometriesIndexes = [], textValues = []}, style = STYLE_TEXT) => {
        return textGeometriesIndexes.map((tIdx, cIdx) => {
            return {type: "Feature", geometry: geometries[tIdx], properties: {id: uuidv1(), ms_style: annStyleToOlStyle("Text", style, textValues[cIdx])}};
        });

    },
    /**
    * Flatten geometry collection
    * @param {object} GeometryCollection An annotation of type geometrycollection
    * @return {object[]} an array of features
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
    // for the moment is used with ol functions
    createGeometryFromGeomFunction: (ft) => {
        let type = geometryFunctions[ft.style.geometry] && geometryFunctions[ft.style.geometry].type || ft.geometry.type;
        let coordinates = ft.geometry.coordinates || [];
        switch (ft.style.geometry ) {
        case "startPoint": coordinates = head(coordinates); break;
        case "endPoint": coordinates = last(coordinates); break;
        case "centerPoint": coordinates = turfCenter(ft).geometry.coordinates; break;
        default: break;
        }
        return {type, coordinates};
    },
    /**
    * transform an annotation Feature into a simple geojson feature
    * @param {object} feature coming from a ftcoll
    * @return {object} a transformed feature
    */
    fromAnnotationToGeoJson: ({geometry: ftGeom, properties = {}, style = {}} = {}) => {
        let geometry = style.geometry ? AnnotationsUtils.createGeometryFromGeomFunction({geometry: ftGeom, properties, style, type: "Feature"}) : ftGeom;
        if (properties.isCircle && geometry.type === "Polygon") {
            return AnnotationsUtils.fromCircleToPolygon(geometry, properties, style);
        }
        if (properties.isText) {
            return AnnotationsUtils.fromTextToPoint(geometry, properties, style);
        }
        if (geometry.type === "LineString" && properties.useGeodesicLines && style.filtering) {
            return AnnotationsUtils.fromLineStringToGeodesicLineString(properties, style);
        }
        return {
            type: "Feature",
            geometry,
            properties: {id: properties.id || uuidv1(), ms_style: annStyleToOlStyle(geometry.type, style)}
        };
    },
    /**
    * Adapt annotation features to print pdf
    * @param {object[]} features
    * @param {object} style
    * @return {object[]} features
    */
    annotationsToPrint: (features = []) => {
        return features.reduce((coll, f) => {
            if (f.type === "FeatureCollection") {
                // takes the style from the feature coll if it is missing from the feature
                return coll.concat(f.features.map(ft => {
                    return castArray(ft.style || f.style || {}).filter(s => isNil(s.filtering) ? true : s.filtering).map(style => AnnotationsUtils.fromAnnotationToGeoJson({...ft, style}));
                }).reduce((p, c) => p.concat(c), []));
            }
            return f.geometry && f.geometry.type === "GeometryCollection" ? coll.concat(AnnotationsUtils.flattenGeometryCollection(f))
                : coll.concat({type: "Feature", geometry: f.geometry, properties: {...f.properties, ms_style: annStyleToOlStyle(f.geometry.type, f.style)}});
        }, []);
    },
    formatCoordinates: (coords = [[]]) => {
        return coords.map(c => ({lat: c && c[1], lon: c && c[0]}));
    },
    getBaseCoord: (type) => {
        switch (type) {
        case "Polygon": case "LineString": case "MultiPoint": return [];
        default: return [[{lat: "", lon: ""}]];
        }
    },
    getComponents: ({type, coordinates}) => {
        switch (type) {
        case "Polygon": {
            return AnnotationsUtils.isCompletePolygon(coordinates) ? AnnotationsUtils.formatCoordinates(slice(coordinates[0], 0, coordinates[0].length - 1)) : AnnotationsUtils.formatCoordinates(coordinates[0]);
        }
        case "LineString": case "MultiPoint": {
            return AnnotationsUtils.formatCoordinates(coordinates);
        }
        default: return AnnotationsUtils.formatCoordinates([coordinates]);
        }
    },
    addIds: (features) => {
        return features.map(f => {
            if (f.properties && f.properties.id) {
                return f;
            }
            return set("properties.id", uuid.v1(), f);
        });
    },
    COMPONENTS_VALIDATION: {
        "Point": {min: 1, add: false, remove: false, validation: "validateCoordinates", notValid: "Add a valid coordinate to complete the Point"},
        "MultiPoint": {min: 2, add: true, remove: true, validation: "validateCoordinates", notValid: "Add 2 valid coordinates to complete the Polyline"},
        "Polygon": {min: 3, add: true, remove: true, validation: "validateCoordinates", notValid: "Add 3 valid coordinates to complete the Polygon"},
        "LineString": {min: 2, add: true, remove: true, validation: "validateCoordinates", notValid: "Add 2 valid coordinates to complete the Polyline"},
        "Circle": {add: false, remove: false, validation: "validateCircle", notValid: "Add a valid coordinate and a radius (m) to complete the Circle"},
        "Text": {add: false, remove: false, validation: "validateText", notValid: "Add a valid coordinate and a Text value"}
    },
    validateCoords: ({lat, lon} = {}) => !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon)),
    validateCoordsArray: ([lon, lat] = []) => !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon)),
    validateCoord: (c) => !isNaN(parseFloat(c)),
    coordToArray: (c = {}) => [c.lon, c.lat],
    validateCoordinates: ({components = [], remove = false, type } = {}) => {
        if (components && components.length) {
            const validComponents = components.filter(AnnotationsUtils.validateCoords);

            if (remove) {
                return validComponents.length > AnnotationsUtils.COMPONENTS_VALIDATION[type].min && validComponents.length === components.length;
            }
            return validComponents.length >= AnnotationsUtils.COMPONENTS_VALIDATION[type].min && validComponents.length === components.length;
        }
        return false;
    },
    validateCircle: ({components = [], properties = {radius: 0}} = {}) => {
        if (components && components.length) {
            const cmp = head(components);
            return !isNaN(parseFloat(properties.radius)) && AnnotationsUtils.validateCoords(cmp);
        }
        return false;
    },
    validateText: ({components = [], properties = {valueText: ""}} = {}) => {
        if (components && components.length) {
            const cmp = head(components);
            return properties && !!properties.valueText && AnnotationsUtils.validateCoords(cmp);
        }
        return false;
    },
    validateFeature: ({components = [[]], type, remove = false, properties = {}} = {}) => {
        if (isNil(type)) {
            return false;
        }
        if (type === "Text") {
            return AnnotationsUtils.validateText({components, properties});
        }
        if (type === "Circle") {
            return AnnotationsUtils.validateCircle({components, properties});
        }
        return AnnotationsUtils.validateCoordinates({components, remove, type});
    },
    updateAllStyles: (ftColl = {}, newStyle = {}) => {
        if (ftColl.features && ftColl.features.length) {
            return {
                ...ftColl,
                features: ftColl.features.map(f => assign({}, f, {
                    style: castArray(f.style).map(s => assign({}, s, newStyle))}
                ))};
        }
        return ftColl;
    },
    getStartEndPointsForLinestring,
    DEFAULT_SHAPE: "triangle",
    DEFAULT_PATH: "product/assets/symbols/",
    checkSymbolsError: (symbolErrors, error = "loading_symbols_path") => {
        return symbolErrors.length && findIndex(symbolErrors, (s) => s === error) !== -1;
    },
    isAMissingSymbol: (style) => {
        return style.symbolUrlCustomized === require('../product/assets/symbols/symbolMissing.svg');
    },
    /**
     * it tells if the filtered list of the coordinates is a geojson polygon,
     * with the first point = to the last
     * @param {number[[[]]]} coords the coordinates of the polygon
     * @return {boolean} true if it is a valid polygon, false otherwise
    */
    isCompletePolygon: (coords = [[[]]]) => {
        const validCoords = coords[0].filter(AnnotationsUtils.validateCoordsArray);
        return validCoords.length > 3 && head(validCoords)[0] === last(validCoords)[0] && head(validCoords)[1] === last(validCoords)[1];
    },
    getDashArrayFromStyle,
    /**
     * utility to check if the GeoJSON has the annotation model structure i.e. {"type": "ms2-annotations", "features": [list of FeatureCollection]}
     * or the imported annotation object's name is of "Annotations"
     * @param {object} json GeoJSON/plain object
     * @returns {boolean} if the GeoJSON passes is a ms2-annotation or if the name property of the object passed is Annotations
     */
    isAnnotation: (json) => json?.type === ANNOTATION_TYPE || json?.name === "Annotations"
};

module.exports = AnnotationsUtils;
