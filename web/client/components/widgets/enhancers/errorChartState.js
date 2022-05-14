import React from 'react';
import Message from '../../I18N/Message';
import emptyState from '../../misc/enhancers/emptyState';
import WidgetEmptyMessage from '../widget/WidgetEmptyMessage';

const getErrorMessage = (error = {}) => {
    if (error.code === "ECONNABORTED") {
        return <Message msgId="widgets.errors.timeoutExpired" />;
    }
    return error.message ?
        <Message msgId="widgets.errors.genericErrorWithMessage" msgParams={{message: error.message}}/> :
        <Message msgId="widgets.errors.genericError"/>;
};

export default emptyState(
    ({error}) => !!error,
    ({error, layer} = {}) => {
        const content = (error?.message?.indexOf("Could not locate") !== -1) ?
            <WidgetEmptyMessage glyph="stats" messageId="widgets.errors.layerNotAvailable" msgParams={{layerName: layer?.name}} /> :
            getErrorMessage(error);
        return {
            glyph: error?.message?.indexOf("Could not locate") !== -1 ? null : "warning-sign",
            iconFit: false,
            content
        };
    }
);
