/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');

const assign = require('object-assign');

const Message = require('../components/I18N/Message');

let plugins;

const MapPlugin = React.createClass({
    propTypes: {
        mapType: React.PropTypes.string,
        map: React.PropTypes.object,
        layers: React.PropTypes.array,
        zoomControl: React.PropTypes.bool,
        mapLoadingMessage: React.PropTypes.string,
        tools: React.PropTypes.array,
        toolsOptions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            mapType: 'leaflet',
            zoomControl: true,
            mapLoadingMessage: "map.loading",
            tools: ['measurement', 'locate', 'overview', 'scalebar'],
            toolsOptions: {
                measurement: {},
                locate: {},
                overview: {
                    overviewOpt: {
                        position: 'bottomright',
                        collapsedWidth: 25,
                        collapsedHeight: 25,
                        zoomLevelOffset: -5,
                        toggleDisplay: true
                    },
                    layers: [{type: "osm"}]
                }
            }
        };
    },
    componentWillMount() {
        this.updatePlugins(this.props);
    },
    componentWillReceiveProps(newProps) {
        if (newProps.mapType !== this.props.mapType) {
            this.updatePlugins(newProps);
        }
    },
    renderLayerContent(layer) {
        if (layer.features && layer.type === "vector") {
            return layer.features.map( (feature) => {
                return (
                    <plugins.Feature
                        key={feature.id}
                        type={feature.type}
                        geometry={feature.geometry}/>
                );
            });
        }
        return null;
    },
    renderLayers() {
        const projection = this.props.map.projection || 'EPSG:3857';
        return this.props.layers.map((layer, index) => {
            const options = assign({}, layer, {srs: projection});
            return (
                <plugins.Layer type={layer.type} position={index} key={layer.id || layer.name} options={options}>
                    {this.renderLayerContent(layer)}
                </plugins.Layer>
            );
        });
    },
    renderSupportTools() {
        return this.props.tools.map((tool) => {
            const Tool = plugins.tools[tool];
            const options = this.props.toolsOptions[tool] || {};
            return <Tool key={tool} {...options}/>;
        });
    },
    render() {
        if (this.props.map) {
            return (
                <plugins.Map id="map"
                    {...this.props.map}
                    zoomControl={this.props.zoomControl}
                >
                    {this.renderLayers()}
                    {this.renderSupportTools()}
                </plugins.Map>
            );
        }
        return <div><Message msgId={this.props.mapLoadingMessage}/></div>;
    },
    updatePlugins(props) {
        plugins = require('./map/index')(props.mapType);
    }
});
const {mapSelector} = require('../selectors/map');
const {layerSelectorWithMarkers} = require('../selectors/layers');

const selector = createSelector(
    [mapSelector, layerSelectorWithMarkers], (map, layers) => ({
        map,
        layers
    })
);
module.exports = {
    MapPlugin: connect(selector)(MapPlugin),
    reducers: {}
};
