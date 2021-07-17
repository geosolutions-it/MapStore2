import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import {PropTypes} from 'prop-types';
import Message from '../../I18N/Message';


function WidgetEmptyMessage({ glyph = 'info-sign', messageId, msgParams = {}}) {
    return (<div className="ms-widget-empty-message">
        <Glyphicon glyph={glyph}/>&nbsp; <Message msgId={messageId} msgParams={msgParams}/>
    </div>);
}

WidgetEmptyMessage.propTypes = {
    messageId: PropTypes.string,
    glyph: PropTypes.string
};
export default WidgetEmptyMessage;
