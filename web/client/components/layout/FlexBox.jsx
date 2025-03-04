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
/**
 * FlexBox component with utility classes
 * @prop {string} className custom class name
 * @prop {string[]} classNames list of custom class names
 * @prop {any} component a valid component to replace the default one
 * @prop {bool} inline it makes an inline flex component
 * @prop {bool} column column direction of the flex layour
 * @prop {string} gap gap in between flex items, one of `xs`, `sm`, `md` or `lg`
 * @prop {bool} wrap it makes the flex layout wrap on the next line
 * @prop {bool} centerChildren center children vertically and horizontally
 * @prop {bool} centerChildrenHorizontally center children horizontally
 * @prop {bool} centerChildrenVertically center children vertically
 */
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
/**
 * FlexFill is a component with the fill value set to 1
 * to cover all the available space in a flex container
 * @prop {string} className custom class name
 * @prop {string[]} classNames list of custom class names
 * @prop {any} component a valid component to replace the default one
 * @prop {bool} flexBox component will be a FlexBox
 */
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
