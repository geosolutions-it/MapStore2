
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Glyphicon } from 'react-bootstrap';
import {ButtonWithTooltip} from '../../misc/Button';

class UndoBtn extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        btnConfig: PropTypes.object,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        onClick: PropTypes.func,
        tooltip: PropTypes.element,
        tooltipPlace: PropTypes.string,
        style: PropTypes.object,
        glyph: PropTypes.string,
        buttonStyle: PropTypes.string,
        disabled: PropTypes.bool
    };

    static defaultProps = {
        id: "undo-btn",
        onClick: () => {},
        tooltipPlace: "left",
        glyph: "1-screen-backward",
        buttonStyle: "primary",
        btnConfig: {
            className: "square-button"
        }
    };

    shouldComponentUpdate(nextProps) {
        return this.props.disabled !== nextProps.disabled;
    }

    onClick = () => {
        this.props.onClick();
    };

    render() {
        return (
            <ButtonWithTooltip
                id={this.props.id}
                disabled={this.props.disabled}
                {...this.props.btnConfig}
                onClick={this.onClick}
                bsStyle={this.props.buttonStyle}
                style={this.props.style}
                tooltip={this.props.tooltip}
                tooltipPosition={this.props.tooltipPlace}
                keyProp={"overlay-trigger." + this.props.id}
            >
                <Glyphicon glyph={this.props.glyph}/>{this.props.text}{this.props.help}
            </ButtonWithTooltip>
        );

    }
}

export default UndoBtn;
