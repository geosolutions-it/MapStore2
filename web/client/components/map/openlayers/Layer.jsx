/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Layers = require('../../../utils/openlayers/Layers');

const OpenlayersLayer = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        mapId: React.PropTypes.string,
        type: React.PropTypes.string,
        options: React.PropTypes.object,
        onLayerLoading: React.PropTypes.func,
        onLayerLoad: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            onLayerLoading: () => {},
            onLayerLoad: () => {}
        };
    },

    componentDidMount() {
        this.createLayer(this.props.type, this.props.options);
    },
    componentWillReceiveProps(newProps) {
        const newVisibility = newProps.options && newProps.options.visibility !== false;
        this.setLayerVisibility(newVisibility);

        const newOpacity = (newProps.options && newProps.options.opacity !== undefined) ? newProps.options.opacity : 1.0;
        this.setLayerOpacity(newOpacity);
    },
    componentWillUnmount() {
        if (this.layer && this.props.map) {
            this.props.map.removeLayer(this.layer);
        }
    },
    render() {
        return Layers.renderLayer(this.props.type, this.props.options, this.props.map, this.props.mapId);
    },
    setLayerVisibility(visibility) {
        var oldVisibility = this.props.options && this.props.options.visibility !== false;
        if (visibility !== oldVisibility && this.layer) {
            this.layer.setVisible(visibility);
        }
    },
    setLayerOpacity(opacity) {
        var oldOpacity = (this.props.options && this.props.options.opacity !== undefined) ? this.props.options.opacity : 1.0;
        if (opacity !== oldOpacity && this.layer) {
            this.layer.setOpacity(opacity);
        }
    },
    createLayer(type, options) {
        if (type) {
            this.layer = Layers.createLayer(type, options, this.props.map, this.props.mapId);

            if (this.layer) {
                this.props.map.addLayer(this.layer);
                this.layer.getSource().on('tileloadstart', () => {
                    this.props.onLayerLoading(options.name);
                });
                this.layer.getSource().on('tileloadend', () => {
                    this.props.onLayerLoad(options.name);
                });
                this.layer.getSource().on('tileloaderror', () => {
                    this.props.onLayerLoad(options.name);
                });
            }
        }
    }
});

module.exports = OpenlayersLayer;
