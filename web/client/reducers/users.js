/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    USERMANAGER_GETUSERS
} = require('../actions/users');
const assign = require('object-assign');
function users(state = {
    start: 0,
    limit: 12
}, action) {
    switch (action.type) {
        case USERMANAGER_GETUSERS:
            return assign({}, state, {
                status: action.status,
                users: action.status === "loading" ? state.users : action.users,
                start: action.start,
                limit: action.limit,
                totalCount: action.status === "loading" ? state.totalCount : action.totalCount
            });

        default:
            return state;
    }
}
module.exports = users;
