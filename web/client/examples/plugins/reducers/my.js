/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {MY_ACTION} = require('../actions/my');

function my(state = {}, action) {
    switch (action.type) {
        case MY_ACTION: {
            return {content: action.payload};
        }
        default:
            return state;
    }
}

module.exports = my;
