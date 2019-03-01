/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {isEqual, isArray, castArray} = require('lodash');
const assign = require('object-assign');
const axios = require('axios');

const {geometryToLayer} = require('../../../utils/leaflet/Vector');
const {createStylesAsync} = require('../../../utils/VectorStyleUtils');

class Feature extends React.Component {
    static propTypes = {
        msId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        type: PropTypes.string,
        styleName: PropTypes.string,
        properties: PropTypes.object,
        container: PropTypes.object, // TODO it must be a L.GeoJSON
        geometry: PropTypes.object, // TODO check for geojson format for geometry
        features: PropTypes.array,
        style: PropTypes.object,
        onClick: PropTypes.func,
        options: PropTypes.object
    };

    componentDidMount() {
        if (this.props.container && this.props.geometry || this.props.features) {
            this.createLayer(this.props);
        }
    }

    componentWillReceiveProps(newProps) {
        // TODO check if shallow comparison is enough properties and geometry
        if (
            !isEqual(newProps.properties, this.props.properties) ||
            !isEqual(newProps.geometry, this.props.geometry) ||
            (newProps.features !== this.props.features) ||
            (newProps.style !== this.props.style)) {
            newProps.container.removeLayer(this._layer);
            this.createLayer(newProps);
        }
    }

    shouldComponentUpdate(nextProps) {
        // TODO check if shallow comparison is enough properties and geometry
        return !isEqual(nextProps.properties, this.props.properties) || !isEqual(nextProps.geometry, this.props.geometry) || (nextProps.features !== this.props.features);
    }

    componentWillUnmount() {
        if (this._layer) {
            this.props.container.removeLayer(this._layer);
        }
    }

    render() {
        return null;
    }

    createLayer = (props) => {
        if (props.geometry) {
            this.addFeature({...props, style: props.style && castArray(props.style) || undefined});
        }
        if (props.features) {
            // supporting FeatureCollection
            props.features.forEach(f => {
                let newProps = assign({}, props, {
                    type: f.type,
                    geometry: f.geometry,
                    style: f.style && castArray(f.style) || undefined,
                    properties: f.properties
                });
                this.addFeature(newProps);
            });
        }
    };

    addFeature(props) {
        if (isArray(props.style)) {
            let promises = createStylesAsync(props.style);
            axios.all(promises).then((styles) => {
                this.addLayer(props, styles);
            });
        } else {
            this.addLayer(props, props.style);
        }
    }
    addLayer(props, styles) {
        this._layer = geometryToLayer({
            type: props.type,
            geometry: props.geometry,
            styleName: props.styleName,
            properties: props.properties,
            msId: props.msId
        }, {
            style: styles
        });
        props.container.addLayer(this._layer);
        this._layer.on('click', (event) => {
            if (props.onClick) {
                props.onClick({
                    pixel: {
                        x: event.originalEvent && event.originalEvent.x,
                        y: event.originalEvent && event.originalEvent.y
                    },
                    latlng: event.latlng
                }, this.props.options.handleClickOnLayer ? this.props.options.id : null);
            }
        });
    }
}

module.exports = Feature;
