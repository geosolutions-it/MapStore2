/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactIntl = require('react-intl');

const FormattedMessage = ReactIntl.FormattedMessage;

const LocaleUtils = require('../../utils/LocaleUtils');

var Message = React.createClass({
    propTypes: {
        locale: React.PropTypes.string,
        messages: React.PropTypes.object,
        msgId: React.PropTypes.string.isRequired,
        msgParams: React.PropTypes.object
    },
    contextTypes: {
        locale: React.PropTypes.string,
        messages: React.PropTypes.object
    },
    render() {
        var locale = this.props.locale || this.context.locale;
        var messages = this.props.messages || this.context.messages;
        let message = LocaleUtils.getMessageById(messages, this.props.msgId);

        return message ? <FormattedMessage locales={locale} message={message} {...this.props.msgParams}/> : <span/>;
    }
});

module.exports = Message;
