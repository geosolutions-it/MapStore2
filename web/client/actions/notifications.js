/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
export const HIDE_NOTIFICATION = 'HIDE_NOTIFICATION';
export const CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS';
/**
 * Show a notification
 * @memberof actions.notifications
 * @param  {Object} [opts={}]         the notification configuration. [Here the compete ref](https://github.com/igorprado/react-notification-system#creating-a-notification)
 * ```
 *  {
 *    title: "title.translation.path" // or the message directly
 *    message: "message.translation.path" // or the message directly
 *    uid: "1234" // a unique identifier (if not present, current time is used),
 *    action: {
 *      label:  "label.translation.path" // or the message directly
 *    },
 *    values: {param1: value1} // optional, used to parametrize the string
 *  }
 * ```
 * @param  {String} [level='success'] The level of the notification. (one of "success"|"warning"|"info"|"error")
 * @return {object}                   action of type `SHOW_NOTIFICATION`
 */
export function show(opts = {}, level = 'success') {
    return {
        type: SHOW_NOTIFICATION,
        ...opts,
        uid: opts.uid || Date.now(),
        level
    };
}

/**
 * Hides (removes) the notification with the id provided
 * @memberof actions.notifications
 * @param  {string|number} uid the identifier
 * @returns {object}     action of type `HIDE_NOTIFICATION`
 */
export function hide(uid) {
    return {
        type: HIDE_NOTIFICATION,
        uid
    };
}

/**
 * Show a success notification. {@see actions.notifications.show}
 * @memberof actions.notifications
 * @param  {object} opts notification opts
 * @returns {object}     action of type `HIDE_NOTIFICATION`
 */
export function success(opts) {
    return show(opts, 'success');
}
/**
 * Show a error notification. {@see actions.notifications.show}
 * @memberof actions.notifications
 * @param  {object} opts notification opts
 * @returns {object}     action of type `HIDE_NOTIFICATION`
 */
export function error(opts) {
    return show(opts, 'error');
}

/**
 * Show a warning notification. {@see actions.notifications.show}
 * @memberof actions.notifications
 * @param  {object} opts notification opts
 * @returns {object}     action of type `HIDE_NOTIFICATION`
 */
export function warning(opts) {
    return show(opts, 'warning');
}

/**
 * Show a info notification. {@see actions.notifications.show}
 * @memberof actions.notifications
 * @param  {object} opts notification opts
 * @returns {object}     action of type `HIDE_NOTIFICATION`
 */
export function info(opts) {
    return show(opts, 'info');
}

/**
 * Clear all the notifications
 * @memberof actions.notifications
 * @returns {object}     action of type `CLEAR_NOTIFICATIONS`
 */
export function clear() {
    return {
        type: CLEAR_NOTIFICATIONS
    };
}

/**
 * Dispatch a custom action on callback
 * @memberof actions.notifications
 * @returns {object}     action
 */
export function dispatchAction(action) {
    return action;
}

/**
 * actions for notifications
 * @name notifications
 * @memberof actions
 */
