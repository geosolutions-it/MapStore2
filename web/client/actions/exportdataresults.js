/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_EXPORT_DATA_RESULTS = "EXPORTDATARESULTS:SET_EXPORT_DATA_RESULTS";
export const ADD_EXPORT_DATA_RESULT = "EXPORTDATARESULTS:ADD_EXPORT_DATA_RESULT";
export const UPDATE_EXPORT_DATA_RESULT = "EXPORTDATARESULTS:UPDATE_EXPORT_DATA_RESULT";
export const REMOVE_EXPORT_DATA_RESULT = "EXPORTDATARESULTS:REMOVE_EXPORT_DATA_RESULT";
export const REMOVE_EXPORT_DATA_RESULTS = "EXPORTDATARESULTS:REMOVE_EXPORT_DATA_RESULTS";
export const CHECK_EXPORT_DATA_ENTRIES = "EXPORTDATARESULTS:CHECK_EXPORT_DATA_ENTRIES";
export const CHECKING_EXPORT_DATA_ENTRIES = "EXPORTDATARESULTS:CHECKING_EXPORT_DATA_ENTRIES";
export const SERIALIZE_COOKIE = "EXPORTDATARESULTS:SERIALIZE_COOKIE";
export const SHOW_INFO_BUBBLE_MESSAGE = "EXPORTDATARESULTS:SHOW_INFO_BUBBLE_MESSAGE";
export const SHOW_INFO_BUBBLE = "EXPORTDATARESULTS:SHOW_INFO_BUBBLE";
export const SET_INFO_BUBBLE_MESSAGE = "EXPORTDATARESULTS:SET_INFO_BUBBLE_MESSAGE";

export const setExportDataResults = (results) => ({
    type: SET_EXPORT_DATA_RESULTS,
    results
});

export const addExportDataResult = (result) => ({
    type: ADD_EXPORT_DATA_RESULT,
    result
});

export const updateExportDataResult = (id, newProps) => ({
    type: UPDATE_EXPORT_DATA_RESULT,
    id,
    newProps
});

export const removeExportDataResult = (id) => ({
    type: REMOVE_EXPORT_DATA_RESULT,
    id
});

export const removeExportDataResults = (ids) => ({
    type: REMOVE_EXPORT_DATA_RESULTS,
    ids
});

export const checkExportDataEntries = () => ({
    type: CHECK_EXPORT_DATA_ENTRIES
});

export const checkingExportDataEntries = (checking) => ({
    type: CHECKING_EXPORT_DATA_ENTRIES,
    checking
});

export const serializeCookie = () => ({
    type: SERIALIZE_COOKIE
});

export const showInfoBubbleMessage = (msgId, msgParams, level, duration) => ({
    type: SHOW_INFO_BUBBLE_MESSAGE,
    msgId,
    msgParams,
    level,
    duration
});

export const showInfoBubble = (show) => ({
    type: SHOW_INFO_BUBBLE,
    show
});

export const setInfoBubbleMessage = (msgId, msgParams, level) => ({
    type: SET_INFO_BUBBLE_MESSAGE,
    msgId,
    msgParams,
    level
});
