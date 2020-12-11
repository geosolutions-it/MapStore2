import React from 'react';
import Message from '../../I18N/Message';
import emptyState from '../../misc/enhancers/emptyState';

const getErrorMessage = (error = {}) => {
    if (error.code === "ECONNABORTED") {
        return <Message msgId="widgets.errors.timeoutExpired" />;
    }
    return error.message ?
        <Message msgId="widgets.errors.genericErrorWithMessage" msgParams={{message: error.message}}/> :
        <Message msgId="widgets.errors.genericError"/>;
};

export default emptyState(
    ({error}) => error,
    ({error, iconFit} = {}) => ({
        glyph: "warning-sign",
        iconFit,
        tooltip: getErrorMessage(error)
    })
);
