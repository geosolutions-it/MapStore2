/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import { Glyphicon } from 'react-bootstrap';
import Button from '../../../misc/Button';

const hideStyle = {
    width: 0,
    padding: 0,
    borderWidth: 0
};
const normalStyle = {};
const getStyle = (visible) => visible ? normalStyle : hideStyle;
export const SimpleTButton = forwardRef(({ disabled, id, visible, onClick, glyph, active, className = "square-button", ...props }, ref) => {
    return (<Button ref={ref} {...props} bsStyle={active ? "success" : "primary"} disabled={disabled} id={`fg-${id}`}
        style={getStyle(visible)}
        className={className}
        onClick={() => !disabled && onClick()}>
        <Glyphicon glyph={glyph} />
    </Button>);
});


export default SimpleTButton;
