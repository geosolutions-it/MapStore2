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


/**
 * @param {node} elem the node element you want to inspect top offset
 * @returns {number} the total offset from the top
 */
export function getOffsetTop( elem ) {
    var offsetTop = 0;
    do {
        if ( !isNaN( elem?.offsetTop ) ) {
            offsetTop += elem.offsetTop;
        }
    // eslint-disable-next-line no-param-reassign, no-cond-assign
    } while ( elem = elem?.offsetParent );
    return offsetTop;
}
/**
 * @param {node} elem the node element you want to inspect bottom offset
 * @returns {number} the total offset from the bottom
 */
export const getOffsetBottom = ( element, containerClass = "container") =>{
    const container = document.getElementById(containerClass);
    return container.clientHeight - getOffsetTop(element);
};
