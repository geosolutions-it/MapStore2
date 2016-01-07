/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactIntl = require('react-intl');
var FormattedHTMLMessage = ReactIntl.FormattedHTMLMessage;

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
        let message = messages;
        this.props.msgId.split('.').forEach(part => {
            message = message[part];
        });
        return <FormattedHTMLMessage locales={locale} message={message} {...this.props.msgParams}/>;
    }
});
module.exports = Message;
