const React = require('react');
const Message = require('../../I18N/Message').default;
const emptyState = require('../../misc/enhancers/emptyState');

module.exports = emptyState(
    ({text} = {}) => !text,
    ({iconFit} = {}) => ({
        iconFit,
        tooltip: <Message msgId="widgets.errors.notext" />
    })
);
