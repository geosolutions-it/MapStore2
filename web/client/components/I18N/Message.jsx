/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactIntl = require('react-intl');
var FormattedMessage = ReactIntl.FormattedMessage;

var I18NStore = require('../../stores/I18NStore');

var Message = React.createClass({
    propTypes: {
        msgId: React.PropTypes.string.isRequired,
        msgParams: React.PropTypes.object
    },
    getInitialState() {
        const currentLocale = I18NStore.getCurrentLocale();
        const msg = I18NStore.getMsgById(this.props.msgId);
        return {
            locales: currentLocale,
            msg: msg
        };
    },
    // it makes this component reactive when a new language is loaded in
    // language store.
    componentDidMount() {
        I18NStore.register(I18NStore.Event.LANG_CHANGED, this.onLangChanged);
    },
    componentWillUnmount() {
        I18NStore.unregister(I18NStore.Event.LANG_CHANGED, this.onLangChanged);
    },
    // it updates the state of this component when the language store loads a new one.
    onLangChanged() {
        const currentLocale = I18NStore.getCurrentLocale();
        const msg = I18NStore.getMsgById(this.props.msgId);
        this.setState({
            locales: currentLocale,
            msg: msg
        });
    },
    render() {
        return <FormattedMessage locales={this.state.locales} message={this.state.msg} {...this.props.msgParams}/>;
    }
});

module.exports = Message;
