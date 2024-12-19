/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState } from 'react';

const useResourcePanelWrapper = ({
    headerNodeSelector,
    navbarNodeSelector,
    footerNodeSelector,
    width,
    height,
    active
}) => {

    const [stickyTop, setStickyTop] = useState(0);
    const [stickyBottom, setStickyBottom] = useState(0);

    useEffect(() => {
        if (active) {
            const header = headerNodeSelector ? document.querySelector(headerNodeSelector) : null;
            const navbar = navbarNodeSelector ? document.querySelector(navbarNodeSelector) : null;
            const footer = footerNodeSelector ? document.querySelector(footerNodeSelector) : null;
            const { height: headerHeight = 0 } = header?.getBoundingClientRect() || {};
            const { height: navbarHeight = 0 } = navbar?.getBoundingClientRect() || {};
            const { height: footerHeight = 0 } = footer?.getBoundingClientRect() || {};
            setStickyTop(headerHeight + navbarHeight);
            setStickyBottom(footerHeight);
        }
    }, [width, height, active]);

    return {
        stickyTop,
        stickyBottom
    };
};

export default useResourcePanelWrapper;
