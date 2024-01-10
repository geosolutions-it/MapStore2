import React from 'react';
import Message from '../../../components/I18N/Message';

import EmptyView from '../../../components/misc/EmptyView';
const EmptyStreetView = () => {
    return (<div className="empty-street-view" style={{
        overflow: "hidden"
    }}>
        <EmptyView
            iconFit={false}
            glyph="road"
            title={<Message msgId="streetView.emptyTitle"/>}
            description={<Message msgId="streetView.emptyDescription"/>}
        />
    </div>
    );
};
export default EmptyStreetView;
