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

var {LMap,
    LLayer,
    ScaleBar,
    MeasurementSupport,
    Overview,
    Locate
} = require('../../../components/map/' + mapType + '/index');

var assign = require('object-assign');
var ConfigUtils = require('../../../utils/ConfigUtils');

var VMap = React.createClass({
    propTypes: {
        config: ConfigUtils.PropTypes.config,
        layers: React.PropTypes.array,
        overview: React.PropTypes.bool,
        scaleBar: React.PropTypes.bool,
        zoomControl: React.PropTypes.bool,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func,
        onMouseMove: React.PropTypes.func,
        onLayerLoading: React.PropTypes.func,
        onLayerLoad: React.PropTypes.func,
        changeMeasurementState: React.PropTypes.func,
        measurement: React.PropTypes.object,
        locate: React.PropTypes.object,
        locateMessages: React.PropTypes.object
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
    renderSupportTools() {
        var baseTools = [<MeasurementSupport
            changeMeasurementState={this.props.changeMeasurementState}
            measurement={this.props.measurement} />,
            <Locate status={this.props.locate.enabled} messages={ this.props.locateMessages }/>];
        if (this.props.overview) {
            baseTools.push(<Overview
                overviewOpt={{ // overviewOpt accept config param for ol and leflet overview control
                        // refer to https://github.com/Norkart/Leaflet-MiniMap and http://openlayers.org/en/v3.10.1/apidoc/ol.control.OverviewMap.html
                        position: 'bottomright',
                        collapsedWidth: 25,
                        collapsedHeight: 25,
                        zoomLevelOffset: -5,
                        toggleDisplay: true
                }}// If not passed overview will use osm as default layer
                layers={[{type: "osm"}]}/>);
        }
        if (this.props.scaleBar) {
            baseTools.push(<ScaleBar/>);
        }
        return baseTools;
    },
    render() {
        return (
            <LMap id="map"
                center={this.props.config.center}
                zoom={this.props.config.zoom}
                mapStateSource={this.props.config.mapStateSource}
                projection={this.props.config.projection || 'EPSG:3857'}
                zoomControl={this.props.zoomControl}
                onMapViewChanges={this.props.onMapViewChanges}
                onClick={this.props.onClick}
                mousePointer={this.props.config.mousePointer}
                onMouseMove={this.props.onMouseMove}
                onLayerLoading={this.props.onLayerLoading}
                onLayerLoad={this.props.onLayerLoad}
            >
                {this.renderLayers(this.props.layers)}
                {this.renderSupportTools()}
            </LMap>
        );
    }
});

require('../../../components/map/' + mapType + '/plugins/index');

module.exports = VMap;
