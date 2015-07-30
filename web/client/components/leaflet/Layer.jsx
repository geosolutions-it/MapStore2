/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var L = require('leaflet');

var LeafletLayer = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        source: React.PropTypes.object,
        options: React.PropTypes.object
    },

    componentDidMount() {
        this.createLayer(this.props.source, this.props.options);
    },
    render() {
        return null;
    },
    createLayer(source) {
        if (!source.ptype) {
            source.ptype = "gxp_wmssource";
        }
        switch (source.ptype) {
            case "gxp_osmsource":
                this.layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                });
                this.layer.addTo(this.props.map);
                break;
            default:
        }
    }
});

module.exports = LeafletLayer;
