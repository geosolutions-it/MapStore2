/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ol = require('openlayers');

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
                    "type": "Point",
                    "radius": 12,
                    "stroke": {
                        "width": 4,
                        "color": "yellow"
                    },
                    "fill": {
                        "color": "red"
                    }
            }
        };
    },
    componentDidMount() {
        this.createSelectInteraction();
        if (this.props.status === 'enabled') {
            this._selectInteraction.setActive(true);
        }else {
            this._selectInteraction.setActive(false);
        }
    },
    shouldComponentUpdate(nx) {
        let pr = this.props;
        return nx.status !== pr.status || nx.layer !== pr.layer;
    },
    componentWillUpdate(np) {
        switch (np.status) {
            case "enabled": {
                this.setSelectInteraction(np);
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
        this._selectInteraction.un('select', this.selectionChange, this);
        this.props.map.removeInteraction(this._selectInteraction);
        this._selectInteraction = null;
        this._style = null;
    },
    render() {
        return null;
    },
    setSelectInteraction() {
        if (!this._selectInteraction.getActive()) {
            this._selectInteraction.setActive(true);
        }
    },
    createSelectInteraction() {
        this.createStyle();
        this._selectInteraction = new ol.interaction.Select({
            layers: this.layersFilter,
            style: this._style
            });
        this._selectInteraction.on('select', this.selectionChange, this);
        this.props.map.addInteraction(this._selectInteraction);
    },
    selectionChange() {
        this.props.updateHighlighted(this._selectInteraction.getFeatures().getLength());
    },
    cleanSupport() {
        if (this._selectInteraction.getActive()) {
            this._selectInteraction.getFeatures().clear();
            this.props.updateHighlighted(0);
            this._selectInteraction.setActive(false);
        }

    },
    layersFilter(l) {
        return l.get('msId') === this.props.layer;
    },
    createStyle() {
        let sty = this.props.selectedStyle;
        let style = {
            stroke: new ol.style.Stroke( sty.stroke ? sty.stroke : {
                    color: 'blue',
                    width: 1
                }),
                fill: new ol.style.Fill(sty.fill ? sty.fill : {
                    color: 'blue'
                })
            };
        if (sty.type === "Point") {
            style = {
                    image: new ol.style.Circle({...style, radius: sty.radius || 5})
                };
        }
        this._style = new ol.style.Style(style);
    }
});

module.exports = HighlightFeatureSupport;
