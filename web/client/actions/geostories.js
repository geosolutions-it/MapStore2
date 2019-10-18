/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SET_GEOSTORIES_AVAILABLE = "GEOSTORIES:SET_GEOSTORIES_AVAILABLE";
const SEARCH_GEOSTORIES = "GEOSTORIES:SEARCH_GEOSTORIES";
const GEOSTORIES_LIST_LOADED = "GEOSTORIES:GEOSTORIES_LIST_LOADED";
const DELETE_GEOSTORY = "GEOSTORIES:DELETE_GEOSTORY";
const GEOSTORY_DELETED = "GEOSTORIES:GEOSTORY_DELETED";
const RELOAD = "GEOSTORIES:RELOAD_GEOSTORIES";
const LOADING = "GEOSTORIES:LOADING";

module.exports = {
    SET_GEOSTORIES_AVAILABLE,
    setGeostoriesAvailable: (available) => ({ type: SET_GEOSTORIES_AVAILABLE, available }),
    SEARCH_GEOSTORIES,
    searchGeostories: (searchText, params) => ({ type: SEARCH_GEOSTORIES, searchText, params }),
    LOADING,
    /**
     * @param {boolean} value the value of the flag
     * @param {string} [name] the name of the flag to set. loading is anyway always triggered
     */
    geostoriesLoading: (value, name = "loading") => ({
        type: LOADING,
        name,
        value
    }),
    GEOSTORIES_LIST_LOADED,
    geostoriesListLoaded: ({ results, success, totalCount }, { searchText, options } = {}) => ({ type: GEOSTORIES_LIST_LOADED, results, success, totalCount, searchText, options }),
    DELETE_GEOSTORY,
    deleteGeostory: id => ({type: DELETE_GEOSTORY, id}),
    GEOSTORY_DELETED,
    RELOAD,
    reloadGeostories: () => ({ type: RELOAD}),
    geostoryDeleted: id => ({type: GEOSTORY_DELETED, id})
};
