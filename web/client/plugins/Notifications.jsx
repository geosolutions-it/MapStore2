/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {hide} = require('../actions/notifications');
const {connect} = require('react-redux');


/**
  * Notifications Plugin. Provides support to show notifications
  * @class  Notifications
  * @memberof plugins
  * @static
  * @example
  * {name: "Notifications"}
  *
  */
module.exports = {
    NotificationsPlugin: connect(
        (state) => ({ notifications: state && state.notifications}),
        {onRemove: hide}
    )(require('../components/notifications/NotificationContainer')),
    reducers: {
        notifications: require('../reducers/notifications')
    }
};
