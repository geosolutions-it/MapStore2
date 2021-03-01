import React from 'react';
import Message from '../../I18N/Message';
import emptyState from '../../misc/enhancers/emptyState';
import EmptyView from '../../misc/EmptyView';

export default emptyState(
    ({data = []}) => !data || data.length === 0,
    ({mapSync, iconFit} = {}) => ({
        iconFit,
        tooltip: mapSync ? <Message msgId="widgets.errors.nodatainviewport" /> : <Message msgId="widgets.errors.nodata" />
    }),
    () => <EmptyView content={<Message msgId="widgets.errors.nodatainviewport" />}/>
);
