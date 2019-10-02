/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {SHOW_NOTIFICATION, HIDE_NOTIFICATION, CLEAR_NOTIFICATIONS} = require('../actions/notifications');
/**
 * Manages the notifications.
 * @memberof reducers
 * @param  {Array}  [state=[]]  the notifications array
 * @param  {Object} [action={}] the action. can be `SHOW_NOTIFICATION`, `HIDE_NOTIFICATION` or `CLEAR_NOTIFICATIONS`
 * @return {Array}              the modified state
 * @example
 * [{
 *  uid: 1234,
 *  title: "My Notification",
 *  level: "success",
 *  action: {
 *      "label": "I Agree"
 *  }
 * }]
 */
function notifications(state = [], action = {}) {
    switch (action.type) {
    case SHOW_NOTIFICATION:
        const { type, ...rest } = action;
        return [
            ...state,
            { ...rest}
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
}
module.exports = notifications;
