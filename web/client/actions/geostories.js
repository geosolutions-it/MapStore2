/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_GEOSTORIES_AVAILABLE = "GEOSTORIES:SET_GEOSTORIES_AVAILABLE";
export const SEARCH_GEOSTORIES = "GEOSTORIES:SEARCH_GEOSTORIES";
export const GEOSTORIES_LIST_LOADED = "GEOSTORIES:GEOSTORIES_LIST_LOADED";
export const DELETE_GEOSTORY = "GEOSTORIES:DELETE_GEOSTORY";
export const GEOSTORY_DELETED = "GEOSTORIES:GEOSTORY_DELETED";
export const RELOAD = "GEOSTORIES:RELOAD_GEOSTORIES";
export const LOADING = "GEOSTORIES:LOADING";

export const setGeostoriesAvailable = (available) => ({ type: SET_GEOSTORIES_AVAILABLE, available });
export const searchGeostories = (searchText, params) => ({ type: SEARCH_GEOSTORIES, searchText, params });
/**
 * @param {boolean} value the value of the flag
 * @param {string} [name] the name of the flag to set. loading is anyway always triggered
 */
export const geostoriesLoading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});
export const geostoriesListLoaded = ({ results, success, totalCount }, { searchText, options } = {}) => ({ type: GEOSTORIES_LIST_LOADED, results, success, totalCount, searchText, options });
export const deleteGeostory = id => ({type: DELETE_GEOSTORY, id});

export const reloadGeostories = () => ({ type: RELOAD});
export const geostoryDeleted = id => ({type: GEOSTORY_DELETED, id});
