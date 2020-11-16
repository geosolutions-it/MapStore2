const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Layers = require('../../../utils/leaflet/Layers');
var assign = require('object-assign');
var {isEqual} = require('lodash');

class LeafletLayer extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        type: PropTypes.string,
        srs: PropTypes.string,
        options: PropTypes.object,
        position: PropTypes.number,
        zoomOffset: PropTypes.number,
        onCreationError: PropTypes.func,
        onClick: PropTypes.func,
        securityToken: PropTypes.string
    };

    static defaultProps = {
        onCreationError: () => {},
        options: {}
    };

    componentDidMount() {
        this.valid = true;
        this.createLayer(this.props.type, this.props.options, this.props.position, this.props.securityToken);
        if (this.props.options && this.layer && this.props.options.visibility !== false) {
            this.addLayer();
            this.updateZIndex();
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        const newVisibility = newProps.options && newProps.options.visibility !== false;
        this.setLayerVisibility(newVisibility);

        const newOpacity = newProps.options && newProps.options.opacity !== undefined ? newProps.options.opacity : 1.0;
        this.setLayerOpacity(newOpacity);

        if (newProps.position !== this.props.position) {
            this.updateZIndex(newProps.position);
        }
        this.updateLayer(newProps, this.props);
    }

    shouldComponentUpdate(newProps) {
        // the reduce returns true when a prop is changed
        // optimizing when options are equal ignorning loading key
        return !["map", "type", "srs", "position", "zoomOffset", "onClick", "options", "children"].reduce( (prev, p) => {
            switch (p) {
            case "map":
            case "type":
            case "srs":
            case "position":
            case "zoomOffset":
            case "onClick":
            case "children":
                return prev && this.props[p] === newProps[p];
            case "options":
                return prev && (this.props[p] === newProps[p] || isEqual({...this.props[p], loading: false}, {...newProps[p], loading: false}));
            default:
                return prev;
            }
        }, true);
    }

    componentWillUnmount() {
        if (this.layer && this.props.map) {
            this.removeLayer();
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
        }
    }

    render() {
        if (this.props.children) {
            const layer = this.layer;
            const children = layer ? React.Children.map(this.props.children, child => {
                return child ? React.cloneElement(child, {container: layer, styleName: this.props.options && this.props.options.styleName, onClick: this.props.onClick,
                    options: this.props.options || {}}) : null;
            }) : null;
            return (
                <>
                    {children}
                </>
            );
        }
        return Layers.renderLayer(this.props.type, this.props.options, this.props.map, this.props.map.id, this.layer);

    }

    setLayerVisibility = (visibility) => {
        var oldVisibility = this.props.options && this.props.options.visibility !== false;
        if (visibility !== oldVisibility) {
            if (visibility) {
                this.addLayer();
            } else {
                this.removeLayer();
            }
            this.updateZIndex();

        }
    };

    setLayerOpacity = (opacity) => {
        var oldOpacity = this.props.options && this.props.options.opacity !== undefined ? this.props.options.opacity : 1.0;
        if (opacity !== oldOpacity && this.layer && this.layer.setOpacity) {
            this.layer.setOpacity(opacity);
        }
    };

    generateOpts = (options, position, securityToken) => {
        return assign({}, options, position ? {zIndex: position, srs: this.props.srs } : null, {
            zoomOffset: -this.props.zoomOffset,
            onError: () => {
                this.props.onCreationError(options);
            },
            securityToken
        });
    };

    updateZIndex = (position) => {
        let newPosition = position || this.props.position;
        if (newPosition && this.layer && this.layer.setZIndex) {
            this.layer.setZIndex(newPosition);
        }
    };

    createLayer = (type, options, position, securityToken) => {
        if (type) {
            const opts = this.generateOpts(options, position, securityToken);
            this.layer = Layers.createLayer(type, opts);
            if (this.layer) {
                this.layer.layerName = options.name;
                this.layer.layerId = options.id;
            }
            this.forceUpdate();
        }
    };

    updateLayer = (newProps, oldProps) => {
        const newLayer = Layers.updateLayer(newProps.type, this.layer, this.generateOpts(newProps.options, newProps.position, newProps.securityToken),
            this.generateOpts(oldProps.options, oldProps.position, oldProps.securityToken));
        if (newLayer) {
            this.removeLayer();
            this.layer = newLayer;
            this.addLayer();
        }
    };

    addLayer = () => {
        if (this.isValid()) {
            this.props.map.addLayer(this.layer);
            if (this.props.options.refresh && this.layer.setParams) {
                let counter = 0;
                this.refreshTimer = setInterval(() => {
                    this.layer.setParams(assign({}, this.props.options.params, {_refreshCounter: counter++}));
                }, this.props.options.refresh);
            }
        }
    };

    removeLayer = () => {
        if (this.isValid()) {
            this.props.map.removeLayer(this.layer);
        }
    };

    isValid = () => {
        if (this.layer) {
            const valid = Layers.isValid(this.props.type, this.layer);
            this.valid = valid;
            return valid;
        }
        return false;
    };
}

module.exports = LeafletLayer;
