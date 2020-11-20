/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

const hideStyle = {
    width: 0,
    padding: 0,
    borderWidth: 0
};
const normalStyle = {};
const getStyle = (visible) => visible ? normalStyle : hideStyle;

export const SimpleTButton = ({disabled, id, visible, onClick, glyph, active, className = "square-button", ...props}) => {
    return (<Button {...props} bsStyle={active ? "success" : "primary"} disabled={disabled} id={`fg-${id}`}
        style={getStyle(visible)}
        className={className}
        onClick={() => !disabled && onClick()}>
        <Glyphicon glyph={glyph}/>
    </Button>);
};


export default SimpleTButton;
