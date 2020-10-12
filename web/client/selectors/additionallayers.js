/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { get } from 'lodash';

/**
 * selects additionallayers state
 * @name additionallayers
 * @memberof selectors
 * @static
 */

/**
 * Return all additional layers stored in the state
 * @memberof selectors.additionallayers
 * @param  {object} state the state
 * @return {array} array of layers items eg: [{ id: 'layerId', actionType: 'override', options: {}, owner: 'myplugin' }]
 */
export const additionalLayersSelector = state => get(state, 'additionallayers') || [];
