import React from 'react';
import Message from '../../../components/I18N/Message';
import Spinner from 'react-spinkit';
import EmptyView from '../../../components/misc/EmptyView';
const EmptyStreetView = ({
    loading = false,
    title = <Message msgId="streetView.emptyTitle"/>,
    description = <Message msgId="streetView.emptyDescription"/>
}) => {
    return (<div className="empty-street-view" >
        <EmptyView
            iconFit={false}
            glyph="road"
            title={title}
            description={<>{loading ? <><Spinner style={{display: "inline-block", verticalAlign: "bottom"}} spinnerName="circle" noFadeIn/>&nbsp;</> : null}{description}</>}
        />
    </div>
    );
};
export default EmptyStreetView;
