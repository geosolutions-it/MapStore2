import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import Message from '../../I18N/Message';
import emptyState from '../../misc/enhancers/emptyState';

export function EmptyChartState({props = {}}) {
    return (
        <div
            id="empty_chart_componet"
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
            <Glyphicon glyph="stats"/>&nbsp; <Message msgId={props.tooltip?.props?.msgId || "widgets.errors.nodatainviewport"} />
        </div>
    );
}
export default emptyState(
    ({data = []}) => !data || data.length === 0,
    ({mapSync, iconFit} = {}) => ({
        iconFit,
        tooltip: mapSync ? <Message msgId="widgets.errors.nodatainviewport" /> : <Message msgId="widgets.errors.nodata" />
    }),
    EmptyChartState
);
