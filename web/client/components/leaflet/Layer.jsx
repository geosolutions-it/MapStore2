/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var L = require('leaflet');
var LeafletUtils = require('./WMSUtils');
var Google = require('leaflet-plugins/layer/tile/Google');
var Bing = require('leaflet-plugins/layer/tile/Bing');

const LeafletLayer = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        source: React.PropTypes.object,
        options: React.PropTypes.object
    },

    componentDidMount() {
        if (this.props.options && this.props.options.visibility !== false) {
            this.createLayer(this.props.source, this.props.options);
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
    createLayer(source, options) {
        if (source) {
            switch (source.ptype) {
                case "gxp_osmsource":
                    this.layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    });
                    break;
                case "gxp_wmssource":
                    this.layer = L.tileLayer.wms(LeafletUtils.getWMSURL(source.url), LeafletUtils.wmsToLeafletOptions(source, options));
                    break;
                case "gxp_bingsource":
                    this.layer = this.createBingLayer(options);
                    break;
                case "gxp_googlesource":
                    this.layer = this.createGoogleLayer(options);
                    break;
                default:
            }
            if (this.layer) {
                // some plugins doesn't have addTo method
                if (source.type === "gxp_wmssource" || source.type === "gxp_osmsource" ) {
                    this.layer.addTo(this.props.map);
                } else {
                    this.props.map.addLayer(this.layer);
                }
            }
        }
    },
    createGoogleLayer: function(layer) {
        return new Google(layer.name);
    },
    createBingLayer: function(layer) {
        var key = layer.apiKey || "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
        return new Bing(key,
            {
                subdomains: [0, 1, 2, 3],
                type: layer.name,
                attribution: 'Bing',
                culture: ''
            }
        );
    }
});

module.exports = LeafletLayer;
