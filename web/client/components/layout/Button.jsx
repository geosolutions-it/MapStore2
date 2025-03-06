/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import { Button as ButtonRB } from 'react-bootstrap';

const Button = forwardRef(({
    children,
    variant,
    size,
    square,
    className,
    borderTransparent,
    ...props
}, ref) => {
    return (
        <ButtonRB
            {...props}
            className={`${square ? 'square-button-md' : ''}${className ? ` ${className}` : ''}${borderTransparent ? ' _border-transparent' : ''}`}
            ref={ref}
            bsStyle={variant}
            bsSize={size}
        >
            {children}
        </ButtonRB>
    );
});

export default Button;
