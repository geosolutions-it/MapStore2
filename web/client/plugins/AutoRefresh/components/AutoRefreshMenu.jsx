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
                right: 0,
                padding: '10px',
                minWidth: '200px',
                maxHeight: "calc(100vh / 2)",
                overflowY: "auto",
                zIndex: 9999
            }}>
            {props.children}
        </div>
    );
});

export default AutoRefreshMenu;
