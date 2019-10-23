const PropTypes = require('prop-types');
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

class Message extends React.Component {
    static propTypes = {
        msgId: PropTypes.string.isRequired,
        msgParams: PropTypes.object
    };

    static contextTypes = {
        intl: PropTypes.object
    };

    renderFormattedMsg = ({msgId, msgParams, children}) => {
        if (children && typeof children === 'function') {
            return (<FormattedMessage id={msgId} values={msgParams}>{msg => {
                return children(msg);
            }}</FormattedMessage>);
        }
        return (<FormattedMessage id={msgId} values={msgParams} />);
    }

    renderMsg = ({msgId, children}) => {
        if (children && typeof children === 'function') {
            return children(msgId);
        }
        return (<span>{msgId || ""}</span>);
    }

    render() {
        return this.context.intl ? this.renderFormattedMsg(this.props) : this.renderMsg(this.props);
    }
}

module.exports = Message;
