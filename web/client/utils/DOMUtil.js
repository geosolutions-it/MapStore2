/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


/**
 * Utility functions for DOM
 * @memberof utils
 * @static
 * @name DOMUtils
 */


export const scrollIntoViewId = (viewId) => {
    const node = document.getElementById(viewId);
    if (node && node.scrollIntoView) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

