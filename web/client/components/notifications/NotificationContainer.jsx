/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const NotificationSystem = require('react-notification-system');
const PropTypes = require('prop-types');
const {injectIntl, intlShape, defineMessages} = require('react-intl');

var LocaleUtils = require('../../utils/LocaleUtils');
const Portal = require('../misc/Portal');

/**
 * Container for Notifications. Allows to display notifications by passing
 * them in the notification property
 * @class
 * @memberof components.notifications
 * @prop {object[]} notifications the notifications. Each element have this form
 * ```
 *  {
 *    title: "title.translation.path" // or the message directly
 *    message: "message.translation.path" // or the message directly
 *    uid: "1234" // a unique identifier (if not present, current time is used),
 *    action: {
 *      label:  "label.translation.path" // or the message directly
 *    },
 *    autoDismiss: 5 // Delay in seconds for the notification go away. Set this to 0 to not auto-dismiss the notification
 *    position: tr // Position of the notification. Available: tr (top right), tl (top left), tc (top center), br (bottom right), bl (bottom left), bc (bottom center),
 *    values: {...} // an object used for templating the string. if undefined the formatMessage will return the original string
 *  }
 * ```
 * @see https://github.com/igorprado/react-notification-system#creating-a-notification for othe options
 * @example
 * <NotificationContainer notifications={[{uid: 1, title: "notification", level: "success"}]} />;
 */
class NotificationContainer extends React.Component {
    static propTypes = {
        notifications: PropTypes.array,
        intl: intlShape.isRequired,
        onRemove: PropTypes.func,
        onDispatch: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        notifications: [],
        onRemove: () => {},
        onDispatch: () => {}
    };

    componentDidMount() {
        this.updateNotifications(this.props.notifications);
    }

    componentDidUpdate() {
        const {notifications} = this.props || [];
        this.updateNotifications(notifications);
    }

    render() {
        const {notifications, onRemove, ...rest} = this.props;
        return (<Portal><NotificationSystem ref="notify" { ...rest } /></Portal>);
    }

    system = () => {
        return this.refs.notify;
    };

    updateNotifications = (notifications) => {
        const notificationIds = notifications.map(notification => notification.uid);
        const systemNotifications = this.system().state.notifications || [];
        // Get all active notifications from react-notification-system
        // and remove all where uid is not found in the reducer
        systemNotifications.forEach(notification => {
            if (notificationIds.indexOf(notification.uid) < 0) {
                this.system().removeNotification(notification.uid);
            }
        });
        notifications.forEach(notification => {
            if (systemNotifications.indexOf(notification.uid) < 0) {
                let id = notification.message;
                let str = LocaleUtils.getMessageById(this.context.messages, id);
                let message;
                if (notification.values) {
                    // this add support the template string using the same library react-intl used for i18n
                    const {formatMessage} = this.props.intl;
                    message = defineMessages({
                        id,
                        defaultMessage: str
                    });
                    message = formatMessage(message, notification.values);
                } else {
                    message = str || id;
                }

                this.system().addNotification({
                    ...notification,
                    title: LocaleUtils.getMessageById(this.context.messages, notification.title) || notification.title,
                    message,
                    action: notification.action && {
                        label: LocaleUtils.getMessageById(this.context.messages, notification.action.label) || notification.action.label,
                        callback: notification.action.dispatch ? () => { this.props.onDispatch(notification.action.dispatch); } : notification.action.callback
                    },
                    onRemove: () => {
                        this.props.onRemove(notification.uid);
                        if (notification.onRemove) notification.onRemove();
                    }
                });
            }
        });
    };
}

module.exports = injectIntl(NotificationContainer);
