/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';
import React from 'react';
import Layers from '../../../utils/openlayers/Layers';
import assign from 'object-assign';
import isFinite from 'lodash/isFinite';

import OverviewMap from 'ol/control/OverviewMap';

require('./overview.css');

const defaultOpt = {
    className: 'ol-overviewmap ol-custom-overviewmap',
    collapseLabel: '\u00BB',
    label: '\u00AB',
    collapsed: true,
    collapsible: true
};

export default class Overview extends React.Component {
    static displayName = 'Overview';

    static propTypes = {
        id: PropTypes.string,
        map: PropTypes.object,
        overviewOpt: PropTypes.object,
        layers: PropTypes.array
    };

    static defaultProps = {
        id: 'overview',
        overviewOpt: {},
        layers: [{type: 'osm', options: {}}]
    };

    componentDidMount() {
        let olLayers = [];
        this.props.layers.forEach((layerOpt) => {
            olLayers.push(Layers.createLayer(layerOpt.type, layerOpt.options || {}));
        });
        let opt = assign({}, defaultOpt, this.props.overviewOpt, {layers: olLayers});
        this.overview = new OverviewMap(opt);
        if (this.props.map) {
            this.overview.setMap(this.props.map);
        }
        this.box = this.overview.element.getElementsByClassName("ol-overviewmap-box").item(0);
        this.box.onmousedown = (e) => {
            this.dragstart(e);

            this.box.onmousemove = (ev) => {
                this.draggingel(ev);
            };
            this.overview.element.onmousemove = (ev) => {
                this.draggingel(ev);
            };
            this.box.onmouseup = () => {
                this.dragend();
                this.overview.element.onmousemove = null;
                this.box.onmousemove = null;
                this.box.onmouseup = null;
            };
        };
    }

    render() {
        return null;
    }

    dragstart = (event) => {
        if (!this.dragging) {
            this.dragBox = this.box.cloneNode();
            this.dragBox.setAttribute("class", "ol-overview-dargbox");
            this.dragBox.style.position = "relative";
            this.box.appendChild(this.dragBox);
            if (this.box.style.top === "") {
                this.offsetStartTop = 0;
            } else {
                this.offsetStartTop = parseInt(this.box.style.top.slice(0, -2), 10);
            }
            if (this.box.style.left === "") {
                this.offsetStartLeft = 0;
            } else {
                this.offsetStartLeft = parseInt(this.box.style.left.slice(0, -2), 10);
            }
            this.mouseStartTop = event.pageY;
            this.mouseStartLeft = event.pageX;
            this.dragging = true;
        }
    };

    draggingel = (event) => {
        if (this.dragging === true) {
            this.dragBox.style.top = this.offsetStartTop + event.pageY - this.mouseStartTop + 'px';
            this.dragBox.style.left = this.offsetStartLeft + event.pageX - this.mouseStartLeft + 'px';
            event.stopPropagation();
            event.preventDefault();
        }
    };

    dragend = () => {
        if (this.dragging === true) {
            let offset = {};
            offset.top = this.dragBox.style.top === "" ? 0 : parseInt(this.dragBox.style.top.slice(0, -2), 10);
            offset.left = this.dragBox.style.left === "" ? 0 : parseInt(this.dragBox.style.left.slice(0, -2), 10);
            this.box.removeChild(this.dragBox);
            delete this.dragBox;
            this.dragging = false;
            this.setNewExtent(offset);
        }
    };

    setNewExtent = (offset) => {
        let vWidth = this.box.offsetWidth;
        let vHeight = this.box.offsetHeight;
        let mapSize = this.props.map.getSize();
        let xMove = offset.left * Math.abs(mapSize[0] / vWidth);
        let yMove = offset.top * Math.abs(mapSize[1] / vHeight);
        xMove = isFinite(xMove) ? xMove : 0;
        yMove = isFinite(yMove) ? yMove : 0;
        let bottomLeft = [0 + xMove, mapSize[1] + yMove];
        let topRight = [mapSize[0] + xMove, 0 + yMove];
        let left = this.props.map.getCoordinateFromPixel(bottomLeft) || [0, 0];
        let top = this.props.map.getCoordinateFromPixel(topRight) || [0, 0];
        let extent = [left[0], left[1], top[0], top[1]];
        this.props.map.getView().fit(extent, mapSize, {nearest: true});
    };
}
