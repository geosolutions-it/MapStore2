/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPortal } from 'react-dom';

function TargetSelectorPortal({ targetSelector = '', children }) {
    const parent = targetSelector ? document.querySelector(targetSelector) : null;
    if (parent) {
        return createPortal(children, parent);
    }
    return <React.Fragment>{children}</React.Fragment>;
}

export default TargetSelectorPortal;
