/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var L = require('leaflet');
var WMSUtils = require('../../utils/leaflet/WMSUtils');

var LeafletLayer = React.createClass({
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
            switch (type) {
                case "osm":
                    this.layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    });
                    break;
                case "wms":
                    this.layer = L.tileLayer.wms(
                        WMSUtils.getWMSURL(options.url),
                        WMSUtils.wmsToLeafletOptions(options)
                    );
                    break;
                default:
            }
            if (this.layer) {
                this.layer.addTo(this.props.map);
            }
        }
    }
});

module.exports = LeafletLayer;
