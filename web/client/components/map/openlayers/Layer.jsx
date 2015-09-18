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
        options: React.PropTypes.object
    },

    componentDidMount() {
        if (this.props.options && this.props.options.visibility !== false) {
            this.createLayer(this.props.type, this.props.options);
        }
    },

    componentWillUnmount() {
        if (this.layer && this.props.map) {
            this.props.map.removeLayer(this.layer);
        }
    },
    render() {
        if (this.props.options && this.props.options.visibility !== false) {
            return Layers.renderLayer(this.props.type, this.props.options, this.props.map, this.props.mapId);
        }
        return null;
    },
    createLayer(type, options) {
        if (type) {
            this.layer = Layers.createLayer(type, options, this.props.map, this.props.mapId);

            if (this.layer) {
                this.props.map.addLayer(this.layer);
            }
        }
    }
});

module.exports = OpenlayersLayer;
