/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
/**
 * Spinner circle component, it inherits color and size from the css font rules
 * @prop {string} id html identifier
 * @prop {string} className custom class name
 * @prop {object} style custom style object
 */
function Spinner({
    id,
    className,
    style,
    children,
    ...props
}) {
    const customClassName = className ? ' ' + className : '';
    return (
        <>
            <div
                { ...props }
                id={id}
                className={`ms-spinner${customClassName}`}
                style={style}
            >
                <div />
            </div>
            {children}
        </>
    );
}

Spinner.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object
};

Spinner.defaultProps = {};

export default Spinner;
