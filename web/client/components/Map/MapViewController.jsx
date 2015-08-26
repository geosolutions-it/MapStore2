/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var LMap = require('../leaflet/Map');
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
                return <LLayer type={layer.type} key={layer.name} options={layer} />;
            });
        }
    },
    render() {
        var config = this.props.config;
        var center = config.center;
        var zoom = config.zoom;
        return (<LMap center={center} zoom={zoom} id={this.props.id}>
            {this.renderLayers(config.sources, config.layers)}
        </LMap>);
    }


});

module.exports = MapViewController;
