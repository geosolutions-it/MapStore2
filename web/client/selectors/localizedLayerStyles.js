/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {get} = require('lodash');

/**
 * selects localizedLayerStyles state
 * @name localizedLayerStyles
 * @memberof selectors
 * @static
 */

/**
 * selects localizedLayerStyles name from state
 * @memberof selectors.localizedLayerStyles
 * @param  {object} state the state
 * @return {string} the localizedLayerStyles param name
 */
const localizedLayerStylesNameSelector = (state) => get(state, 'localConfig.localizedLayerStyles.name', '');

module.exports = {
    localizedLayerStylesNameSelector
};
