/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { Glyphicon, Tooltip } from 'react-bootstrap';
import Button from '../misc/Button';
import OverlayTrigger from '../misc/OverlayTrigger';
import { getZoomForExtent, getCenterForExtent, getBbox } from '../../utils/MapUtils';
import { getCenter } from '../../utils/ConfigUtils';


/**
 * A button to zoom to max. extent of the map or zoom level one.
 * Component's properies:
 *  - id: {string}            custom identifier for this component
 *  - style: {object}         a css-like hash to define the style on the component
 *  - glyphicon: {string}     bootstrap glyphicon name
 *  - text: {string|element}  text content for the button
 *  - btnSize: {string}       bootstrap button size ('large', 'small', 'xsmall')
 */
class ZoomToMaxExtentButton extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        image: PropTypes.string,
        glyphicon: PropTypes.string,
        text: PropTypes.string,
        btnSize: PropTypes.oneOf(['large', 'small', 'xsmall']),
        mapConfig: PropTypes.object,
        mapInitialConfig: PropTypes.object,
        changeMapView: PropTypes.func,
        btnType: PropTypes.oneOf(['normal', 'image']),
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        tooltip: PropTypes.element,
        tooltipPlace: PropTypes.string,
        className: PropTypes.string,
        useInitialExtent: PropTypes.bool,
        bsStyle: PropTypes.string,
        style: PropTypes.object
    };

    static defaultProps = {
        id: "mapstore-zoomtomaxextent",
        glyphicon: "resize-full",
        text: undefined,
        btnSize: 'xsmall',
        btnType: 'normal',
        useInitialExtent: false,
        tooltipPlace: "left",
        bsStyle: "default",
        className: "square-button"
    };

    render() {
        return this.addTooltip(
            <Button
                id={this.props.id}
                style={this.props.style}
                bsSize={this.props.btnSize}
                onClick={() => this.props.useInitialExtent ? this.zoomToInitialExtent() : this.zoomToMaxExtent()}
                className={this.props.className}
                bsStyle={this.props.bsStyle}
            >
                {this.props.glyphicon ? <Glyphicon glyph={this.props.glyphicon}/> : null}
                {this.props.glyphicon && this.props.text ? "\u00A0" : null}
                {this.props.text}
                {this.props.help}
            </Button>
        );
    }

    addTooltip = (btn) => {
        let tooltip = <Tooltip id="locate-tooltip">{this.props.tooltip}</Tooltip>;
        return (
            <OverlayTrigger placement={this.props.tooltipPlace} key={"overlay-trigger." + this.props.id} overlay={tooltip}>
                {btn}
            </OverlayTrigger>
        );
    };

    zoomToMaxExtent = () => {
        var mapConfig = this.props.mapConfig;
        var maxExtent = mapConfig.maxExtent;
        var mapSize = this.props.mapConfig.size;
        var newZoom = 1;
        var newCenter = this.props.mapConfig.center;
        var proj = this.props.mapConfig.projection || "EPSG:3857";

        if (maxExtent &&
            Object.prototype.toString.call(maxExtent) === '[object Array]') {
            // zoom by the max. extent defined in the map's config
            newZoom = getZoomForExtent(maxExtent, mapSize, 0, 21);

            // center by the max. extent defined in the map's config
            newCenter = getCenterForExtent(maxExtent, proj);

            // do not reproject for 0/0
            if (newCenter.x !== 0 || newCenter.y !== 0) {
                // reprojects the center object
                newCenter = getCenter(newCenter, "EPSG:4326");
            }

        }

        // we compute the new bbox
        let bbox = getBbox(newCenter, newZoom, mapSize);

        // adapt the map view by calling the corresponding action
        this.props.changeMapView(newCenter, newZoom, bbox, this.props.mapConfig.size, null, this.props.mapConfig.projection);
    };

    zoomToInitialExtent = () => {
        // zooming to the initial extent based on initial map configuration
        var mapConfig = this.props.mapInitialConfig;
        let bbox = getBbox(mapConfig.center, mapConfig.zoom, this.props.mapConfig.size);
        this.props.changeMapView(mapConfig.center, mapConfig.zoom, bbox, this.props.mapConfig.size, null, this.props.mapConfig.projection);
    };
}

export default ZoomToMaxExtentButton;
