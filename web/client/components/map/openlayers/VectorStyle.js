/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const ol = require('openlayers');
const {isNil, trim, isString, isArray, castArray, head, last, find, isObject} = require('lodash');
const {colorToRgbaStr} = require('../../../utils/ColorUtils');
const {reproject, transformLineToArcs} = require('../../../utils/CoordinatesUtils');
const Icons = require('../../../utils/openlayers/Icons');
const {
    isMarkerStyle, isTextStyle, isStrokeStyle, isFillStyle, isCircleStyle, isSymbolStyle,
    registerGeometryFunctions, geometryFunctions
} = require('../../../utils/VectorStyleUtils');
const selectedStyle = {
    white: [255, 255, 255, 1],
    blue: [0, 153, 255, 1],
    width: 3
};
/**
 * converts a style object into an ol.Style
 * @param {object} style to convert
 * @param {object} ol.Stroke object
 * @param {object} ol.Fill object
 * @return if a circle style is passed then return it available for ol.style.Image
*/
const getCircleStyle = (style = {}, stroke = null, fill = null) => {
    return isCircleStyle(style) ? new ol.style.Circle({
        stroke,
        fill,
        radius: style.radius || 5
    }) : null;
};
/**
 * converts a style object into an array of ol.Style. It uses the Icons library
 * if specified or the standard one if not.
 * @param {object} style to convert
 * @return array of ol.Style
*/
const getMarkerStyle = (style) => {
    if (isMarkerStyle(style)) {
        if (style.iconUrl) {
            return Icons.standard.getIcon({style});
        }
        const iconLibrary = style.iconLibrary || 'extra';
        if (Icons[iconLibrary]) {
            return Icons[iconLibrary].getIcon({style});
        }
    }
    return null;
};
/**
 * converts a style object
 * @param {object} style to convert
 * @return an ol.style.Stroke style
*/
const getStrokeStyle = (style = {}) => {
    return isStrokeStyle(style) ? new ol.style.Stroke(style.stroke && isObject(style.stroke) ? style.stroke : { // not sure about this ternary expr
        color: style.highlight ? selectedStyle.blue : colorToRgbaStr(style.color || style.stroke || "#0000FF", isNil(style.opacity) ? 1 : style.opacity),
        width: isNil(style.weight) ? 1 : style.weight,
        lineDash: isString(style.dashArray) && trim(style.dashArray).split(' ') || isArray(style.dashArray) && style.dashArray || [0],
        lineCap: style.lineCap || 'round',
        lineJoin: style.lineJoin || 'round',
        lineDashOffset: style.dashOffset || 0
    }) : null;
};

/**
 * converts a style object
 * @param {object} style to convert
 * @return an ol.style.Fill style
*/
const getFillStyle = (style = {}) => {
    return isFillStyle(style) ? new ol.style.Fill(style.fill && isObject(style.fill) ? style.fill : { // not sure about this ternary expr
        color: colorToRgbaStr(style.fillColor || "#0000FF", isNil(style.fillOpacity) ? 1 : style.fillOpacity)
    }) : null;
};

/**
 * converts a style object
 * @param {object} style to convert
 * @param {object} stroke ol.style.Stroke ready to use
 * @param {object} fill ol.style.Fill ready to use
 * @return an ol.style.Text style
*/
const getTextStyle = (style = {}, stroke = null, fill = null, feature) => {
    return isTextStyle(style) ? new ol.style.Text({
        fill,
        offsetY: style.offsetY || -( 4 * Math.sqrt(style.fontSize)), // TODO improve this for high font values > 100px
        textAlign: style.textAlign || "center",
        text: style.label || feature && feature.properties && feature.properties.valueText || "New",
        font: style.font || "Arial",
        // halo
        stroke: style.highlight ? new ol.style.Stroke({
            color: [255, 255, 255, 1],
            width: 2
        }) : stroke,
        // this should be another rule for the small circle
        image: style.highlight ?
            new ol.style.Circle({
                radius: 5,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: colorToRgbaStr(style.color || "#0000FF", style.opacity || 1),
                    width: style.weight || 1
                })
            }) : null
    }) : null;
};


/**
 * it creates a custom style for the first point of a polyline
 * @param {object} options possible configuration of start point
 * @param {number} options.radius radius of the circle
 * @param {string} options.fillColor ol color for the circle fill style
 * @param {boolean} options.applyToPolygon tells if this style can be applied to a polygon
 * @return {ol.style.Style} style of the point
*/
const firstPointOfPolylineStyle = ({radius = 5, fillColor = 'green', applyToPolygon = false} = {}) => new ol.style.Style({
    image: new ol.style.Circle({
        radius,
        fill: new ol.style.Fill({
            color: fillColor
        })
    }),
    geometry: function(feature) {
        const geom = feature.getGeometry();
        const type = geom.getType();
        if (!applyToPolygon && type === "Polygon") {
            return null;
        }
        let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
        return coordinates.length > 1 ? new ol.geom.Point(head(coordinates)) : null;
    }
});

/**
 * it creates a custom style for the last point of a polyline
 * @param {object} options possible configuration of start point
 * @param {number} options.radius radius of the circle
 * @param {string} options.fillColor ol color for the circle fill style
 * @param {boolean} options.applyToPolygon tells if this style can be applied to a polygon
 * @return {ol.style.Style} style of the point
*/
const lastPointOfPolylineStyle = ({radius = 5, fillColor = 'red', applyToPolygon = false} = {}) => new ol.style.Style({
    image: new ol.style.Circle({
        radius,
        fill: new ol.style.Fill({
            color: fillColor
        })
    }),
    geometry: function(feature) {
        const geom = feature.getGeometry();
        const type = geom.getType();
        if (!applyToPolygon && type === "Polygon") {
            return null;
        }
        let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
        return new ol.geom.Point(coordinates.length > 3 ? coordinates[coordinates.length - (type === "Polygon" ? 2 : 1)] : last(coordinates));
    }
});

/**
    creates styles to highlight/customize start and end point of a polyline
*/
const addDefaultStartEndPoints = (styles = [], startPointOptions = {radius: 3, fillColor: "green", applyToPolygon: true}, endPointOptions = {radius: 3, fillColor: "red", applyToPolygon: true}) => {
    let points = [];
    if (!find(styles, s => s.geometry === "startPoint" && s.filtering)) {
        points.push(firstPointOfPolylineStyle({...startPointOptions}));
    }
    if (!find(styles, s => s.geometry === "endPoint" && s.filtering)) {
        points.push(lastPointOfPolylineStyle({...endPointOptions}));
    }
    return points;
};

const centerPoint = (feature) => {
    const geometry = feature.getGeometry();
    const extent = geometry.getExtent();
    let center = geometry.getCenter && geometry.getCenter() || [extent[2] - extent[0], extent[3] - extent[1]];
    return new ol.geom.Point(center);
};
const lineToArc = (feature) => {
    const type = feature.getGeometry().getType();
    if (type === "LineString" || type === "MultiPoint") {
        let coordinates = feature.getGeometry().getCoordinates();
        coordinates = transformLineToArcs(coordinates.map(c => {
            const point = reproject(c, "EPSG:3857", "EPSG:4326");
            return [point.x, point .y];
        }));
        return new ol.geom.LineString(coordinates.map(c => {
            const point = reproject(c, "EPSG:4326", "EPSG:3857");
            return [point.x, point .y];
        }));
    }
    return feature.getGeometry();
};
const startPoint = (feature) => {
    const geom = feature.getGeometry();
    const type = geom.getType();
    let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
    return coordinates.length > 1 ? new ol.geom.Point(head(coordinates)) : null;
};
const endPoint = (feature) => {
    const geom = feature.getGeometry();
    const type = geom.getType();

    let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
    return new ol.geom.Point(coordinates.length > 3 ? coordinates[coordinates.length - (type === "Polygon" ? 2 : 1)] : last(coordinates));
};

registerGeometryFunctions("centerPoint", centerPoint, "Point");
registerGeometryFunctions("lineToArc", lineToArc, "LineString");
registerGeometryFunctions("startPoint", startPoint, "Point");
registerGeometryFunctions("endPoint", endPoint, "Point");

/**
    if a geom expression is present then return the corresponding function
*/
const getGeometryTrasformation = (style = {}) => {
    return style.geometry ?
    // then parse the geom_expression and return true or false
    (feature) => {
        const geomFunction = style.geometry || "centerPoint";
        return geometryFunctions[geomFunction].func(feature);
    } : (f) => f.getGeometry();
};

const getFilter = (style = {}) => {
    return !isNil(style.filtering) ?
    // then parse the filter_expression and return true or false
    style.filtering : true; // if no filter is defined, it returns true
};


const parseStyleToOl = (feature = {properties: {}}, style = {}, tempStyles = []) => {
    const filtering = getFilter(style, feature);
    if (filtering) {
        const stroke = getStrokeStyle(style);
        const fill = getFillStyle(style);
        const image = getCircleStyle(style, stroke, fill);

        if (isMarkerStyle(style)) {
            return getMarkerStyle(style).map(s => {
                s.setGeometry(getGeometryTrasformation(style));
                return s;
            });
        }
        if (isSymbolStyle(style)) {
            return Icons.standard.getIcon({style}).map(s => {
                s.setGeometry(getGeometryTrasformation(style));
                return s;
            });
        }
        const text = getTextStyle(style, stroke, fill, feature);
        const zIndex = style.zIndex;

        // if filter is defined and true (default value)
        const finalStyle = new ol.style.Style({
            geometry: getGeometryTrasformation(style),
            image,
            text,
            stroke: !text && !image && stroke || null,
            fill: !text && !image && fill || null,
            zIndex
        });
        return [finalStyle].concat(feature && feature.properties && feature.properties.canEdit && !feature.properties.isCircle ? addDefaultStartEndPoints(tempStyles) : []);
    }
    return new ol.style.Style({});
    // if not do not return anything

};

const parseStyles = (feature = {properties: {}}) => {
    let styles = feature.style;
    if (styles) {
        let tempStyles = isArray(styles) ? styles : castArray(styles);
        return tempStyles.reduce((p, c) => {
            return p.concat(parseStyleToOl(feature, c, tempStyles));
        }, []);
    }
    return [];

};
/* importing legacy functions, do not use them if possible */
module.exports = {
    getStyle: require('./LegacyVectorStyle').getStyle,
    getMarkerStyleLegacy: require('./LegacyVectorStyle').getMarkerStyle,
    startEndPolylineStyle: require('./LegacyVectorStyle').startEndPolylineStyle,
    defaultStyles: require('./LegacyVectorStyle').defaultStyles,
    getCircleStyle,
    getMarkerStyle,
    getStrokeStyle,
    getFillStyle,
    getTextStyle,
    firstPointOfPolylineStyle,
    lastPointOfPolylineStyle,
    centerPoint,
    startPoint,
    endPoint,
    getGeometryTrasformation,
    getFilter,
    parseStyleToOl,
    parseStyles
};
