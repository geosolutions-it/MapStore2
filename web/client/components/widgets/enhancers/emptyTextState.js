import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import Message from '../../I18N/Message';
import emptyState from '../../misc/enhancers/emptyState';

export function EmptyText({props = {}}) {
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
            <Glyphicon glyph="text-size"/>&nbsp; <Message msgId={props.tooltip?.props?.msgId || "widgets.errors.nodatainviewport"} />
        </div>
    );
}
export default emptyState(
    ({text} = {}) => !text,
    () => ({
        iconFit: false,
        glyph: false,
        style: {
            margin: "auto"
        },
        title: <Message msgId="widgets.errors.notext" />
    }),
    EmptyText
);
