/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var LMap = require('../leaflet/map');
var LLayer = require('../leaflet/Layer');
// var MapConfigActionCreator = require( '../../actions/MapConfigActions');

var React = require('react');

var MapViewController = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: React.PropTypes.object,
        zoom: React.PropTypes.number,
        config: React.PropTypes.object
    },
    renderLayers(sources, layers) {
        if (layers) {
            return layers.map(function(layer) {
                return <LLayer source={sources[layer.source]} key={layer.name} options={layer} />;
            });
        }
    },
    render() {
        // first implementation simply uses center and zoom.
        // a future solution will use a store for the state of the map
        var config = this.props.config;
        var latLng = config.latLng;
        var zoom = config.zoom;
        return (<LMap center={latLng} zoom={zoom} id={this.props.id}>
            {this.renderLayers(config.sources, config.layers)}
        </LMap>);
    }


});

module.exports = MapViewController;
