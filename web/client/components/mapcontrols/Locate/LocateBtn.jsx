/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Button, Glyphicon, OverlayTrigger, Tooltip} = require('react-bootstrap');

var LocateBtn = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        btnConfig: React.PropTypes.object,
        pressed: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        tooltip: React.PropTypes.element,
        tooltipPlace: React.PropTypes.string,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "locate-btn",
            onClick: () => {},
            pressed: false,
            tooltipPlace: "left",
            style: {width: "100%"}
        };
    },
    onClick() {
        this.props.onClick(!this.props.pressed);
    },
    renderButton() {
        return (
            <Button id={this.props.id} {...this.props.btnConfig} onClick={this.onClick} bsStyle={this.props.pressed ? 'primary' : 'default'} style={this.props.style}>
                <Glyphicon glyph="map-marker"/>
            </Button>
        );
    },
    addTooltip(btn) {
        let tooltip = <Tooltip id="locate-tooltip">{this.props.tooltip}</Tooltip>;
        return (
            <OverlayTrigger placement={this.props.tooltipPlace} key={"overlay-trigger." + this.props.id} overlay={tooltip}>
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

module.exports = LocateBtn;
