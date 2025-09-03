/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState } from 'react';
/**
 * compute the position of top and bottom value for the panel wrappers
 * @param {string} props.headerNodeSelector optional valid query selector for the header in the page, used to set the position of the panel
 * @param {string} props.navbarNodeSelector optional valid query selector for the navbar under the header, used to set the position of the panel
 * @param {string} props.footerNodeSelector optional valid query selector for the footer in the page, used to set the position of the panel
 * @param {number} props.width container width in pixel
 * @param {number} props.height container height in pixel
 * @param {bool} props.active if true it computes the sticky top and bottom
 * @return {object} { stickyTop, stickyBottom }
 */
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
