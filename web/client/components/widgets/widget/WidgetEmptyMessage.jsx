import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import {PropTypes} from 'prop-types';
import Message from '../../I18N/Message';


function WidgetEmptyMessage({ glyph = 'info-sign', messageId, className = 'ms-widget-empty-message'}) {
    return (<div className={className}>
        <Glyphicon glyph={glyph}/>&nbsp; <Message msgId={messageId} />
    </div>);
}

WidgetEmptyMessage.propTypes = {
    messageId: PropTypes.string,
    className: PropTypes.string,
    glyph: PropTypes.string
};
export default WidgetEmptyMessage;
