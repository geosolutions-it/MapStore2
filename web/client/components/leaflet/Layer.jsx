/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Layers = require('../../utils/leaflet/Layers');

const LeafletLayer = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
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
        return null;
    },
    createLayer(type, options) {
        if (type) {
            this.layer = Layers.createLayer(type, options);

            if (this.layer) {
                this.props.map.addLayer(this.layer);
            }
        }
    }
});

module.exports = LeafletLayer;
