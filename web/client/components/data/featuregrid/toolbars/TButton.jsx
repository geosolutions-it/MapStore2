/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

import { Button, Glyphicon } from 'react-bootstrap';

const hideStyle = {
    width: 0,
    padding: 0,
    borderWidth: 0
};
const normalStyle = {};
const getStyle = (visible) => visible ? normalStyle : hideStyle;
export default class SimpleTButton extends React.Component {
    propTypes = {
        disabled: PropTypes.bool,
        id: PropTypes.string,
        visible: PropTypes.bool,
        onClick: PropTypes.func,
        glyph: PropTypes.string,
        active: PropTypes.bool,
        className: PropTypes.string
    }
    defaultProps = {
        className: "square-button"
    }
    render() {
        const { disabled, id, visible, onClick, glyph, active, className = "square-button", ...props } = this.props;
        return (<Button {...props} bsStyle={active ? "success" : "primary"} disabled={disabled} id={`fg-${id}`}
            style={getStyle(visible)}
            className={className}
            onClick={() => !disabled && onClick()}>
            <Glyphicon glyph={glyph} />
        </Button>);
    }
}
