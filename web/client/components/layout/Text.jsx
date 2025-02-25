/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';

const addPrefix = (value) => {
    return value ? `_${value}` : undefined;
};

const Text = forwardRef(({
    children,
    className,
    classNames = [],
    component = 'div',
    fontSize,
    ellipsis,
    textAlign,
    strong,
    ...props
}, ref) => {
    const Component = component;
    return (
        <Component
            {...props}
            ref={ref}
            className={[
                ...classNames,
                className,
                'ms-text',
                fontSize ? addPrefix(`font-size-${fontSize}`) : undefined,
                ellipsis ? addPrefix('ellipsis') : undefined,
                strong ? addPrefix(`strong`) : undefined,
                textAlign ? addPrefix(textAlign) : undefined
            ].filter(cls => cls).join(' ')}
        >
            {children}
        </Component>
    );
});

export default Text;
