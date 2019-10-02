const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
const HIDE_NOTIFICATION = 'HIDE_NOTIFICATION';
const CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS';
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
function show(opts = {}, level = 'success') {
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
function hide(uid) {
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
function success(opts) {
    return show(opts, 'success');
}
/**
 * Show a error notification. {@see actions.notifications.show}
 * @memberof actions.notifications
 * @param  {object} opts notification opts
 * @returns {object}     action of type `HIDE_NOTIFICATION`
 */
function error(opts) {
    return show(opts, 'error');
}

/**
 * Show a warning notification. {@see actions.notifications.show}
 * @memberof actions.notifications
 * @param  {object} opts notification opts
 * @returns {object}     action of type `HIDE_NOTIFICATION`
 */
function warning(opts) {
    return show(opts, 'warning');
}

/**
 * Show a info notification. {@see actions.notifications.show}
 * @memberof actions.notifications
 * @param  {object} opts notification opts
 * @returns {object}     action of type `HIDE_NOTIFICATION`
 */
function info(opts) {
    return show(opts, 'info');
}

/**
 * Clear all the notifications
 * @memberof actions.notifications
 * @returns {object}     action of type `CLEAR_NOTIFICATIONS`
 */
function clear() {
    return {
        type: CLEAR_NOTIFICATIONS
    };
}

/**
 * Dispatch a custom action on callback
 * @memberof actions.notifications
 * @returns {object}     action
 */
function dispatchAction(action) {
    return action;
}

/**
 * actions for notifications
 * @name notifications
 * @memberof actions
 */
module.exports = {
    SHOW_NOTIFICATION,
    HIDE_NOTIFICATION,
    CLEAR_NOTIFICATIONS,
    show,
    success,
    warning,
    error,
    info,
    hide,
    clear,
    dispatchAction
};
