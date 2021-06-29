/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import Layers from '../../../utils/cesium/Layers';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import { getResolutions } from '../../../utils/MapUtils';

class CesiumLayer extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        type: PropTypes.string,
        options: PropTypes.object,
        onCreationError: PropTypes.func,
        position: PropTypes.number,
        securityToken: PropTypes.string,
        zoom: PropTypes.number
    };

    componentDidMount() {
        this.createLayer(this.props.type, this.props.options, this.props.position, this.props.map, this.props.securityToken);
        if (this.props.options && this.layer && this.getVisibilityOption(this.props)) {
            this.addLayer(this.props);
            this.updateZIndex();
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) {

        this.setLayerVisibility(newProps);

        const newOpacity = newProps.options && newProps.options.opacity !== undefined ? newProps.options.opacity : 1.0;
        this.setLayerOpacity(newOpacity);

        if (newProps.position !== this.props.position) {
            this.updateZIndex(newProps.position);
            if (this.provider) {
                this.provider._position = newProps.position;
            }
        }
        if (this.props.options && this.props.options.params && this.layer.updateParams && newProps.options.visibility) {
            const changed = Object.keys(this.props.options.params).reduce((found, param) => {
                if (newProps.options.params[param] !== this.props.options.params[param]) {
                    return true;
                }
                return found;
            }, false);
            if (changed) {
                const oldProvider = this.provider;
                const newLayer = this.layer.updateParams(newProps.options.params);
                this.layer = newLayer;
                this.addLayer(newProps);
                setTimeout(() => {
                    this.removeLayer(oldProvider);
                }, 1000);

            }
        }
        this.updateLayer(newProps, this.props);
    }

    componentWillUnmount() {
        if (this.layer && this.props.map && !this.props.map.isDestroyed()) {
            if (this.layer.detached) {
                this.layer.remove();
            } else {
                if (this.layer.destroy) {
                    this.layer.destroy();
                }

                this.props.map.imageryLayers.remove(this.provider);
            }
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
        }
    }

    render() {
        if (this.props.children) {
            const layer = this.layer;
            const children = layer ? React.Children.map(this.props.children, child => {
                return child ? React.cloneElement(child, {container: layer, styleName: this.props.options && this.props.options.styleName}) : null;
            }) : null;
            return (
                <>
                    {children}
                </>
            );
        }
        return Layers.renderLayer(this.props.type, this.props.options, this.props.map, this.props.map.id, this.layer);

    }

    updateZIndex = (position) => {
        const layerPos = position || this.props.position;
        const actualPos = this.props.map.imageryLayers._layers.reduce((previous, current, index) => {
            return this.provider === current ? index : previous;
        }, -1);
        let newPos = this.props.map.imageryLayers._layers.reduce((previous, current, index) => {
            return previous === -1 && layerPos < current._position ? index : previous;
        }, -1);
        if (newPos === -1) {
            newPos = actualPos;
        }
        const diff = newPos - actualPos;
        if (diff !== 0) {
            Array.apply(null, {length: Math.abs(diff)}).map(Number.call, Number)
                .forEach(() => {
                    this.props.map.imageryLayers[diff > 0 ? 'raise' : 'lower'](this.provider);
                });
        }
    };

    setLayerVisibility = (newProps) => {
        const oldVisibility = this.getVisibilityOption(this.props);
        const newVisibility = this.getVisibilityOption(newProps);
        if (newVisibility !== oldVisibility) {
            if (newVisibility) {
                this.addLayer(newProps);
                this.updateZIndex();
            } else {
                this.removeLayer();
            }
        }
    };

    getVisibilityOption = (props) => {
        // use the global resolutions as fallback
        // cesium does not provide resolutions
        const { options = {}, zoom, resolutions = getResolutions() } = props;
        const {
            visibility,
            minResolution = -Infinity,
            maxResolution = Infinity,
            disableResolutionLimits
        } = options || {};
        if (!disableResolutionLimits && !isNil(resolutions[zoom])) {
            const resolution = resolutions[zoom];
            // use similar approach of ol
            // maxResolution is exclusive
            // minResolution is inclusive
            if (!(resolution < maxResolution && resolution >= minResolution)) {
                return false;
            }
        }
        return visibility !== false;
    };

    setLayerOpacity = (opacity) => {
        var oldOpacity = this.props.options && this.props.options.opacity !== undefined ? this.props.options.opacity : 1.0;
        if (opacity !== oldOpacity && this.layer && this.provider) {
            this.provider.alpha = opacity;
        }
    };

    createLayer = (type, options, position, map, securityToken) => {
        if (type) {
            const opts = assign({}, options, position ? {zIndex: position} : null, {securityToken});
            this.layer = Layers.createLayer(type, opts, map);

            if (this.layer) {
                this.layer.layerName = options.name;
                this.layer.layerId = options.id;
            }
            if (this.layer === null) {
                this.props.onCreationError(options);
            }

        }
    };

    updateLayer = (newProps, oldProps) => {
        const newLayer = Layers.updateLayer(newProps.type, this.layer, {...newProps.options, securityToken: newProps.securityToken}, {...oldProps.options, securityToken: oldProps.securityToken}, this.props.map);
        if (newLayer) {
            this.removeLayer();
            this.layer = newLayer;
            this.addLayer(newProps);
        }
    };

    addLayerInternal = (newProps) => {
        if (newProps.options.useForElevation) {
            this.props.map.terrainProvider = this.layer;
        } else {
            this.provider = this.props.map.imageryLayers.addImageryProvider(this.layer);
            this.provider._position = this.props.position;
            if (newProps.options.opacity !== undefined) {
                this.provider.alpha = newProps.options.opacity;
            }
        }
    };

    addLayer = (newProps) => {
        if (this.layer && !this.layer.detached) {
            this.addLayerInternal(newProps);
            if (this.props.options.refresh && this.layer.updateParams) {
                let counter = 0;
                this.refreshTimer = setInterval(() => {
                    const newLayer = this.layer.updateParams(assign({}, this.props.options.params, {_refreshCounter: counter++}));
                    this.removeLayer();
                    this.layer = newLayer;
                    this.addLayerInternal(newProps);
                }, this.props.options.refresh);
            }
        }
    };

    removeLayer = (provider) => {
        const toRemove = provider || this.provider;
        if (toRemove) {
            this.props.map.imageryLayers.remove(toRemove);
        }
    };
}

export default CesiumLayer;
