import React from 'react';
import Message from '../../I18N/Message';
import emptyState from '../../misc/enhancers/emptyState';

export default emptyState(
    ({text} = {}) => !text,
    ({iconFit} = {}) => ({
        iconFit,
        tooltip: <Message msgId="widgets.errors.notext" />
    })
);
