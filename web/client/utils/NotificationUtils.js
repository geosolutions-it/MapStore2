const {error, success} = require('../actions/notifications');


module.exports = {

    basicError: ({ title = "notification.warning", autoDismiss = 6, position = "tc", message = "Error" } = {}) =>
        error({ title, autoDismiss, position, message }),
    basicSuccess: ({ title = "notification.success", autoDismiss = 6, position = "tc", message = "Success" } = {}) =>
        success({ title, autoDismiss, position, message })
};
