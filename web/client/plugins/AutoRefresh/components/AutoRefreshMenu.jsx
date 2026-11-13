/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

const AutoRefreshMenu = React.forwardRef((props, ref) => {
    return (
        <div
            ref={ref}
            className="dropdown-menu"
            style={{
                left: 'auto',
                right: props.sidebar ? '100%' : 0,
                top: props.sidebar ? 0 : 'auto',
                padding: '10px',
                minWidth: '200px',
                maxWidth: 'calc(100vw - 48px)',
                maxHeight: "calc(70vh)",
                overflowY: "visible",
                zIndex: 9999
            }}>
            {props.children}
        </div>
    );
});

export default AutoRefreshMenu;
