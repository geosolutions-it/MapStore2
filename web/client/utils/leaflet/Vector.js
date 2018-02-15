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
    if (style && style.iconUrl) {
        return Icons.standard.getIcon(style);
    }

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
    const newStructuredStyle = props.style && props.style[props.geometry.type];
    return props.styleName === "marker" || (newStructuredStyle && (newStructuredStyle.iconUrl || newStructuredStyle.iconGlyph) || props.style && (props.style.iconUrl || props.style.iconGlyph));
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
        return VectorUtils.pointToLayer(latlng, geojson, {...options.style, highlight: options.highlight});
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
    * This method creates a valid geoJSON for layer creatd from GeometryCollection
    * The leaflet toGeoJSON transforms the layer created by VectorUtils.geometryToLayer in a
    * featureCollection of FeatureCollections in that case becuse for each L.FeatureGroup it creates a FeatureCollection.
    * Thus we need to recreate a GeometryCollection and also Multi geoms instead of FeatureCollections
    * @return {object} a valid geoJSON
    */
    toValidGeoJSON: (layer) => {
        const invalidGeojson = layer.toGeoJSON();
        invalidGeojson.features.map(f => {
            console.log(f);
        });
    },
    geometryToLayer: function(geojson, options) {
        var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson;
        var coords = geometry ? geometry.coordinates : null;
        var layers = [];
        var props = {style: options.style, ...geojson};
        var pointToLayer = options && !isMarker(props) ? function(feature, latlng) {
            // probably this need a fix
            return L.circleMarker(latlng, props.style[geojson.geometry.type] || props.style || {
                radius: 5,
                color: "red",
                weight: 1,
                opacity: 1,
                fillOpacity: 0
            });
        } : null;
        var latlng;
        var latlngs;
        var i;
        var len;
        let coordsToLatLng = options && options.coordsToLatLng || VectorUtils.coordsToLatLngF;

        if (!coords && !geometry) {
            return null;
        }
        let layer;
        let style;
        switch (geometry.type) {
        case 'Point':
            latlng = coordsToLatLng(coords);
            layer = VectorUtils.getPointLayer(pointToLayer, geojson, latlng, {...options, style: options.style && options.style.Point, highlight: options.style && options.style.highlight});
            layer.msId = geojson.id;
            return layer;
        case 'MultiPoint':
            for (i = 0, len = coords.length; i < len; i++) {
                latlng = coordsToLatLng(coords[i]);
                layer = VectorUtils.getPointLayer(pointToLayer, geojson, latlng, {...options, style: options.style && options.style.MultiPoint, highlight: options.style && options.style.highlight});
                layer.msId = geojson.id;
                layers.push(layer);
            }
            return new L.FeatureGroup(layers);

        case 'LineString':
            style = options.style && options.style.LineString ? {...options.style.LineString} : {...options.style};
            style = assign({}, style, {
                dashArray: options.style.highlight ? "10" : null
            });
            latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, coordsToLatLng);
            layer = new L.Polyline(latlngs, style);
            layer.msId = geojson.id;
            return layer;
        case 'MultiLineString':
            style = options.style && options.style.MultiLineString ? {...options.style.MultiLineString} : {...options.style};
            style = assign({}, style, {
                dashArray: options.style.highlight ? "10" : null
            });
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
            style = options.style && options.style.Polygon ? {...options.style.Polygon} : {...options.style};
            style = assign({}, style, {
                dashArray: options.style.highlight ? "10" : null
            });
            latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, coordsToLatLng);
            layer = new L.Polygon(latlngs, style);
            layer.msId = geojson.id;
            return layer;
        case 'MultiPolygon':
            style = options.style && options.style.MultiPolygon ? {...options.style.MultiPolygon} : {...options.style};
            style = assign({}, style, {
                dashArray: options.style.highlight ? "10" : null
            });
            latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, coordsToLatLng);
            for (i = 0, len = latlngs.length; i < len; i++) {
                layer = new L.Polygon(latlngs[i], style);
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
    }
};

module.exports = VectorUtils;
