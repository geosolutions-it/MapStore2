const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
const HIDE_NOTIFICATION = 'HIDE_NOTIFICATION';
const CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS';

function show(opts = {}, level = 'success') {
    return {
        type: SHOW_NOTIFICATION,
        ...opts,
        uid: opts.uid || Date.now(),
        level
    };
}
function hide(uid) {
    return {
        type: HIDE_NOTIFICATION,
        uid
 };
}
function success(opts) {
    return show(opts, 'success');
}

function error(opts) {
    return show(opts, 'error');
}

function warning(opts) {
    return show(opts, 'warning');
}

function info(opts) {
    return show(opts, 'info');
}

function clear() {
    return {
        type: CLEAR_NOTIFICATIONS
    };
}
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
    clear
};
