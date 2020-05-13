/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const L = require('leaflet');
const Icons = require('./Icons');
const assign = require('object-assign');
const {isMarkerStyle, isSymbolStyle} = require('../VectorStyleUtils');

const getIcon = (style, geojson) => {
    if (style && style.iconGlyph) {
        const iconLibrary = style.iconLibrary || 'extra';
        if (Icons[iconLibrary]) {
            return Icons[iconLibrary].getIcon(style);
        }
    }
    if (style && style.html && geojson) {
        return Icons.html.getIcon(style, geojson);
    }
    if (style && style.iconUrl || style.symbolUrlCustomized || style.symbolUrl) {
        return Icons.standard.getIcon(style);
    }
    return null;
};

const coordsToLatLngF = function(coords) {
    return new L.LatLng(coords[1], coords[0], coords[2]);
};

const coordsToLatLngs = function(coords, levelsDeep, coordsToLatLng) {
    var latlngs = [];
    var len = coords.length;
    for (let i = 0, latlng; i < len; i++) {
        latlng = levelsDeep ?
            coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
            (coordsToLatLng || this.coordsToLatLng)(coords[i]);

        latlngs.push(latlng);
    }

    return latlngs;
};

const isMarker = (props) => {
    // TODO FIX THIS, for geom coll that contains marker or normal points
    if (props.geometry.type === "GeometryCollection") {
        return false;
    }
    const newStructuredStyle = props.style;
    return newStructuredStyle && (isMarkerStyle(newStructuredStyle) || isSymbolStyle(newStructuredStyle) || (newStructuredStyle.iconUrl || newStructuredStyle.iconGlyph));
};
// Create a new Leaflet layer with custom icon marker or circleMarker

const VectorUtils = {
    coordsToLatLngF,
    coordsToLatLngs,
    isMarker,
    getPointLayer: function(pointToLayer, geojson, latlng, options) {
        if (pointToLayer) {
            return pointToLayer(geojson, latlng);
        }
        return VectorUtils.pointToLayer(latlng, geojson, {...options.style, styleName: options.styleName, highlight: options.highlight});
    },
    pointToLayer: (latlng, geojson, style) => {
        const newStyle = style.Point || style.MultiPoint || style;
        const icon = getIcon(newStyle, geojson);
        if (icon) {
            return L.marker(
                latlng,
                {
                    icon,
                    opacity: newStyle && newStyle.opacity || 1
                });
        }
        return L.marker(latlng, {
            opacity: newStyle && newStyle.opacity || 1
        });
    },
    /**
    * This method creates a valid geoJSON for layer created from GeometryCollection
    * The leaflet toGeoJSON transforms the layer created by VectorUtils.geometryToLayer in a
    * featureCollection of FeatureCollections in that case because for each L.FeatureGroup it creates a FeatureCollection.
    * Thus we need to recreate a GeometryCollection and also multi-geometry instead of FeatureCollections
    * @return {object} a valid geoJSON
    */
    toValidGeoJSON: () => {
        // TODO
    },
    /**
     * create point or text layer
     */
    createTextPointMarkerLayer: ({pointToLayer, geojson, latlng, options, style = {}, highlight = false} = {}) => {
        if (geojson.properties && geojson.properties.isText) {
            // this is a Text Feature
            // TODO: improve management for stroke-width because 5px it was not the same as in ol width:5 for ol.style.Stroke
            let myIcon = L.divIcon({html: `<span style="
                font:${style.font};
                color:${style.fillColor};
                -webkit-text-stroke-width:${1}px;
                -webkit-text-stroke-color:${style.color};">${geojson.properties.valueText}</span>`, className: ''});
            return new L.Marker(latlng, {icon: myIcon});
        }
        return VectorUtils.getPointLayer(pointToLayer, geojson, latlng, {...options, style, highlight});
    },
    /**
    * create Circle or polygon layer
    */
    createPolygonCircleLayer: ({geojson, style = {}, latlngs = [], coordsToLatLng = () => {}} = {}) => {
        if (geojson.properties && geojson.properties.isCircle) {
            let latlng = coordsToLatLng(geojson.properties.center);
            return L.circle(latlng, { ...style, radius: geojson.properties.radius});
        }
        return new L.Polygon(latlngs, style);
    },
    geometryToLayer: function(geojson, options) {
        const geometry = geojson.type === 'Feature' ? geojson.geometry : geojson;
        const coords = geometry ? geometry.coordinates : null;
        const layers = [];
        const props = {styleName: options.styleName, style: options.style && options.style[0] || options.style, ...geojson};
        const pointToLayer = options && !isMarker(props) ? function(feature, latlng) {
            if (props.styleName === "marker") {
                return L.marker(latlng, props.style);
            }
            return L.circleMarker(latlng, props.style && props.style[0] || props.style );
        } : null;

        let coordsToLatLng = options && options.coordsToLatLng || VectorUtils.coordsToLatLngF;

        if (!coords && !geometry) {
            return null;
        }
        let layer;
        let style = props.style || assign({}, options.style && options.style[geometry.type] || options.style, {highlight: options.style && options.style.highlight});

        let latlng;
        let latlngs;
        let i;
        let len;
        switch (geometry.type) {
        case 'Point':
            latlng = coordsToLatLng(coords);
            layer = VectorUtils.createTextPointMarkerLayer({pointToLayer, geojson, latlng, options, style, highlight: style && style.highlight});
            return layer;
        case 'MultiPoint':
            for (i = 0, len = coords.length; i < len; i++) {
                latlng = coordsToLatLng(coords[i]);
                layer = VectorUtils.createTextPointMarkerLayer({pointToLayer, geojson, latlng, options, style, highlight: style && style.highlight});
                layer.msId = geojson.id;
                layers.push(layer);
            }
            return new L.FeatureGroup(layers);

        case 'LineString':
            style = VectorUtils.updateHighlightStyle(style);
            latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, coordsToLatLng);
            layer = new L.Polyline(latlngs, style);
            layer.msId = geojson.id;
            return layer;
        case 'MultiLineString':
            style = VectorUtils.updateHighlightStyle(style);
            latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, coordsToLatLng);
            for (i = 0, len = latlngs.length; i < len; i++) {
                layer = new L.Polyline(latlngs[i], style);
                layer.msId = geojson.id;
                if (layer) {
                    layers.push(layer);
                }
            }
            return new L.FeatureGroup(layers);
        case 'Polygon':
            style = VectorUtils.updateHighlightStyle(style);
            latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, coordsToLatLng);
            layer = VectorUtils.createPolygonCircleLayer({geojson, style, latlngs, coordsToLatLng});
            layer.msId = geojson.id;
            return layer;
        case 'MultiPolygon':
            style = VectorUtils.updateHighlightStyle(style);
            latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, coordsToLatLng);
            for (i = 0, len = latlngs.length; i < len; i++) {
                layer = VectorUtils.createPolygonCircleLayer({geojson, style, latlngs, coordsToLatLng});
                layer.msId = geojson.id;
                if (layer) {
                    layers.push(layer);
                }
            }
            return new L.FeatureGroup(layers);
        case 'GeometryCollection':
            for (i = 0, len = geometry.geometries.length; i < len; i++) {
                layer = VectorUtils.geometryToLayer({
                    geometry: geometry.geometries[i],
                    type: 'Feature',
                    properties: geojson.properties
                }, options);

                if (layer) {
                    layers.push(layer);
                }
            }
            return new L.FeatureGroup(layers);

        default:
            throw new Error('Invalid GeoJSON object.');
        }
    },
    updateHighlightStyle: (style) => {
        let {highlight} = style;
        if (highlight) {
            return assign({}, style, {
                dashArray: highlight ? "10" : null
            });
        }
        return style;
    }
};

module.exports = VectorUtils;
