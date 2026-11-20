/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import { getSafeHref } from '../../../utils/URLUtils';

const MenuNavLink = forwardRef(({
    children,
    className,
    href,
    ...props
}, ref) => {
    return (
        <a
            {...props}
            href={getSafeHref(href) || undefined}
            ref={ref}
            className={`nav-link${className ? ` ${className}` : ''}`}
        >
            {children}
        </a>
    );
});

export default MenuNavLink;
