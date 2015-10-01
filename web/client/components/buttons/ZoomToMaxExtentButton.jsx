/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { changeMapView } from '../../actions/map';

var React = require('react');
var BootstrapReact = require('react-bootstrap');
var Button = BootstrapReact.Button;
var Glyphicon = BootstrapReact.Glyphicon;


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
        glyphicon: React.PropTypes.string,
        text: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        hiddenText: React.PropTypes.bool,
        btnSize: React.PropTypes.oneOf(['large', 'medium', 'small', 'xsmall']),
        // redux store slice with map configuration (bound through connect to store at the end of the file)
        mapConfig: React.PropTypes.object,
        // redux store dispatch func
        dispatch: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            id: "mapstore-zoomtomaxextent",
            style: undefined,
            glyphicon: "resize-full",
            text: "",
            hiddenText: true,
            btnSize: 'xsmall'
        };
    },
    render() {
        return (
            <Button
                id={this.props.id}
                bsStyle="default"
                bsSize={this.props.btnSize}
                onClick={() => this.zoomToMaxExtent()}>
                {this.props.glyphicon ? <Glyphicon glyph={this.props.glyphicon}/> : ""}
                {!this.props.hiddenText && this.props.glyphicon ? "\u00A0" : ""}
                {!(this.props.hiddenText && this.props.glyphicon) ? this.props.text : ""}
            </Button>
        );
    },
    zoomToMaxExtent() {
        var mapConfig = this.props.mapConfig;
        var maxExtent = mapConfig.maxExtent;
        var bbox;

        if (maxExtent &&
            Object.prototype.toString.call(maxExtent) === '[object Array]') {
            // zoom map to the max. extent defined in the map's config
            bbox = {
                bounds: {
                    minx: maxExtent[0],
                    miny: maxExtent[1],
                    maxx: maxExtent[2],
                    maxy: maxExtent[3]
                },
                crs: mapConfig.projection,
                rotation: 0
            };
            // adapt the map view by dispatching to the corresponding action
            this.props.dispatch(changeMapView(this.props.mapConfig.center, -1,
                bbox, this.props.mapConfig.size));
        } else {
            // zoom to zoom level 1 as fallback if no max extent is defined

            // adapt the map view by dispatching to the corresponding action
            this.props.dispatch(changeMapView(this.props.mapConfig.center, 1,
                this.props.mapConfig.maxExtent, this.props.mapConfig.size));
        }

    }
});

// In addition to the state, 'connect' puts 'dispatch' in our props.
// connect Redux store slice with map configuration
module.exports = connect((state) => {
    return {
        mapConfig: state.mapConfig
    };
})(ZoomToMaxExtentButton);
