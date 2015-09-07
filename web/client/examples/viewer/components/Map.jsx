/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var url = require('url');

const urlQuery = url.parse(window.location.href, true).query;
const mapType = urlQuery.type || 'leaflet';

var LMap = require('../../../components/' + mapType + '/Map');
var LLayer = require('../../../components/' + mapType + '/Layer');

var assign = require('object-assign');
var ConfigUtils = require('../../../utils/ConfigUtils');

var VMap = React.createClass({
    propTypes: {
        config: ConfigUtils.PropTypes.config,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func
    },
    renderLayers(layers) {
        if (layers) {
            let projection = this.props.config.projection || 'EPSG:3857';
            return layers.map(function(layer) {
                var options = assign({}, layer, {srs: projection});
                return <LLayer type={layer.type} key={layer.name} options={options} />;
            });
        }
        return null;
    },
    render() {
        return (
            <LMap id="map"
                center={this.props.config.center}
                zoom={this.props.config.zoom}
                projection={this.props.config.projection || 'EPSG:3857'}
                onMapViewChanges={this.props.onMapViewChanges}
                onClick={this.props.onClick}>
                {this.renderLayers(this.props.config.layers)}
            </LMap>
        );
    }
});

require('../../../components/' + mapType + '/plugins/OSMLayer');
require('../../../components/' + mapType + '/plugins/WMSLayer');
require('../../../components/' + mapType + '/plugins/GoogleLayer');
require('../../../components/' + mapType + '/plugins/BingLayer');


module.exports = VMap;
