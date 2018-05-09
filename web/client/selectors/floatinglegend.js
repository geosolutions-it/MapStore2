/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

/**
 * selects floatinglegend state
 * @name floatinglegend
 * @memberof selectors
 * @static
 */

module.exports = {
    /**
     * Get size of floatinglegend
     * @function
     * @memberof selectors.floatinglegend
     * @param  {object} state the state
     * @return {object} size {width: 0, height: 0}
     */
    legendSizeSelector: state => state.floatinglegend && state.floatinglegend.size || {width: 0, height: 0},
    /**
     * Get expanded state of floatinglegend
     * @function
     * @memberof selectors.floatinglegend
     * @param  {object} state the state
     * @return {boolean}
     */
    legendExpandedSelector: state => state.floatinglegend && state.floatinglegend.expanded ? true : false
};
