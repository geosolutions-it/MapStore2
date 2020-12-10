/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import classnames from 'classnames';

export default (Wrapped) => React.forwardRef(({disabled, className, onClick = () => {}, ...props}, ref) => {
    return (
        <Wrapped ref={ref} className={disabled ? classnames('disabled', className) : className}
            onClick={(...args) => {
                if (!disabled) {
                    onClick(...args);
                }
            }}
            {...props}>
            {props.children}
        </Wrapped>
    );
});
