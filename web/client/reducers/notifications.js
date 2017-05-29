/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {SHOW_NOTIFICATION, HIDE_NOTIFICATION, CLEAR_NOTIFICATIONS} = require('../actions/notifications');

function notifications(state = [], action = {}) {
    switch (action.type) {
        case SHOW_NOTIFICATION:
            const { type, ...rest } = action;
            return [
                ...state,
                { ...rest, uid: action.uid}
            ];
        case HIDE_NOTIFICATION:
            return state.filter(notification => {
                return notification.uid !== action.uid;
            });
        case CLEAR_NOTIFICATIONS:
            return [];
        default:
            return state;
    }
    return state;
}
module.exports = notifications;
