const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {findIndex} = require('lodash');

class HighlightFeatureSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        layer: PropTypes.string,
        status: PropTypes.oneOf(['disabled', 'enabled', 'update']),
        updateHighlighted: PropTypes.func,
        selectedStyle: PropTypes.object,
        features: PropTypes.array
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        status: 'disabled',
        updateHighlighted: () => {},
        selectedStyle: {
            "radius": 12,
            "weight": 4,
            "opacity": 1,
            "fillOpacity": 1,
            "color": "yellow",
            "fillColor": "red"
        },
        features: []
    };

    componentDidMount() {
        this._selectedFeatures = [];
        this._layer = null;
        if (this.props.status === 'enabled') {
            this.setLayer();
        }
    }

    shouldComponentUpdate(nx) {
        let pr = this.props;
        return nx.status !== pr.status || nx.layer !== pr.layer || nx.status === 'update' && nx.features.toString() !== pr.features.toString();
    }

    UNSAFE_componentWillUpdate(np) {
        switch (np.status) {
        case "enabled": {
            this.setLayer();
            break;
        }
        case "disabled": {
            this.cleanSupport();
            break;
        }
        case "update": {
            this.highlightFeatures(np.features);
            break;
        }
        default:
            return;
        }
    }

    componentWillUnmount() {
        this.cleanSupport();
    }

    render() {
        return null;
    }

    setLayer = () => {
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
        this.highlightFeatures(this.props.features);
    };

    featureClicked = (e) => {
        let layer = e.layer;
        if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && layer) {
            let idx = findIndex(this._selectedFeatures, (f) => {
                return f === layer;
            });
            if (idx !== -1) {
                this._layer.resetStyle(layer);
                this._selectedFeatures = this._selectedFeatures.filter((l, i) => {return i !== idx; });
                layer = null;
            } else {
                this._selectedFeatures.push(layer);
            }
        } else {
            this._selectedFeatures.map((f) => {this._layer.resetStyle(f); });
            this._selectedFeatures = layer ? [layer] : [];
        }
        if (layer) {
            layer.bringToFront();
            layer.setStyle(this.props.selectedStyle);
        }
        this.props.updateHighlighted(this._selectedFeatures.map((f) => {return f.msId; }), "");
    };

    cleanSupport = () => {
        if (this._layer) {
            this._selectedFeatures.map((f) => {this._layer.resetStyle(f); });
            this._layer.off("click", this.featureClicked, this);
        }
        this._selectedFeatures = [];
        this._layer = null;
        this.props.updateHighlighted([], "");
    };

    highlightFeatures = (features) => {
        if (!this._layer) {
            this.setLayer();
        }
        this._selectedFeatures.map((f) => {this._layer.resetStyle(f); });
        this._selectedFeatures = [];
        this._layer.eachLayer((l)=> {
            if (features.indexOf(l.msId) !== -1) {
                this._selectedFeatures.push(l);
                l.bringToFront();
                l.setStyle(this.props.selectedStyle);
            }
        }, this);
    };
}

module.exports = HighlightFeatureSupport;
