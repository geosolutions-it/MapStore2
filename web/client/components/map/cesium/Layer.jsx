/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Layers = require('../../../utils/cesium/Layers');
var assign = require('object-assign');

const CesiumLayer = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        type: React.PropTypes.string,
        options: React.PropTypes.object,
        position: React.PropTypes.number
    },
    componentDidMount() {
        this.createLayer(this.props.type, this.props.options, this.props.position);
        if (this.props.options && this.layer && this.props.options.visibility !== false) {
            this.addLayer();
            // this.updateZIndex();
        }
    },
    componentWillReceiveProps(newProps) {
        const newVisibility = newProps.options && newProps.options.visibility !== false;
        this.setLayerVisibility(newVisibility);

        const newOpacity = (newProps.options && newProps.options.opacity !== undefined) ? newProps.options.opacity : 1.0;
        this.setLayerOpacity(newOpacity);

        if (newProps.position !== this.props.position) {
            this.updateZIndex(newProps.position - (this.props.position || 0));
        }
        this.updateLayer(newProps, this.props);
    },
    componentWillUnmount() {
        if (this.layer && this.props.map) {
            this.props.map.imageryLayers.remove(this.layer);
        }
    },
    render() {
        if (this.props.children) {
            const layer = this.layer;
            const children = layer ? React.Children.map(this.props.children, child => {
                return child ? React.cloneElement(child, {container: layer, styleName: this.props.options && this.props.options.styleName}) : null;
            }) : null;
            return (
                <noscript>
                    {children}
                </noscript>
            );
        }
        return Layers.renderLayer(this.props.type, this.props.options, this.props.map, this.props.map.id, this.layer);

    },
    updateZIndex(diff) {
        if (diff !== 0) {
            Array.apply(null, {length: Math.abs(diff)}).map(Number.call, Number)
                .forEach(() => {
                    this.props.map.imageryLayers[diff > 0 ? 'raise' : 'lower'](this.provider);
                });
        }
    },
    setLayerVisibility(visibility) {
        var oldVisibility = this.props.options && this.props.options.visibility !== false;
        if (visibility !== oldVisibility) {
            if (visibility) {
                this.addLayer();
            } else {
                this.removeLayer();
            }
            // this.updateZIndex();
        }
    },
    setLayerOpacity(opacity) {
        var oldOpacity = (this.props.options && this.props.options.opacity !== undefined) ? this.props.options.opacity : 1.0;
        if (opacity !== oldOpacity && this.layer) {
            this.provider.alpha = opacity;
        }
    },
    createLayer(type, options, position) {
        if (type) {
            const opts = assign({}, options, position ? {zIndex: position} : null);
            this.layer = Layers.createLayer(type, opts);
            if (this.layer) {
                this.layer.layerName = options.name;
                this.layer.layerId = options.id;
            }
        }
    },
    updateLayer(newProps, oldProps) {
        Layers.updateLayer(newProps.type, this.layer, newProps.options, oldProps.options);
    },
    addLayer() {
        if (this.layer) {
            this.provider = this.props.map.imageryLayers.addImageryProvider(this.layer);
            if (this.props.options.opacity) {
                this.provider.alpha = this.props.options.opacity;
            }
        }
    },
    removeLayer() {
        if (this.provider) {
            this.props.map.imageryLayers.remove(this.provider);
        }
    }
});

module.exports = CesiumLayer;
