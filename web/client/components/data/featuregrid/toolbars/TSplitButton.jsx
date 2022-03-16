/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {forwardRef} from 'react';
import {SplitButton} from 'react-bootstrap';
import classNames from 'classnames';


import './TSplitButton.less';

export const SimpleTButton = forwardRef(({ disabled, id, visible, onClick, glyph, active, className = "square-button-md", children, ...props }, ref) => {
    if (!visible) return false;
    return (<SplitButton ref={ref} {...props} bsStyle={active ? "success" : "primary"} disabled={disabled} id={`fg-${id}`}
        className={classNames({
            'split-button': true,
            [className]: true
        })}
        onClick={() => !disabled && onClick()}
    >
        {children}
    </SplitButton>
    );
});


export default SimpleTButton;
