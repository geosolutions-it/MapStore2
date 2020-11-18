import React from 'react';
import Message from '../../I18N/Message';
import emptyState from '../../misc/enhancers/emptyState';

export default emptyState(
    ({data = []}) => !data || data.length === 0,
    ({mapSync, iconFit} = {}) => ({
        iconFit,
        tooltip: mapSync ? <Message msgId="widgets.errors.nodatainviewport" /> : <Message msgId="widgets.errors.nodata" />
    })
);
