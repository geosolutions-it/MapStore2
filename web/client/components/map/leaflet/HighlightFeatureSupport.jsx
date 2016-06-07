/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const HighlightFeatureSupport = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        layer: React.PropTypes.string.isRequired,
        status: React.PropTypes.oneOf(['disabled', 'enabled']),
        updateHighlighted: React.PropTypes.func,
        selectedStyle: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            status: 'disabled',
            updateHighlighted: () => {},
            selectedStyle: {
                "radius": 12,
                "weight": 4,
                "opacity": 1,
                "fillOpacity": 1,
                "color": "yellow",
                "fillColor": "red"
            }
        };
    },
    componentDidMount() {
        this._selectedFeatures = [];
        this._layer = null;
        if (this.props.status === 'enabled') {
            this.setLayer();
        }
    },
    shouldComponentUpdate(nx) {
        let pr = this.props;
        return nx.status !== pr.status || nx.layer !== pr.layer;
    },
    componentWillUpdate(np) {
        switch (np.status) {
            case "enabled": {
                this.setLayer();
                break;
            }
            case "disabled": {
                this.cleanSupport();
                break;
            }
            default:
                return;
        }
    },
    componentWillUnmount() {
        this.cleanSupport();
    },
    render() {
        return null;
    },
    setLayer() {
        if (this._layer) {
            this.cleanSupport();
        }
        let newLayer;
        this.props.map.eachLayer((l) => {
            if (l.layerId === this.props.layer) {
                newLayer = l;
            }
        }, this);
        if (newLayer !== undefined) {
            newLayer.on("click", this.featureClicked, this);
        }
        this._layer = newLayer;
    },
    featureClicked(e) {
        let layer = e.layer;
        if (e.originalEvent.shiftKey && layer) {
            let idx = this._selectedFeatures.findIndex((f) => {
                return f === layer;
            });
            if (idx !== -1) {
                this._layer.resetStyle(layer);
                this._selectedFeatures.splice(idx, 1);
                layer = null;
            }else {
                this._selectedFeatures.push(layer);
            }
        }else {
            this._selectedFeatures.map((f) => {this._layer.resetStyle(f); });
            this._selectedFeatures = (layer) ? [layer] : [];
        }
        if (layer) {
            layer.bringToFront();
            layer.setStyle(this.props.selectedStyle);
        }
        this.props.updateHighlighted(this._selectedFeatures.length);
    },
    cleanSupport() {
        if (this._layer !== null) {
            this._selectedFeatures.map((f) => {this._layer.resetStyle(f); });
            this._layer.off("click", this.featureClicked, this);
        }
        this._selectedFeatures = [];
        this._layer = null;
        this.props.updateHighlighted(this._selectedFeatures.length);
    }
});

module.exports = HighlightFeatureSupport;
