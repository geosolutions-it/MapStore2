/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Layers = require('../../../utils/openlayers/Layers');
var assign = require('object-assign');

const OpenlayersLayer = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        mapId: React.PropTypes.string,
        type: React.PropTypes.string,
        options: React.PropTypes.object,
        onLayerLoading: React.PropTypes.func,
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
            onInvalid: () => {}
        };
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

        if (newProps.position !== this.props.position && this.layer.setZIndex) {
            this.layer.setZIndex(newProps.position);
        }

        if (this.props.options && this.layer && this.layer.getSource() && this.layer.getSource().updateParams) {
            let changed = false;
            if (this.props.options.params && newProps.options.params) {
                changed = Object.keys(this.props.options.params).reduce((found, param) => {
                    if (newProps.options.params[param] !== this.props.options.params[param]) {
                        return true;
                    }
                    return found;
                }, false);
            } else if (!this.props.options.params && newProps.options.params) {
                changed = true;
            }

            if (changed) {
                this.layer.getSource().updateParams(newProps.options.params);
            }
        }
    },
    componentWillUnmount() {
        if (this.layer && this.props.map) {
            if (this.layer.detached) {
                this.layer.remove();
            } else {
                this.props.map.removeLayer(this.layer);
            }
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

        return Layers.renderLayer(this.props.type, this.props.options, this.props.map, this.props.mapId, this.layer);
    },
    setLayerVisibility(visibility) {
        var oldVisibility = this.props.options && this.props.options.visibility !== false;
        if (visibility !== oldVisibility && this.layer && this.isValid()) {
            this.layer.setVisible(visibility);
        }
    },
    setLayerOpacity(opacity) {
        var oldOpacity = (this.props.options && this.props.options.opacity !== undefined) ? this.props.options.opacity : 1.0;
        if (opacity !== oldOpacity && this.layer) {
            this.layer.setOpacity(opacity);
        }
    },
    createLayer(type, options, position) {
        if (type) {
            const layerOptions = assign({}, options, position ? {zIndex: position} : null, {
                onError: () => {
                    this.props.onInvalid(this.props.type, this.props.options);
                }
            });
            this.layer = Layers.createLayer(type, layerOptions, this.props.map, this.props.mapId);
            if (this.layer && !this.layer.detached) {
                this.addLayer(options);
            }
        }
    },
    addLayer(options) {
        if (this.isValid()) {
            this.props.map.addLayer(this.layer);
            this.layer.getSource().on('tileloadstart', () => {
                if (this.tilestoload === 0) {
                    this.props.onLayerLoading(options.id);
                    this.tilestoload++;
                } else {
                    this.tilestoload++;
                }
            });
            this.layer.getSource().on('tileloadend', () => {
                this.tilestoload--;
                if (this.tilestoload === 0) {
                    this.props.onLayerLoad(options.id);
                }
            });
            this.layer.getSource().on('tileloaderror', () => {
                this.tilestoload--;
                if (this.tilestoload === 0) {
                    this.props.onLayerLoad(options.id);
                }
            });
        }
    },
    isValid() {
        const valid = Layers.isValid(this.props.type, this.layer);
        if (this.valid && !valid) {
            this.props.onInvalid(this.props.type, this.props.options);
        }
        this.valid = valid;
        return valid;
    }
});

module.exports = OpenlayersLayer;
