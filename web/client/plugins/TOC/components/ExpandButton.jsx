/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';

function ExpandButton({
    hide,
    expanded,
    disabled,
    onChange
}) {

    if (hide) {
        return null;
    }

    return (
        <button
            className="ms-node-expand"
            onClick={(event) => {
                event.stopPropagation();
                if (!disabled) {
                    onChange({ expanded: !expanded });
                }
            }}
            disabled={disabled}
        >
            <Glyphicon glyph={expanded ? "bottom" : 'next'} />
        </button>
    );
}

export default ExpandButton;
