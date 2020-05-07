const PropTypes = require('prop-types');
/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Button, Glyphicon, Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../../misc/OverlayTrigger');
const defaultIcon = require('../../misc/spinners/InlineSpinner/img/spinner.gif');
const Message = require('../../I18N/Message');
require('./css/locate.css');
let checkingGeoLocation = false;
let geoLocationAllowed = false;

class LocateBtn extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        hide: PropTypes.bool,
        btnConfig: PropTypes.object,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        locate: PropTypes.string,
        onClick: PropTypes.func,
        tooltip: PropTypes.element,
        tooltipPlace: PropTypes.string,
        style: PropTypes.object,
        bsStyle: PropTypes.string,
        glyph: PropTypes.string
    };

    static defaultProps = {
        id: "locate-btn",
        onClick: () => {},
        locate: "DISABLED",
        tooltipPlace: "left",
        bsStyle: "default",
        glyph: "1-position-1",
        btnConfig: {
            className: "square-button"
        }
    };

    onClick = () => {
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
        case "PERMISSION_DENIED":
            status = "DISABLED";
            break;
        default:
            break;
        }
        this.props.onClick(status);
    };

    renderButton = () => {
        const geoLocationDisabled = this.props.locate === "PERMISSION_DENIED";
        return (
            <Button id={this.props.id} disabled={geoLocationDisabled} {...this.props.btnConfig} onClick={this.onClick} bsStyle={this.getBtnStyle()} style={this.props.style}>
                <Glyphicon glyph={this.props.glyph}/>{this.props.text}{this.props.help}
            </Button>
        );
    };

    renderLoadingButton = () => {
        let img =
            (<img src={defaultIcon} style={{
                display: 'inline-block',
                margin: '0px',
                padding: 0,
                background: 'transparent',
                border: 0
            }} alt="..." />)
        ;
        return (
            <Button id={this.props.id} onClick={this.onClick} {...this.props.btnConfig} bsStyle={this.getBtnStyle()} style={this.props.style}>
                {img}
            </Button>
        );
    };

    addTooltip = (btn) => {
        const tooltip = <Tooltip id="locate-tooltip"><Message msgId={this.props.tooltip} /></Tooltip>;
        return (
            <OverlayTrigger placement={this.props.tooltipPlace} key={`{overlay-trigger.${this.props.id}-${this.props.tooltip}}`} overlay={tooltip}>
                {btn}
            </OverlayTrigger>
        );
    };

    UNSAFE_componentWillMount() {
        if (this.props.locate !== 'PERMISSION_DENIED' && !checkingGeoLocation && !geoLocationAllowed) {
            // check if we are allowed to use geolocation feature
            checkingGeoLocation = true;
            navigator.geolocation.getCurrentPosition(() => {
                checkingGeoLocation = false;
                geoLocationAllowed = true;
            }, (error) => {
                checkingGeoLocation = false;
                if (error.code === 1) {
                    this.props.onClick("PERMISSION_DENIED");
                }
            });
        }
    }

    render() {
        var retval;
        var btn = this.props.locate === "LOCATING" ? this.renderLoadingButton() : this.renderButton();
        if (this.props.tooltip) {
            retval = this.addTooltip(btn);
        } else {
            retval = btn;
        }
        return retval;

    }

    getBtnStyle = () => {
        const {locate, bsStyle} = this.props;
        let style = bsStyle;
        if (locate === "FOLLOWING" || locate === "ENABLED") {
            style = "success active";
        }
        return style;
    };
}

module.exports = LocateBtn;
