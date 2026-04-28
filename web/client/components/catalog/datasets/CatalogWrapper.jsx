/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

const CatalogWrapper = ({
    isPanel,
    active,
    dockStyle = {},
    width,
    children
}) => {
    const className = isPanel
        ? 'ms-catalog-wrapper ms-side-panel'
        : 'ms-catalog-wrapper';
    const style = isPanel
        ? {
            ...dockStyle,
            display: active ? 'block' : 'none',
            width: width
        }
        : {};
    if (!active) {
        return null;
    }
    return (
        <div className={className} style={style}>
            {children}
        </div>
    );
};

export default CatalogWrapper;
