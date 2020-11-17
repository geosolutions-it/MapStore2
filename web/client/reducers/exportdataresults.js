/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { findIndex } from 'lodash';

import {
    SET_EXPORT_DATA_RESULTS,
    ADD_EXPORT_DATA_RESULT,
    UPDATE_EXPORT_DATA_RESULT,
    REMOVE_EXPORT_DATA_RESULT,
    REMOVE_EXPORT_DATA_RESULTS,
    SHOW_INFO_BUBBLE,
    SET_INFO_BUBBLE_MESSAGE,
    CHECKING_EXPORT_DATA_ENTRIES
} from '../actions/exportdataresults';

const exportdataresults = (state = {}, action) => {
    switch (action.type) {
    case SET_EXPORT_DATA_RESULTS: {
        return {
            ...state,
            results: action.results
        };
    }
    case ADD_EXPORT_DATA_RESULT: {
        return {
            ...state,
            results: [...(state.results || []), action.result]
        };
    }
    case UPDATE_EXPORT_DATA_RESULT: {
        const resultIndex = findIndex(state.results || [], {id: action.id});

        return {
            ...state,
            results: resultIndex > -1 ? [
                ...state.results.slice(0, resultIndex),
                {
                    ...state.results[resultIndex],
                    ...(action.newProps || {})
                },
                ...state.results.slice(resultIndex + 1)
            ] : state.results
        };
    }
    case REMOVE_EXPORT_DATA_RESULT: {
        return {
            ...state,
            results: (state.results || []).filter(result => result.id !== action.id)
        };
    }
    case REMOVE_EXPORT_DATA_RESULTS: {
        return {
            ...state,
            results: (state.results || []).filter(result => findIndex(action.ids, id => id === result.id) === -1)
        };
    }
    case SHOW_INFO_BUBBLE: {
        return {
            ...state,
            showInfoBubble: action.show
        };
    }
    case SET_INFO_BUBBLE_MESSAGE: {
        return {
            ...state,
            infoBubbleMessage: {
                msgId: action.msgId,
                msgParams: action.msgParams,
                level: action.level
            }
        };
    }
    case CHECKING_EXPORT_DATA_ENTRIES: {
        return {
            ...state,
            checkingExportDataEntries: action.checking
        };
    }
    default:
        return state;
    }
};

export default exportdataresults;
