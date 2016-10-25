/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Layers = require('../../../utils/openlayers/Layers');
var CoordinatesUtils = require('../../../utils/CoordinatesUtils');
var assign = require('object-assign');
const _ = require('lodash');

const OpenlayersLayer = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        mapId: React.PropTypes.string,
        srs: React.PropTypes.string,
        type: React.PropTypes.string,
        options: React.PropTypes.object,
        onLayerLoading: React.PropTypes.func,
        onLayerError: React.PropTypes.func,
        onLayerLoad: React.PropTypes.func,
        position: React.PropTypes.number,
        observables: React.PropTypes.array,
        onInvalid: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            observables: [],
            onLayerLoading: () => {},
            onLayerLoad: () => {},
            onLayerError: () => {},
            onInvalid: () => {}
        };
    },
    getInitialState: function() {
        return {layer: null};
    },
    componentDidMount() {
        this.valid = true;
        this.tilestoload = 0;
        this.createLayer(this.props.type, this.props.options, this.props.position);
    },
    componentWillReceiveProps(newProps) {
        const newVisibility = newProps.options && newProps.options.visibility !== false;
        this.setLayerVisibility(newVisibility);

        const newOpacity = (newProps.options && newProps.options.opacity !== undefined) ? newProps.options.opacity : 1.0;
        this.setLayerOpacity(newOpacity);

        if (newProps.position !== this.props.position && this.state.layer.setZIndex) {
            this.state.layer.setZIndex(newProps.position);
        }
        if (this.props.options) {
            this.updateLayer(newProps, this.props);
        }
    },
    componentWillUnmount() {
        if (this.state.layer && this.props.map) {
            if (this.state.layer.detached) {
                this.state.layer.remove();
            } else {
                this.props.map.removeLayer(this.state.layer);
            }
        }
    },
    render() {
        if (this.props.children) {
            const layer = this.state.layer;
            const children = layer ? React.Children.map(this.props.children, child => {
                return child ? React.cloneElement(child, {container: layer, styleName: this.props.options && this.props.options.styleName}) : null;
            }) : null;
            return (
                <noscript>
                    {children}
                </noscript>
            );
        }

        return Layers.renderLayer(this.props.type, this.props.options, this.props.map, this.props.mapId, this.state.layer);
    },
    setLayerVisibility(visibility) {
        var oldVisibility = this.props.options && this.props.options.visibility !== false;
        if (visibility !== oldVisibility && this.state.layer && this.isValid(this.state.layer)) {
            this.state.layer.setVisible(visibility);
        }
    },
    setLayerOpacity(opacity) {
        var oldOpacity = (this.props.options && this.props.options.opacity !== undefined) ? this.props.options.opacity : 1.0;
        if (opacity !== oldOpacity && this.state.layer) {
            this.state.layer.setOpacity(opacity);
        }
    },
    generateOpts(options, position, srs) {
        return assign({}, options, position ? {zIndex: position, srs} : null, {
            onError: () => {
                this.props.onInvalid(this.props.type, options);
            }
        });
    },
    createLayer(type, options, position) {
        if (type) {
            const layerOptions = this.generateOpts(options, position, CoordinatesUtils.normalizeSRS(this.props.srs));
            let layer = Layers.createLayer(type, layerOptions, this.props.map, this.props.mapId);
            if (layer && !layer.detached) {
                this.addLayer(layer, options);
            }
            this.setState({layer: layer});
        }
    },
    updateLayer(newProps, oldProps) {
        // optimization to avoid to update the layer if not necessary
        if (newProps.position === oldProps.position && newProps.srs === oldProps.srs) {
            // check if options are the same, except loading
            if (newProps.options === oldProps.options) return;
            if (_.isEqual( _.omit(newProps.options, ["loading"]), _.omit(oldProps.options, ["loading"]) ) ) {
                return;
            }
        }
        Layers.updateLayer(
            this.props.type,
            this.state.layer,
            this.generateOpts(newProps.options, newProps.position, newProps.srs),
            this.generateOpts(oldProps.options, oldProps.position, oldProps.srs),
            this.props.map,
            this.props.mapId);
    },
    addLayer(layer, options) {
        if (this.isValid(layer)) {
            this.props.map.addLayer(layer);
            layer.getSource().on('tileloadstart', () => {
                if (this.tilestoload === 0) {
                    this.props.onLayerLoading(options.id);
                    this.tilestoload++;
                } else {
                    this.tilestoload++;
                }
            });
            layer.getSource().on('tileloadend', () => {
                this.tilestoload--;
                if (this.tilestoload === 0) {
                    this.props.onLayerLoad(options.id);
                }
            });
            layer.getSource().on('tileloaderror', (event) => {
                this.tilestoload--;
                this.props.onLayerError(options.id);
                if (this.tilestoload === 0) {
                    this.props.onLayerLoad(options.id, {error: event});
                }
            });
        }
    },
    isValid(layer) {
        const valid = Layers.isValid(this.props.type, layer);
        if (this.valid && !valid) {
            this.props.onInvalid(this.props.type, this.props.options);
        }
        this.valid = valid;
        return valid;
    }
});

module.exports = OpenlayersLayer;
