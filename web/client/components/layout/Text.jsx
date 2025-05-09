/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

const addPrefix = (value) => {
    return value ? `_${value}` : undefined;
};
/**
 * Text component with utilities classes
 * @prop {string} className custom class name
 * @prop {string[]} classNames list of custom class names
 * @prop {any} component a valid component to replace the default one
 * @prop {string} fontSize one of `sm`, `md`, `lg`, `xl` or `xxl`
 * @prop {bool} ellipsis if true it applies ellipsis when text overflows
 * @prop {string} textAlign one of `left`, `right` or `center`
 * @prop {bool} strong if true it applies strong style
 */
const Text = ({
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
};

Text.propsTypes = {
    className: PropTypes.string,
    classNames: PropTypes.array,
    fontSize: PropTypes.string,
    ellipsis: PropTypes.bool,
    textAlign: PropTypes.string,
    strong: PropTypes.bool,
    component: PropTypes.any
};

Text.defaultProps = {
    classNames: [],
    component: 'div'
};

export default forwardRef(Text);
