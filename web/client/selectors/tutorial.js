/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

/**
 * selects tutorial state
 * @name tutorial
 * @memberof selectors
 * @static
 */

/**
 * selects tutorial from state
 * @memberof selectors.tutorial
 * @param  {object} state the state
 * @return {object}       the tutorial in the state
 */
const tutorialSelector = (state) => state && state.tutorial;

module.exports = {
    tutorialSelector
};
