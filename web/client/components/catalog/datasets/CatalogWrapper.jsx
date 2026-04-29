/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ResponsivePanel from '../../misc/panels/ResponsivePanel';

const CatalogWrapper = ({
    isPanel,
    active,
    dockStyle = {},
    panelStyle = {},
    width,
    children
}) => {
    if (!active) {
        return null;
    }
    if (isPanel) {
        return (
            <ResponsivePanel
                containerStyle={dockStyle}
                containerClassName="dock-container catalog-active"
                containerId="catalog-root"
                open={active}
                size={width}
                dock
                position="right"
                hideHeader
                className="ms-catalog-panel"
                style={dockStyle}
                zIndex={panelStyle?.zIndex}
            >
                {children}
            </ResponsivePanel>
        );
    }

    return (
        <div className="ms-catalog-wrapper ms-catalog-grid-wrapper">
            {children}
        </div>
    );
};

export default CatalogWrapper;
