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

const FlexBox = forwardRef(({
    children,
    className,
    classNames = [],
    component = 'div',
    inline,
    column,
    gap,
    wrap,
    centerChildren,
    centerChildrenHorizontally,
    centerChildrenVertically,
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
                'ms-flex-box',
                addPrefix(inline ? 'inline-flex' : 'flex'),
                column ? addPrefix('flex-column') : undefined,
                gap ? addPrefix(`flex-gap-${gap}`) : undefined,
                wrap ? addPrefix(`flex-wrap`) : undefined,
                centerChildren || centerChildrenHorizontally ? addPrefix('flex-center-h') : undefined,
                centerChildren || centerChildrenVertically ? addPrefix(`flex-center-v`) : undefined,
                props.onClick ? addPrefix('pointer') : undefined
            ].filter(cls => cls).join(' ')}
        >
            {children}
        </Component>
    );
});

export const FlexFill = forwardRef(({
    children,
    className,
    classNames = [],
    component = 'div',
    flexBox,
    ...props
}, ref) => {
    const Component = flexBox ? FlexBox : component;
    return (
        <Component
            {...props}
            component={flexBox ? component : undefined}
            ref={ref}
            className={[
                ...classNames,
                className,
                'ms-flex-fill'
            ].filter(cls => cls).join(' ')}
        >
            {children}
        </Component>
    );
});

FlexBox.Fill = FlexFill;

export default FlexBox;
