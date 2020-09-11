/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    UPDATE_TEMPORARY_STYLE,
    UPDATE_STATUS,
    ERROR_STYLE,
    ADD_STYLE,
    RESET_STYLE_EDITOR,
    LOADING_STYLE,
    LOADED_STYLE,
    INIT_STYLE_SERVICE,
    SET_EDIT_PERMISSION,
    UPDATE_EDITOR_METADATA
} = require('../actions/styleeditor');

const isString = require('lodash/isString');

function styleeditor(state = {}, action) {
    switch (action.type) {
    case INIT_STYLE_SERVICE: {
        return {
            ...state,
            service: action.service,
            canEdit: action.canEdit
        };
    }
    case SET_EDIT_PERMISSION: {
        return {
            ...state,
            canEdit: action.canEdit
        };
    }
    case UPDATE_TEMPORARY_STYLE: {
        return {
            ...state,
            temporaryId: action.temporaryId,
            templateId: action.templateId,
            code: action.code,
            format: action.format,
            error: null,
            languageVersion: action.languageVersion,
            initialCode: action.init ? action.code : state.initialCode
        };
    }
    case UPDATE_STATUS: {
        if (action.status === '') {
            return {
                ...state,
                status: action.status,
                code: '',
                templateId: '',
                initialCode: '',
                addStyle: false,
                error: {}
            };
        }
        return {
            ...state,
            status: action.status
        };
    }
    case RESET_STYLE_EDITOR: {
        return {
            service: state.service && {...state.service} || {},
            canEdit: state.canEdit
        };
    }
    case ADD_STYLE: {
        return {...state, addStyle: action.add};
    }
    case LOADING_STYLE: {
        return {
            ...state,
            loading: action.status ? action.status : true,
            error: {}
        };
    }
    case LOADED_STYLE: {
        return {
            ...state,
            loading: false,
            enabled: true
        };
    }
    case ERROR_STYLE: {
        const message = action?.error?.statusText || action?.error?.message || '';
        const messageIdParam = isString(action?.error?.messageId)
            && { messageId: action.error.messageId };
        const position = message.match(/line\s([\d]+)|column\s([\d]+)|lineNumber:\s([\d]+)|columnNumber:\s([\d]+)/g);
        const errorInfo = position && position.length === 2 && position.reduce((info, pos) => {
            const splittedValues = pos.split(' ');
            const param = splittedValues[0].replace(/Number:/g, '');
            const value = parseFloat(splittedValues[1]);
            return param && !isNaN(value) && {
                ...info,
                [param]: value
            } || { ...info };
        }, { message, ...messageIdParam }) || { message, ...messageIdParam };
        return {
            ...state,
            loading: false,
            canEdit: !(action.error && (action.error.status === 401 || action.error.status === 403)),
            error: {
                ...state.error,
                [action.status || 'global']: {
                    status: action.error && action.error.status || 404,
                    ...errorInfo
                }
            }
        };
    }
    case UPDATE_EDITOR_METADATA: {
        return {
            ...state,
            metadata: {
                ...state.metadata,
                ...action.metadata
            }
        };
    }
    default:
        return state;
    }
}

module.exports = styleeditor;
