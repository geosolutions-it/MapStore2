/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CHECK_WPS_AVAILABILITY = "LAYERDOWNLOAD:CHECK_WPS_AVAILABILITY";
export const CHECKING_WPS_AVAILABILITY = "LAYERDOWNLOAD:CHECKING_WPS_AVAILABILITY";
export const DOWNLOAD_FEATURES = "LAYERDOWNLOAD:DOWNLOAD_FEATURES";
export const DOWNLOAD_FINISHED = "LAYERDOWNLOAD:DOWNLOAD_FINISHED";
export const DOWNLOAD_OPTIONS_CHANGE = "LAYERDOWNLOAD:FORMAT_SELECTED";
export const CLEAR_DOWNLOAD_OPTIONS = "LAYERDOWNLOAD:CLEAR_DOWNLOAD_OPTIONS";
export const FORMAT_OPTIONS_FETCH = "LAYERDOWNLOAD:FORMAT_FETCH";
export const FORMAT_OPTIONS_UPDATE = "LAYERDOWNLOAD:FORMAT_UPDATE";
export const SET_WPS_AVAILABILITY = "LAYERDOWNLOAD:SET_WPS_AVAILABLE";
export const SET_SERVICE = "LAYERDOWNLOAD:SET_SERVICE";
export const SET_EXPORT_DATA_RESULTS = "LAYERDOWNLOAD:SET_EXPORT_DATA_RESULTS";
export const ADD_EXPORT_DATA_RESULT = "LAYERDOWNLOAD:ADD_EXPORT_DATA_RESULT";
export const UPDATE_EXPORT_DATA_RESULT = "LAYERDOWNLOAD:UPDATE_EXPORT_DATA_RESULT";
export const REMOVE_EXPORT_DATA_RESULT = "LAYERDOWNLOAD:REMOVE_EXPORT_DATA_RESULT";
export const REMOVE_EXPORT_DATA_RESULTS = "LAYERDOWNLOAD:REMOVE_EXPORT_DATA_RESULTS";
export const CHECK_EXPORT_DATA_ENTRIES = "LAYERDOWNLOAD:CHECK_EXPORT_DATA_ENTRIES";
export const CHECKING_EXPORT_DATA_ENTRIES = "LAYERDOWNLOAD:CHECKING_EXPORT_DATA_ENTRIES";
export const SERIALIZE_COOKIE = "LAYERDOWNLOAD:SERIALIZE_COOKIE";
export const SHOW_INFO_BUBBLE_MESSAGE = "LAYERDOWNLOAD:SHOW_INFO_BUBBLE_MESSAGE";
export const SHOW_INFO_BUBBLE = "LAYERDOWNLOAD:SHOW_INFO_BUBBLE";
export const SET_INFO_BUBBLE_MESSAGE = "LAYERDOWNLOAD:SET_INFO_BUBBLE_MESSAGE";

/**
 * Actions for WFS Download
 * @memberof actions
 * @name layerdownload
 * @type {Object}
 */
export const checkWPSAvailability = (url, selectedService) => ({
    type: CHECK_WPS_AVAILABILITY,
    url,
    selectedService
});
export const checkingWPSAvailability = (checking) => ({
    type: CHECKING_WPS_AVAILABILITY,
    checking
});
/**
 * action to download features
 * @memberof actions.layerdownload
 * @param  {string} url             the URL of LayerDownload
 * @param  {object} filterObj       the object that represent the WFS filterObj
 * @param  {object} downloadOptions download options e.g. `{singlePage: true|false, selectedFormat: "csv"}`
 * @return {action}                 The action of type `DOWNLOAD_FEATURES`
 */
export const downloadFeatures = (url, filterObj, downloadOptions) => ({
    type: DOWNLOAD_FEATURES,
    url,
    filterObj,
    downloadOptions
});
/**
 * action for change download options
 * @memberof actions.layerdownload
 * @param  {string} key             the value key to change. e.g. selectedFormat
 * @param  {string|boolean} value   the value of the option
 * @return {action}                 the action of type `DOWNLOAD_OPTIONS_CHANGE`
 */
export const onDownloadOptionChange = (key, value) => {
    return {
        type: DOWNLOAD_OPTIONS_CHANGE,
        key,
        value
    };
};
/**
 * clear download options
 * @memberof actions.layerdownload
 * @param {string} defaultSelectedService
 * @return {action}                 the action of type `CLEAR_DOWNLOAD_OPTIONS`
 */
export const clearDownloadOptions = (defaultSelectedService) => ({
    type: CLEAR_DOWNLOAD_OPTIONS,
    defaultSelectedService
});
/**
 * action for fetch format options WFS download
 * @memberof actions.layerdownload
 * @param  {object} layer           selected layer
 * @return {action}                 the action of type `FORMAT_OPTIONS_FETCH`
 */
export const onFormatOptionsFetch = (layer) => ({
    type: FORMAT_OPTIONS_FETCH,
    layer
});
/**
 * action for update list of formats
 * @memberof actions.layerdownload
 * @param  {array} wfsFormats          available wfsFormats for download
 * @return {action}                 the action of type `FORMAT_OPTIONS_UPDATE`
 */
export const updateFormats = (wfsFormats) => ({
    type: FORMAT_OPTIONS_UPDATE,
    wfsFormats
});
/**
 * action that notifies the end of the downloadOptions
 * @memberof actions.layerdownload
 * @return {action} action of type `DOWNLOAD_FINISHED`
 */
export const onDownloadFinished = () => ({
    type: DOWNLOAD_FINISHED
});

/**
 * action that sets if WPS available for download requests
 * @memberof actions.layerdownload
 * @returns {action} action of type `SET_WPS_AVAILABILITY`
 */
export const setWPSAvailability = (value) => ({
    type: SET_WPS_AVAILABILITY,
    value
});

/**
 * set service to use for layer download(wfs or wps)
 * @memberof actions.layerdownload
 * @return {action} action of t
 */
export const setService = (service) => ({
    type: SET_SERVICE,
    service
});


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
