/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var BootstrapReact = require('react-bootstrap');
var Button = BootstrapReact.Button;
var Glyphicon = BootstrapReact.Glyphicon;
var ImageButton = require('./ImageButton');

const mapUtils = require('../../utils/MapUtils');
const configUtils = require('../../utils/ConfigUtils');


/**
 * A button to zoom to max. extent of the map or zoom level one.
 * Component's properies:
 *  - id: {string}            custom identifier for this component
 *  - style: {object}         a css-like hash to define the style on the component
 *  - glyphicon: {string}     bootstrap glyphicon name
 *  - text: {string|element}  text content for the button
 *  - btnSize: {string}       bootstrap button size ('large', 'small', 'xsmall')
 */
var ZoomToMaxExtentButton = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        style: React.PropTypes.object,
        image: React.PropTypes.string,
        glyphicon: React.PropTypes.string,
        text: React.PropTypes.string,
        btnSize: React.PropTypes.oneOf(['large', 'medium', 'small', 'xsmall']),
        mapConfig: React.PropTypes.object,
        actions: React.PropTypes.shape({
            changeMapView: React.PropTypes.func,
            changeHelpText: React.PropTypes.func
        }),
        btnType: React.PropTypes.oneOf(['normal', 'image']),
        helpEnabled: React.PropTypes.bool,
        helpText: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            id: "mapstore-zoomtomaxextent",
            style: undefined,
            glyphicon: "resize-full",
            text: undefined,
            btnSize: 'xsmall',
            btnType: 'normal'
        };
    },
    render() {
        if (this.props.btnType === 'normal') {
            return (
                <Button
                    id={this.props.id}
                    bsStyle="default"
                    bsSize={this.props.btnSize}
                    onClick={() => this.zoomToMaxExtent()}>
                    {this.props.glyphicon ? <Glyphicon glyph={this.props.glyphicon}/> : null}
                    {this.props.glyphicon && this.props.text ? "\u00A0" : null}
                    {this.props.text}
                </Button>
            );
        }
        return (
            <ImageButton
                id={this.props.id}
                image={this.props.image}
                onClick={() => this.zoomToMaxExtent()}
                style={this.props.style}/>
        );
    },
    zoomToMaxExtent() {
        var mapConfig = this.props.mapConfig;
        var maxExtent = mapConfig.maxExtent;
        var mapSize = this.props.mapConfig.size;
        var newZoom = 1;
        var newCenter = this.props.mapConfig.center;
        var proj = this.props.mapConfig.projection || "EPSG:3857";

        if (maxExtent &&
            Object.prototype.toString.call(maxExtent) === '[object Array]') {
            // zoom by the max. extent defined in the map's config
            newZoom = mapUtils.getZoomForExtent(maxExtent, mapSize, 0, 21);

            // center by the max. extent defined in the map's config
            newCenter = mapUtils.getCenterForExtent(maxExtent, proj);

            // do not reproject for 0/0
            if (newCenter.x !== 0 || newCenter.y !== 0) {
                // reprojects the center object
                newCenter = configUtils.getCenter(newCenter, "EPSG:4326");
            }

        }

        // adapt the map view by calling the corresponding action
        this.props.actions.changeMapView(newCenter, newZoom,
            this.props.mapConfig.bbox, this.props.mapConfig.size, null, this.props.mapConfig.projection);
    }
});

module.exports = ZoomToMaxExtentButton;
