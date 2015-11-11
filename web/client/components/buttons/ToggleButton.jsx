/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Button, Glyphicon, OverlayTrigger} = require('react-bootstrap');

var ToggleButton = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        btnConfig: React.PropTypes.object,
        text: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        glyphicon: React.PropTypes.string,
        pressed: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        tooltip: React.PropTypes.element,
        tooltipPlace: React.PropTypes.string,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            onClick: () => {},
            pressed: false,
            tooltipPlace: "top",
            style: {width: "100%"}
        };
    },
    onClick() {
        this.props.onClick(!this.props.pressed);
    },
    renderButton() {
        return (
            <Button id={this.props.id} {...this.props.btnConfig} onClick={this.onClick} bsStyle={this.props.pressed ? 'primary' : 'default'} style={this.props.style}>
                {this.props.glyphicon ? <Glyphicon glyph={this.props.glyphicon}/> : null}
                {this.props.glyphicon && this.props.text ? "\u00A0" : null}
                {this.props.text}
            </Button>
        );
    },
    addTooltip(btn) {
        return (
            <OverlayTrigger placement={this.props.tooltipPlace} key={"overlay-trigger." + this.props.id} overlay={this.props.tooltip}>
                {btn}
            </OverlayTrigger>
        );
    },
    render() {
        var retval;
        var btn = this.renderButton();
        if (this.props.tooltip) {
            retval = this.addTooltip(btn);
        } else {
            retval = btn;
        }
        return retval;

    }
});

module.exports = ToggleButton;
