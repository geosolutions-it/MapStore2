const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ol = require('openlayers');
const {isEqual} = require('lodash');
const {getStyle} = require('./VectorStyle');

class Feature extends React.Component {
    static propTypes = {
        type: PropTypes.string,
        layerStyle: PropTypes.object,
        style: PropTypes.object,
        properties: PropTypes.object,
        crs: PropTypes.string,
        container: PropTypes.object, // TODO it must be a ol.layer.vector (maybe pass the source is more correct here?)
        geometry: PropTypes.object, // TODO check for geojson format for geometry
        msId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        featuresCrs: PropTypes.string
    };

    static defaultProps = {
        featuresCrs: "EPSG:4326"
    };

    componentDidMount() {
        this.addFeatures(this.props);
        const format = new ol.format.GeoJSON();
        const geometry = this.props.geometry.type === "GeometryCollection" ? this.props.geometry && this.props.geometry.geometries : this.props.geometry && this.props.geometry.coordinates;

        if (this.props.container && geometry) {
            this._feature = format.readFeatures({
                type: this.props.type,
                properties: this.props.properties,
                geometry: this.props.geometry,
                id: this.props.msId});
            this._feature.forEach((f) => f.getGeometry().transform(this.props.featuresCrs, this.props.crs || 'EPSG:3857'));
            if (this.props.style && (this.props.style !== this.props.layerStyle)) {
                this._feature.forEach((f) => { f.setStyle(getStyle({style: this.props.style})); });
            }
            this.props.container.getSource().addFeatures(this._feature);
        }
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps.properties, this.props.properties) || !isEqual(nextProps.geometry, this.props.geometry) || !isEqual(nextProps.style, this.props.style);
    }

    componentWillUpdate(newProps) {
        if (!isEqual(newProps.properties, this.props.properties) || !isEqual(newProps.geometry, this.props.geometry) || !isEqual(newProps.style, this.props.style)) {
            this.removeFromContainer();
            this.addFeatures(newProps);
        }
    }

    componentWillUnmount() {
        this.removeFromContainer();
    }

    render() {
        return null;
    }

    addFeatures = (props) => {
        const format = new ol.format.GeoJSON();
        const geometry = this.props.geometry.type === "GeometryCollection" ? this.props.geometry && this.props.geometry.geometries : this.props.geometry && this.props.geometry.coordinates;

        if (props.container && geometry) {
            this._feature = format.readFeatures({
                type: props.type,
                properties: props.properties,
                geometry: props.geometry,
                id: this.props.msId});
            this._feature.forEach((f) => f.getGeometry().transform(props.featuresCrs, props.crs || 'EPSG:3857'));
            if (props.style && (props.style !== props.layerStyle)) {
                this._feature.forEach((f) => { f.setStyle(getStyle({style: props.style})); });
            }
            props.container.getSource().addFeatures(this._feature);
        }
    };


    removeFromContainer = () => {
        if (this._feature) {
            if (Array.isArray(this._feature)) {
                const layersSource = this.props.container.getSource();
                this._feature.map((feature) => {
                    let featureId = feature.getId();
                    if (featureId === undefined) {
                        layersSource.removeFeature(feature);
                    } else {
                        layersSource.removeFeature(layersSource.getFeatureById(featureId));
                    }
                });
            } else {
                this.props.container.getSource().removeFeature(this._feature);
            }
        }
    };
}

module.exports = Feature;
