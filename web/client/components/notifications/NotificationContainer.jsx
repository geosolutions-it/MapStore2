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

var LocaleUtils = require('../../utils/LocaleUtils');

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
 *    }
 *  }
 * ```
 * @see https://github.com/igorprado/react-notification-system#creating-a-notification for othe options
 * @example
 * <NotificationContainer notifications={[{uid: 1, title: "notification", level: "success"}]} />;
 */
class NotificationContainer extends React.Component {
    static propTypes = {
        notifications: PropTypes.array,
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
        return (<NotificationSystem ref="notify" { ...rest } />);
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
                this.system().addNotification({
                  ...notification,
                  title: LocaleUtils.getMessageById(this.context.messages, notification.title) || notification.title,
                  message: LocaleUtils.getMessageById(this.context.messages, notification.message) || notification.message,
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

module.exports = NotificationContainer;
