/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var L = require('leaflet');
const {isEqual} = require('lodash');

var coordsToLatLngF = function(coords) {
    return new L.LatLng(coords[1], coords[0], coords[2]);
};

var coordsToLatLngs = function(coords, levelsDeep, coordsToLatLng) {
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
var geometryToLayer = function(geojson, options) {

    var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson;
    var coords = geometry ? geometry.coordinates : null;
    var layers = [];
    var pointToLayer = options && options.pointToLayer;
    var latlng;
    var latlngs;
    var i;
    var len;
    let coordsToLatLng = options && options.coordsToLatLng || coordsToLatLngF;

    if (!coords && !geometry) {
        return null;
    }

    switch (geometry.type) {
    case 'Point':
        latlng = coordsToLatLng(coords);
        return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);

    case 'MultiPoint':
        for (i = 0, len = coords.length; i < len; i++) {
            latlng = coordsToLatLng(coords[i]);
            layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
        }
        return new L.FeatureGroup(layers);

    case 'LineString':
    case 'MultiLineString':
        latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, coordsToLatLng);
        return new L.Polyline(latlngs, options.style);

    case 'Polygon':
    case 'MultiPolygon':
        latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, coordsToLatLng);
        return new L.Polygon(latlngs, options.style);

    case 'GeometryCollection':
        for (i = 0, len = geometry.geometries.length; i < len; i++) {
            let layer = this.geometryToLayer({
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
};

let Feature = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
        styleName: React.PropTypes.string,
        properties: React.PropTypes.object,
        container: React.PropTypes.object, // TODO it must be a L.GeoJSON
        geometry: React.PropTypes.object, // TODO check for geojson format for geometry
        style: React.PropTypes.object
    },
    componentDidMount() {
        if (this.props.container) {
            let style = this.props.style;
            this._layer = geometryToLayer({
                type: this.props.type,
                geometry: this.props.geometry}, {
                style: style,
                pointToLayer: this.props.styleName !== "marker" ? function(feature, latlng) {
                    return L.circleMarker(latlng, style || {
                        radius: 5,
                        color: "red",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0
                    });
                } : null}
            );
            this.props.container.addLayer(this._layer);
        }
    },
    componentWillReceiveProps(newProps) {
        if (!isEqual(newProps.properties, this.props.properties) || !isEqual(newProps.geometry, this.props.geometry)) {
            this.props.container.removeLayer(this._layer);
            this._layer = geometryToLayer({
                type: newProps.type,
                geometry: newProps.geometry},
                {
                style: newProps.style,
                pointToLayer: newProps.styleName !== "marker" ? function(feature, latlng) {
                    return L.circleMarker(latlng, newProps.style || {
                        radius: 5,
                        color: "red",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0
                    });
                } : null}
            );
            newProps.container.addLayer(this._layer);
        }
    },
    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps.properties, this.props.properties) || !isEqual(nextProps.geometry, this.props.geometry);
    },
    componentWillUnmount() {
        if (this._layer) {
            this.props.container.removeLayer(this._layer);
        }
    },
    render() {
        return null;
    }
});

module.exports = Feature;
