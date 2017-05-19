/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { CHANGE_VERSION } = require('../actions/version');
const assign = require('object-assign');

/**
 * Manages the state of the version identifier
 * @prop {string} current version identifier
 *
 * @example
 *{
 *  current: '2017.00.04'
 *}
 * @memberof reducers
 */
function version(state = null, action) {
    switch (action.type) {
    case CHANGE_VERSION: {
        return assign({}, state,
            {
                current: action.version
            }
            );
    }
    default:
        return state;
    }
}

module.exports = version;
