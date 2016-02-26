/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Button, Glyphicon, OverlayTrigger, Tooltip} = require('react-bootstrap');
const defaultIcon = require('../../misc/spinners/InlineSpinner/img/spinner.gif');

var LocateBtn = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        btnConfig: React.PropTypes.object,
        text: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        locate: React.PropTypes.string,
        onClick: React.PropTypes.func,
        tooltip: React.PropTypes.element,
        tooltipPlace: React.PropTypes.string,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "locate-btn",
            onClick: () => {},
            locate: "DISABLED",
            tooltipPlace: "left",
            style: {width: "100%"}
        };
    },
    onClick() {
        let status;
        switch (this.props.locate) {
            case "FOLLOWING":
                status = "DISABLED";
                break;
            case "ENABLED":
                status = "FOLLOWING";
                break;
            case "DISABLED":
                status = "ENABLED";
                break;
            case "LOCATING":
                status = "DISABLED";
                break;
            default:
                break;
        }
        this.props.onClick(status);
    },
    shouldComponentUpdate(nextProps) {
        return this.props.locate !== nextProps.locate;
    },
    renderButton() {
        return (
            <Button id={this.props.id} {...this.props.btnConfig} onClick={this.onClick} bsStyle={this.getBtnStyle()} style={this.props.style}>
                <Glyphicon glyph="screenshot"/>{this.props.text}
            </Button>
        );
    },
    renderLoadingButton() {
        let img = (
            <img src={defaultIcon} style={{
                display: 'inline-block',
                margin: '0px',
                padding: 0,
                background: 'transparent',
                border: 0
            }} alt="..." />
        );
        return (
            <Button id={this.props.id} onClick={this.onClick} {...this.props.btnConfig} bsStyle={this.getBtnStyle()} style={this.props.style}>
                {img}
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
        var btn = (this.props.locate === "LOCATING") ? this.renderLoadingButton() : this.renderButton();
        if (this.props.tooltip) {
            retval = this.addTooltip(btn);
        } else {
            retval = btn;
        }
        return retval;

    },
    getBtnStyle() {
        let style = "default";
        if (this.props.locate === "FOLLOWING") {
            style = "primary";
        }else if (this.props.locate === "ENABLED") {
            style = "info";
        }
        return style;
    }
});

module.exports = LocateBtn;
