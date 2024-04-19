/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {Glyphicon} from 'react-bootstrap';

import defaultIcon from '../../misc/spinners/InlineSpinner/img/spinner.gif';
import {ButtonWithTooltip} from '../../misc/Button';
import('./css/locate.css');

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
            <ButtonWithTooltip
                id={this.props.id}
                disabled={geoLocationDisabled}
                {...this.props.btnConfig}
                onClick={this.onClick}
                bsStyle={this.getBtnStyle()}
                style={this.props.style}
                tooltipId={this.props.tooltip}
                tooltipPosition={this.props.tooltipPlace}
                keyProp={"overlay-trigger." + this.props.id}
            >
                <Glyphicon glyph={this.props.glyph}/>{this.props.text}{this.props.help}
            </ButtonWithTooltip>
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
            <ButtonWithTooltip
                id={this.props.id}
                onClick={this.onClick}
                {...this.props.btnConfig}
                bsStyle={this.getBtnStyle()}
                style={this.props.style}
                tooltipId={this.props.tooltip}
                tooltipPosition={this.props.tooltipPlace}
                keyProp={"overlay-trigger." + this.props.id}
            >
                {img}
            </ButtonWithTooltip>
        );
    };

    UNSAFE_componentWillMount() {
        if (this.props.locate !== 'PERMISSION_DENIED' && !checkingGeoLocation && !geoLocationAllowed) {
            // check if we are allowed to use geolocation feature
            checkingGeoLocation = true;
            if (navigator?.geolocation?.getCurrentPosition) {
                navigator.geolocation.getCurrentPosition(() => {
                    checkingGeoLocation = false;
                    geoLocationAllowed = true;
                }, (error) => {
                    checkingGeoLocation = false;
                    if (error.code === 1) {
                        this.props.onClick("PERMISSION_DENIED");
                    }
                });
            } else {
                // geolocation is deactivated in browser settings
                checkingGeoLocation = false;
                this.props.onClick("PERMISSION_DENIED");
            }

        }
    }

    render() {
        return this.props.locate === "LOCATING" ? this.renderLoadingButton() : this.renderButton();
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

export default LocateBtn;
