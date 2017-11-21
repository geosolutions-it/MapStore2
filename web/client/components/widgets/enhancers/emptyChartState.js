const React = require('react');
const Message = require('../../I18N/Message');
const emptyState = require('../../misc/enhancers/emptyState');

module.exports = emptyState(
    ({data = []}) => !data || data.length === 0,
    ({mapSync, iconFit} = {}) => ({
        iconFit,
        tooltip: mapSync ? <Message msgId="widgets.errors.nodatainviewport" /> : <Message msgId="widgets.errors.nodata" />
    })
);
