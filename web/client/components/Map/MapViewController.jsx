/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var LMap = require('../leaflet/map');
// var MapConfigActionCreator = require( '../../actions/MapConfigActions');

var React = require('react');

var MapViewController = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: React.PropTypes.object,
        zoom: React.PropTypes.number,
        config: React.PropTypes.object
    },

    render() {
        // first implementation simply uses center and zoom.
        // a future solution will use a store for the state of the map
        var config = this.props.config;
        var latLng = config.latLng;
        var zoom = config.zoom;
        return <LMap center={latLng} zoom={zoom} id={this.props.id}/>;
    }
});

module.exports = MapViewController;
