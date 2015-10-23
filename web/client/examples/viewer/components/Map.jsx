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

var LMap = require('../../../components/map/' + mapType + '/Map');
var LLayer = require('../../../components/map/' + mapType + '/Layer');
var ScaleBar = require('../../../components/map/' + mapType + '/ScaleBar');
var MeasurementSupport = require('../../../components/map/' + mapType + '/MeasurementSupport');

var assign = require('object-assign');
var ConfigUtils = require('../../../utils/ConfigUtils');

var VMap = React.createClass({
    propTypes: {
        config: ConfigUtils.PropTypes.config,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func,
        onMouseMove: React.PropTypes.func,
        onLayerLoading: React.PropTypes.func,
        onLayerLoad: React.PropTypes.func,
        changeMeasurementState: React.PropTypes.func,
        measurement: React.PropTypes.object,
        messages: React.PropTypes.object
    },
    renderLayers(layers) {
        if (layers) {
            let projection = this.props.config.projection || 'EPSG:3857';
            return layers.map(function(layer, index) {
                var options = assign({}, layer, {srs: projection});
                return <LLayer type={layer.type} position={index} key={layer.name + ":::" + index} options={options} />;
            });
        }
        return null;
    },
    render() {
        return (
            <LMap id="map"
                center={this.props.config.center}
                zoom={this.props.config.zoom}
                mapStateSource={this.props.config.mapStateSource}
                projection={this.props.config.projection || 'EPSG:3857'}
                onMapViewChanges={this.props.onMapViewChanges}
                onClick={this.props.onClick}
                mousePointer={this.props.config.mousePointer}
                onMouseMove={this.props.onMouseMove}
                onLayerLoading={this.props.onLayerLoading}
                onLayerLoad={this.props.onLayerLoad}
            >
                {this.renderLayers(this.props.config.layers)}
                <MeasurementSupport
                    changeMeasurementState={this.props.changeMeasurementState}
                    measurement={this.props.measurement} />
                <ScaleBar/>
            </LMap>
        );
    }
});

require('../../../components/map/' + mapType + '/plugins/OSMLayer');
require('../../../components/map/' + mapType + '/plugins/WMSLayer');
require('../../../components/map/' + mapType + '/plugins/GoogleLayer');
require('../../../components/map/' + mapType + '/plugins/BingLayer');
require('../../../components/map/' + mapType + '/plugins/MapQuest');
require('../../../components/map/' + mapType + '/plugins/TileProviderLayer');

module.exports = VMap;
