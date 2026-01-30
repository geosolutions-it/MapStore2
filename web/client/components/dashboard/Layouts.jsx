import React from 'react';
import LoadingSpinner from '../misc/LoadingSpinner';
import Message from '../I18N/Message';
import FlexBox from '../layout/FlexBox';
import WidgetsView from '../widgets/view/WidgetsView';
import useLoadDashboardData from './hooks/useLoadDashboardData';
import EmptyView from '../misc/EmptyView';

export default function Layouts({ selectedLayout, layoutsData, ...props }) {
    const [isLoading, error] = useLoadDashboardData({ props, dashboard: selectedLayout.dashboard });

    const filteredProps = {...props};
    if (props.widgets) {
        filteredProps.widgets = props.widgets.filter(widget => widget.layoutId === props.selectedLayoutId);
    }

    if (error) {
        return (
            <div style={{ margin: "auto", fontWeight: 'bold' }} >
                <EmptyView title={<Message msgId={error.messageId} />} />
            </div>
        );
    }

    return isLoading
        ? (
            <div style={{ margin: "auto", fontWeight: 'bold' }} >
                <LoadingSpinner style={{ display: "inline-block", verticalAlign: "middle" }}/>
                <Message msgId="loading" />
            </div>
        )
        : (
            <FlexBox.Fill classNames={["_relative", "_overflow-auto"]}>
                <WidgetsView
                    {...filteredProps}
                    layouts={layoutsData}
                    canEdit={selectedLayout.dashboard ? false : props.canEdit}
                />
            </FlexBox.Fill>
        );


}
