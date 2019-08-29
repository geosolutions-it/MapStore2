/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


/**
 * Collection of tool to work on DOM
 */
const DOMUtil = {
    scrollIntoViewId: (viewId) => {
        const node = document.getElementById(viewId);
        if (node && node.scrollIntoView) {
            node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};
module.exports = DOMUtil;
