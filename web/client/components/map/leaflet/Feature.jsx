/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {isEqual} = require('lodash');

const {geometryToLayer} = require('../../../utils/leaflet/Vector');

class Feature extends React.Component {
    static propTypes = {
        msId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        type: PropTypes.string,
        styleName: PropTypes.string,
        properties: PropTypes.object,
        container: PropTypes.object, // TODO it must be a L.GeoJSON
        geometry: PropTypes.object, // TODO check for geojson format for geometry
        style: PropTypes.object,
        onClick: PropTypes.func,
        options: PropTypes.object
    };

    componentDidMount() {
        if (this.props.container && this.props.geometry) {
            this.createLayer(this.props);
        }
    }

    componentWillReceiveProps(newProps) {
        if (!isEqual(newProps.properties, this.props.properties) || !isEqual(newProps.geometry, this.props.geometry) || !isEqual(newProps.style, this.props.style)) {
            this.props.container.removeLayer(this._layer);
            this.createLayer(newProps);
        }
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps.properties, this.props.properties) || !isEqual(nextProps.geometry, this.props.geometry);
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
        this._layer = geometryToLayer({
            type: props.type,
            geometry: props.geometry,
            styleName: props.styleName,
            properties: props.properties,
            msId: props.msId
        }, {
            style: props.style
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
    };
}

module.exports = Feature;
