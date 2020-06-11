/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const { isString } = require('lodash');

/**
 * Base map component that renders a map.
 * It is implementation independent.
 * The implementation of the layer is provided by the `plugins` property
 * @prop {string} id the id of the map div
 * @prop {object} options. Options to pass to the map component (generically constant)
 * @prop {object} map the map properties (projection...) This is generically the dynamic part of the map options.
 * @prop {object[]} layers the layers to add to the map
 * @prop {object} plugins specific implementation of the components to render.
 * Must contain implementations for:
 *  - Map React component for Map
 *  - Layer React component for Layer
 *  - Feature (optional) React component for vector Feature
 *  - tools (optional) any support tool you want to use
 * @prop {array} tools. A list of tools (string name or object with `name` and other options as attribute) to add to the map.
 * @prop {object} eventHandlers handlers for map events
 * Each tool must be implemented in plugins.tools
 *
 */
class BaseMap extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        options: PropTypes.object,
        map: PropTypes.object,
        mapStateSource: PropTypes.string,
        eventHandlers: PropTypes.object,
        styleMap: PropTypes.object,
        layers: PropTypes.array,
        hookRegister: PropTypes.object,
        projectionDefs: PropTypes.array,
        plugins: PropTypes.any,
        tools: PropTypes.array,
        getLayerProps: PropTypes.func,
        env: PropTypes.array
    };

    static defaultProps = {
        id: '__base_map__',
        options: {},
        map: {},
        styleMap: {},
        tools: [],
        projectionDefs: [],
        eventHandlers: {
            onMapViewChanges: () => {},
            onClick: () => {},
            onMouseMove: () => {},
            onLayerLoading: () => {},
            onLayerError: () => {}
        },
        env: []
    };

    getTool = (tool) => {
        const { plugins } = this.props;
        if (isString(tool)) {
            return {
                name: tool,
                impl: plugins.tools[tool]
            };
        }
        return {
            name: tool.name,
            impl: plugins.tools[tool.name],
            ...tool
        };
    };

    renderLayers = () => {
        const projection = this.props.map && this.props.map.projection || "EPSG:3857";
        const { plugins } = this.props;
        const { Layer } = plugins;
        return this.props.layers.map((layer, index) => {
            return (
                <Layer
                    type={layer.type}
                    srs={projection}
                    position={index}
                    key={layer.id || layer.name}
                    options={layer}
                    env={layer.localizedLayerStyles ? this.props.env : []}
                >
                    {this.renderLayerContent(layer, projection)}
                </Layer>
            );
        });
    };

    renderLayerContent = (layer, projection) => {
        if (layer.features && layer.type === "vector") {
            const { plugins } = this.props;
            const { Feature } = plugins;
            return layer.features.map((feature) => {
                return (
                    <Feature
                        key={feature.id}
                        msId={feature.id}
                        type={feature.type}
                        crs={projection}
                        geometry={feature.geometry}
                        features={feature.features}
                        featuresCrs={layer.featuresCrs || 'EPSG:4326'}
                        // FEATURE STYLE OVERWRITE LAYER STYLE
                        layerStyle={layer.style}
                        style={feature.style || layer.style || null}
                        properties={feature.properties} />
                );
            });
        }
        return null;
    };

    renderTools = () => {
        return this.props.tools.map((tool) => {
            const {impl: Tool, name, ...options} = this.getTool(tool);
            return <Tool key={name} {...options} />;
        });
    };

    render() {
        const {plugins} = this.props;
        const {Map} = plugins;
        const projection = this.props.map && this.props.map.projection || "EPSG:3857";
        if (this.props.map) {
            return (
                <Map
                    projectionDefs={this.props.projectionDefs}
                    style={this.props.styleMap}
                    id={this.props.id}
                    zoomControl={false}
                    center={{ x: 0, y: 0 }}
                    zoom={1}
                    hookRegister={this.props.hookRegister}
                    mapStateSource={this.props.mapStateSource || this.props.id}
                    {...this.props.options}
                    {...this.props.map}
                    projection={projection}
                    {...this.props.eventHandlers}
                >
                    {this.renderLayers()}
                    {this.renderTools()}
                </Map>
            );
        }
        return null;
    }
}


module.exports = BaseMap;
