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
var Overview = require('../../../components/map/' + mapType + '/Overview');

var assign = require('object-assign');
var ConfigUtils = require('../../../utils/ConfigUtils');

var VMap = React.createClass({
    propTypes: {
        config: ConfigUtils.PropTypes.config,
        layers: React.PropTypes.array,
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
                return <LLayer type={layer.type} position={index} key={layer.name} options={options} />;
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
                {this.renderLayers(this.props.layers)}
                <MeasurementSupport
                    changeMeasurementState={this.props.changeMeasurementState}
                    measurement={this.props.measurement} />
                <ScaleBar/>
                <Overview
                    overviewOpt={{ // overviewOpt accept config param for ol and leflet overview control
                            // refer to https://github.com/Norkart/Leaflet-MiniMap and http://openlayers.org/en/v3.10.1/apidoc/ol.control.OverviewMap.html
                            position: 'bottomright',
                            collapsedWidth: 25,
                            collapsedHeight: 25,
                            zoomLevelOffset: -5,
                            toggleDisplay: true
                    }}// If not passed overview will use osm as default layer
                    layers={[{type: "osm"}]}/>
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
