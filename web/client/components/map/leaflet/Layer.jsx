/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Layers = require('../../../utils/leaflet/Layers');
var assign = require('object-assign');

const LeafletLayer = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        type: React.PropTypes.string,
        options: React.PropTypes.object,
        position: React.PropTypes.number
    },
    componentDidMount() {
        this.createLayer(this.props.type, this.props.options);
        if (this.props.options && this.props.options.visibility !== false) {
            this.addLayer();
            this.updateZIndex();
        }
    },
    componentWillReceiveProps(newProps) {
        var newVisibility = newProps.options && newProps.options.visibility !== false;
        this.setLayerVisibility(newVisibility);
    },
    componentWillUnmount() {
        if (this.layer && this.props.map) {
            this.props.map.removeLayer(this.layer);
        }
    },
    render() {
        return null;
    },
    setLayerVisibility(visibility) {
        // check visibility
        var oldVisibility = this.props.options && this.props.options.visibility !== false;
        // Only if visibility changed
        if ( visibility !== oldVisibility ) {
            if (visibility) {
                this.addLayer();
            } else {
                this.removeLayer();
            }
            this.updateZIndex();

        }
    },
    updateZIndex() {
        if (this.props.position && this.layer && this.layer.setZIndex) {
            this.layer.setZIndex(this.props.position);
        }
    },
    createLayer(type, options) {
        if (type) {
            let opts = options;
            if (this.props.position !== undefined) {
                opts = assign({}, this.props.options, {zIndex: this.props.position});
            }
            this.layer = Layers.createLayer(type, opts);
        }
    },
    addLayer() {
        if (this.layer) {
            this.props.map.addLayer(this.layer);
        }
    },
    removeLayer() {
        if (this.layer) {
            this.props.map.removeLayer(this.layer);
        }
    }
});

module.exports = LeafletLayer;
