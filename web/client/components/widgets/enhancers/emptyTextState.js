import React from 'react';
import Message from '../../I18N/Message';
import emptyState from '../../misc/enhancers/emptyState';

export default emptyState(
    ({text} = {}) => !text,
    () => ({
        iconFit: false,
        glyph: false,
        style: {
            margin: "auto"
        },
        title: <Message msgId="widgets.errors.notext" />
    })
);
