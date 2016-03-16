/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const assign = require('object-assign');
const ConfigUtils = require('../../../utils/ConfigUtils');

const {connect} = require('react-redux');

const {changeMapView, clickOnMap, changeMousePointer} = require('../../../actions/map');
const {layerLoading, layerLoad} = require('../../../actions/layers');
const {changeLocateState, onLocateError} = require('../../../actions/locate');
const {changeMeasurementState} = require('../../../actions/measurement');
const {changeMousePosition} = require('../../../actions/mousePosition');

const MapInfoUtils = require('../../../utils/MapInfoUtils');

module.exports = (mapType) => {
    const {LMap,
        LLayer,
        ScaleBar,
        MeasurementSupport,
        Overview,
        Locate,
        Feature
    } = require('../../../components/map/' + mapType + '/index');

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
        /*
        */
        renderSupportTools() {
            var baseTools = [
            <MeasurementSupport
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
            if (this.props.config) {
                return (
                    <LMap id="map"
                        center={this.props.config.center}
                        zoom={this.props.config.zoom}
                        mapStateSource={this.props.config.mapStateSource}
                        projection={this.props.config.projection || 'EPSG:3857'}
                        mapOptions={this.props.config.mapOptions}
                        zoomControl={this.props.zoomControl}
                        mousePointer={this.props.config.mousePointer}
                        onMapViewChanges={this.props.onMapViewChanges}
                        onClick={this.props.onClick}
                        onMouseMove={this.props.onMouseMove}
                        onLayerLoading={this.props.onLayerLoading}
                        onLayerLoad={this.props.onLayerLoad}
                    >
                        {this.renderLayers(this.props.layers)}
                        {this.renderSupportTools()}
                    </LMap>
                );
            }
            return <div>Loading...</div>;
        }
    });

    require('../../../components/map/' + mapType + '/plugins/index');

    return connect((state) => ({
        config: state.map && state.map.present,
        layers: state.layers && state.layers.flat && (state.mapInfo && state.mapInfo.showMarker && [...state.layers.flat, MapInfoUtils.getMarkerLayer("GetFeatureInfo", state.mapInfo.clickPoint.latlng)] || state.layers.flat) || [],
        locate: state.locate || {},
        mousePosition: state.mousePosition || {enabled: false},
        measurement: state.measurement || {}
    }),
    {
        onMapViewChanges: changeMapView,
        onClick: clickOnMap,
        onMouseMove: changeMousePosition,
        onLayerLoading: layerLoading,
        onLayerLoad: layerLoad,
        changeMousePointer,
        changeMeasurementState,
        changeLocateState,
        onLocateError
    }, (stateProps, dispatchProps, ownProps) => {
        return assign({}, ownProps, stateProps, assign({}, dispatchProps, {
            onMouseMove: stateProps.mousePosition.enabled ? dispatchProps.onMouseMove : () => {}
        }));
    })(VMap);
};
