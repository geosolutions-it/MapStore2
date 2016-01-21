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
    Locate,
    Feature
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
        mapOptions: React.PropTypes.object,
        onMouseMove: React.PropTypes.func,
        onLayerLoading: React.PropTypes.func,
        onLayerLoad: React.PropTypes.func,
        changeMeasurementState: React.PropTypes.func,
        measurement: React.PropTypes.object,
        locate: React.PropTypes.object,
        locateMessages: React.PropTypes.object,
        changeLocateState: React.PropTypes.func,
        onLocateError: React.PropTypes.func
    },
    renderLayers(layers) {
        if (layers) {
            let projection = this.props.config.projection || 'EPSG:3857';
            let me = this; // TODO find the reason why the arrow function doesn't get this object
            return layers.map((layer, index) => {
                var options = assign({}, layer, {srs: projection});
                return (<LLayer type={layer.type} position={index} key={layer.id || layer.name} options={options}>
                    {me.renderLayerContent(layer)}
                </LLayer>);
            });
        }
        return null;
    },
    renderSupportTools() {
        var baseTools = [<MeasurementSupport
            key="measuresupport"
            changeMeasurementState={this.props.changeMeasurementState}
            measurement={this.props.measurement} />,
        <Locate key="locate" status={this.props.locate.state} changeLocateState={this.props.changeLocateState} onLocateError={this.props.onLocateError} messages={this.props.locateMessages }/>];
        if (this.props.overview) {
            baseTools.push(<Overview
                key="overview"
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
            baseTools.push(<ScaleBar key="scalebar"/>);
        }
        return baseTools;
    },
    renderLayerContent(layer) {
        if (layer.features && layer.type === "vector") {
            // TODO remove this DIV. What container can be used for this component.
            return layer.features.map( (feature) => {
                return (<Feature
                    key={feature.id}
                    type={feature.type}
                    geometry={feature.geometry}
                />);
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
                zoomControl={this.props.zoomControl}
                onMapViewChanges={this.props.onMapViewChanges}
                onClick={this.props.onClick}
                mousePointer={this.props.config.mousePointer}
                onMouseMove={this.props.onMouseMove}
                onLayerLoading={this.props.onLayerLoading}
                onLayerLoad={this.props.onLayerLoad}
                mapOptions={this.props.config.mapOptions}
            >
                {this.renderLayers(this.props.layers)}
                {this.renderSupportTools()}
            </LMap>
        );
    }
});

require('../../../components/map/' + mapType + '/plugins/index');

module.exports = VMap;
