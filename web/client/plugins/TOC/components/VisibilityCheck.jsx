/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import tooltip from '../../../components/misc/enhancers/tooltip';
const Button = tooltip(({ children, ...props }) => <button {...props}>{children}</button>);

/**
 * VisibilityCheck shows the checkbox or radio button to apply visibility to a node
 * @prop {boolean} hide hide the component
 * @prop {boolean} value the visibility value
 * @prop {function} onChange callback that returns the changed value on click
 * @prop {boolean} mutuallyExclusive if true change the icon from checkbox to radio button
 */
const VisibilityCheck = ({
    hide,
    value,
    onChange,
    mutuallyExclusive
}) => {

    const getIcon = () => {
        if (mutuallyExclusive) {
            return value ? 'radio-on' : 'radio-off';
        }
        return value ? 'checkbox-on' : 'checkbox-off';
    };

    if (hide) {
        return null;
    }
    return (
        <Button
            className={`ms-visibility-check${value ? ' active' : ''}`}
            onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                onChange(!value);
            }}
            onContextMenu={(event) => {
                event.stopPropagation();
            }}
        >
            <Glyphicon glyph={getIcon()} />
        </Button>
    );
};

export default VisibilityCheck;
