/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

/**
 * selects legendaction state
 * @name legendaction
 * @memberof selectors
 * @static
 */

module.exports = {
    /**
     * Get size of legendaction
     * @function
     * @memberof selectors.legendaction
     * @param  {object} state the state
     * @return {object} size {width: 0, height: 0}
     */
    legendSizeSelector: state => state.legendaction && state.legendaction.size || {width: 0, height: 0},
    /**
     * Get expanded state of legendaction
     * @function
     * @memberof selectors.legendaction
     * @param  {object} state the state
     * @return {boolean}
     */
    legendExpandedSelector: state => state.legendaction && state.legendaction.expanded ? true : false
};
