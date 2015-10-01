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
        btnSize: React.PropTypes.oneOf(['large', 'medium', 'small', 'xsmall'])
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
                bsSize={this.props.btnSize}>
                {this.props.glyphicon ? <Glyphicon glyph={this.props.glyphicon}/> : ""}
                {!this.props.hiddenText && this.props.glyphicon ? "\u00A0" : ""}
                {!(this.props.hiddenText && this.props.glyphicon) ? this.props.text : ""}
            </Button>
        );
    }
});



module.exports = ZoomToMaxExtentButton;
