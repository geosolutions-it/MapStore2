/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
const PropTypes = require('prop-types');
var {Button, Glyphicon} = require('react-bootstrap');

const OverlayTrigger = require('../misc/OverlayTrigger');

var ImageButton = require('./ImageButton');

/**
 * Toggle button with tooltip and icons or image support.
 * @memberof components.buttons
 * @class
 * @prop {string} [id] an id for the html component
 * @prop {object} [btnConfig] the configuration to pass to the bootstrap button
 * @prop {object} [options] the options to send when toggle is clicked
 * @prop {string|element} [text] the text to disaplay
 * @prop {string|element} [help] the help text
 * @prop {string} glyphicon the icon name
 * @prop {bool} pressed the status of the button
 * @prop {function} onClick. The method to call when clicked. the method will return as parameter the toggled `pressed` prop and the `options` object
 * @prop {node} [tooltip] the tooltip to use on mouse hover
 * @prop {string} [tooltipPlace] positon of the tooltip, one of: 'top', 'right', 'bottom', 'left'
 * @prop {object} css style object for the component
 * @prop {btnType} [btnType] one of 'normal', 'image'
 * @prop {string} image if type is 'image', the src of the image
 * @prop {string} pressedStyle the bootstrap style for pressedStyle
 * @prop {string} defaultStyle the bootstrap style when not pressed
 *
 */
class ToggleButton extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        btnConfig: PropTypes.object,
        options: PropTypes.object,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        glyphicon: PropTypes.string,
        pressed: PropTypes.bool,
        onClick: PropTypes.func,
        tooltip: PropTypes.element,
        tooltipPlace: PropTypes.string,
        style: PropTypes.object,
        btnType: PropTypes.oneOf(['normal', 'image']),
        image: PropTypes.string,
        pressedStyle: PropTypes.string,
        defaultStyle: PropTypes.string
    };

    static defaultProps = {
        onClick: () => {},
        options: {},
        pressed: false,
        tooltipPlace: "top",
        style: {},
        btnType: 'normal',
        pressedStyle: 'primary',
        defaultStyle: 'default'
    };

    onClick = () => {
        this.props.onClick(!this.props.pressed, this.props.options);
    };

    renderNormalButton = () => {
        return (
            <Button id={this.props.id} {...this.props.btnConfig} onClick={this.onClick} bsStyle={this.props.pressed ? this.props.pressedStyle : this.props.defaultStyle} style={this.props.style}>
                {this.props.glyphicon ? <Glyphicon glyph={this.props.glyphicon}/> : null}
                {this.props.glyphicon && this.props.text && !React.isValidElement(this.props.text) ? "\u00A0" : null}
                {this.props.text}
                {this.props.help}
            </Button>
        );
    };

    renderImageButton = () => {
        return (
            <ImageButton id={this.props.id} image={this.props.image} onClick={this.onClick} style={this.props.style}/>
        );
    };

    addTooltip = (btn) => {
        return (
            <OverlayTrigger placement={this.props.tooltipPlace} key={"overlay-trigger." + this.props.id} overlay={this.props.tooltip}>
                {btn}
            </OverlayTrigger>
        );
    };

    render() {
        var retval;
        var btn = this.props.btnType === 'normal' ? this.renderNormalButton() : this.renderImageButton();
        if (this.props.tooltip) {
            retval = this.addTooltip(btn);
        } else {
            retval = btn;
        }
        return retval;

    }
}

module.exports = ToggleButton;
