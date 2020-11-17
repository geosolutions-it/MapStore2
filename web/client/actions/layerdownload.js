/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CHECK_WPS_AVAILABILITY = "LAYERDOWNLOAD:CHECK_WPS_AVAILABILITY";
export const CHECKING_WPS_AVAILABILITY = "LAYERDOWNLOAD:CHECKING_WPS_AVAILABILITY";
export const SET_EXPORT_DATA_RESULTS = "LAYERDOWNLOAD:SET_EXPORT_DATA_RESULTS";
export const REMOVE_EXPORT_DATA_RESULT = "LAYERDOWNLOAD:REMOVE_EXPORT_DATA_RESULT";
export const DOWNLOAD_FEATURES = "LAYERDOWNLOAD:DOWNLOAD_FEATURES";
export const DOWNLOAD_FINISHED = "LAYERDOWNLOAD:DOWNLOAD_FINISHED";
export const DOWNLOAD_OPTIONS_CHANGE = "LAYERDOWNLOAD:FORMAT_SELECTED";
export const CLEAR_DOWNLOAD_OPTIONS = "LAYERDOWNLOAD:CLEAR_DOWNLOAD_OPTIONS";
export const FORMAT_OPTIONS_FETCH = "LAYERDOWNLOAD:FORMAT_FETCH";
export const FORMAT_OPTIONS_UPDATE = "LAYERDOWNLOAD:FORMAT_UPDATE";
export const SET_SERVICE = "LAYERDOWNLOAD:SET_SERVICE";

/**
 * Actions for WFS Download
 * @memberof actions
 * @name layerdownload
 * @type {Object}
 */
export const checkWPSAvailability = (url) => ({
    type: CHECK_WPS_AVAILABILITY,
    url
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
export const onDownloadOptionChange = (key, value) => ({
    type: DOWNLOAD_OPTIONS_CHANGE,
    key,
    value
});
/**
 * clear download options
 * @memberof actions.layerdownload
 * @return {action}                 the action of type `CLEAR_DOWNLOAD_OPTIONS`
 */
export const clearDownloadOptions = () => ({
    type: CLEAR_DOWNLOAD_OPTIONS
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
 * set service to use for layer download(wfs or wps)
 * @memberof actions.layerdownload
 * @return {action} action of t
 */
export const setService = (service) => ({
    type: SET_SERVICE,
    service
});
