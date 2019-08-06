/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

/**
 * Return a class name from props of a content
 * @prop {string} theme one of 'bright', 'dark', 'dark-transparent' or 'bright-transparent'
 * @prop {string} align one of 'center', 'left' or 'right'
 * @prop {string} size one of 'full', 'large', 'medium' or 'small'
 */
const getClassNameFromProps = ({ theme = 'bright', align = 'center', size = 'full' }) => {
    const themeClassName = ` ms-${theme}`;
    const alignClassName = ` ms-align-${align}`;
    const sizeClassName = ` ms-size-${size}`;
    return `${themeClassName}${alignClassName}${sizeClassName}`;
};

/**
 * Container for all the contents. Is used to:
 *  - center the content accordingly.
 *  - Add inViewRef property, to apply IntersectionObserver
 */
export default ({ inViewRef, children, type, contentWrapperStyle, ...props }) =>
(<div
    ref={inViewRef}
    style={contentWrapperStyle}
    className={`ms-content ms-content-${type}${getClassNameFromProps(props)}`}>
        <div className="ms-content-body">
            {children}
        </div>
</div>);
