/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import Select from 'ol/interaction/Select';
import {platformModifierKeyOnly} from 'ol/events/condition';
import {Style, Stroke, Fill} from 'ol/style';
import CircleStyle from 'ol/style/Circle';

export default class HighlightFeatureSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        layer: PropTypes.string.isRequired,
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

    componentDidMount() {

        this.createSelectInteraction();
        if (this.props.status === 'enabled') {
            this._selectInteraction.setActive(true);
        } else {
            this._selectInteraction.setActive(false);
        }
        if (this.props.features) {
            this.highlightFeatures(this.props.features);
        }
    }

    shouldComponentUpdate(nx) {
        let pr = this.props;
        return nx.status !== pr.status ||
            nx.layer !== pr.layer ||
            nx.status === 'update' &&
             nx.features.toString() !== pr.features.toString();
    }

    UNSAFE_componentWillUpdate(np) {
        switch (np.status) {
        case "enabled": {
            this.setSelectInteraction(np);
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
        if (this._selectInteraction) {
            this.cleanSupport();
            this._selectInteraction.un('select', this.selectionChange, this);
            this.props.map.removeInteraction(this._selectInteraction);
            this._selectInteraction = null;
            this._style = null;
        }
    }

    getLayer = () => {
        let layer;
        this.props.map.getLayers().forEach((l) => {
            if (this.layersFilter(l)) {
                layer = l;
            }
        }, this);
        return layer;
    };

    render() {
        return null;
    }

    setSelectInteraction = () => {
        if (!this._selectInteraction.getActive()) {
            this._selectInteraction.setActive(true);
        }
    };

    createSelectInteraction = () => {
        this.createStyle();
        this._selectInteraction = new Select({
            layers: this.layersFilter,
            style: this._style,
            toggleCondition: platformModifierKeyOnly
        });
        this._selectInteraction.on('select', this.selectionChange, this);
        this.props.map.addInteraction(this._selectInteraction);
    };

    selectionChange = () => {
        let newHighlighted = [];
        this._selectInteraction.getFeatures().forEach((f) => { newHighlighted.push(f.getId()); });
        this.props.updateHighlighted(newHighlighted, "");
    };

    cleanSupport = () => {
        if (this._selectInteraction && this._selectInteraction.getActive()) {
            this._selectInteraction.getFeatures().clear();
            this.props.updateHighlighted([], "");
            this._selectInteraction.setActive(false);
        }

    };

    layersFilter = (l) => {
        return this.props.layer && l.get('msId') === this.props.layer;
    };

    createStyle = () => {
        let sty = this.props.selectedStyle;
        let style = {
            stroke: new Stroke( sty.stroke ? sty.stroke : {
                color: 'blue',
                width: 1
            }),
            fill: new Fill(sty.fill ? sty.fill : {
                color: 'blue'
            })
        };
        if (sty.type === "Point") {
            style = {
                image: new CircleStyle({...style, radius: sty.radius || 5})
            };
        }
        this._style = new Style(style);
    };

    highlightFeatures = (features) => {
        let layer = this.getLayer();
        let ftColl = this._selectInteraction.getFeatures();
        ftColl.clear();
        if (layer) {
            let ft = layer.getSource().getFeatures();
            ft.map((f)=> {
                if (features.indexOf(f.getId()) !== -1) {
                    ftColl.push(f);
                }
            }, this);
        }
    };
}

