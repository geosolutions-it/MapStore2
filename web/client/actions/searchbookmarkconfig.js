/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SET_SEARCH_BOOKMARK_CONFIG = 'SET_SEARCH_BOOKMARK_CONFIG';
const RESET_BOOKMARK_CONFIG = 'RESET_BOOKMARK_CONFIG';
const UPDATE_BOOKMARK = 'UPDATE_BOOKMARK';
const FILTER_BOOKMARKS = 'FILTER_BOOKMARKS';

/**
* Sets a property
* @memberof actions.searchbookmarkconfig
* @param {string} property the property to set
* @param {string|number|boolean|object} value the value to set or to check for toggling
* @return {object} of type `SET_SEARCH_BOOKMARK_CONFIG` with property and value params
*/
function setSearchBookmarkConfig(property, value) {
    return {
        type: SET_SEARCH_BOOKMARK_CONFIG,
        property,
        value
    };
}

/**
 * Resets a property
 * @memberof actions.searchbookmarkconfig
 * @return {object} of type `RESET_BOOKMARK_CONFIG` with property and value params
 */
function resetBookmarkConfig() {
    return {
        type: RESET_BOOKMARK_CONFIG
    };
}

/**
 * Updates a property
 * @memberof actions.searchbookmarkconfig
 * @param {object} bookmark the property to set
 * @param {number} idx the value to set
 * @return {object} of type `UPDATE_BOOKMARK` with property and value params
 */
function updateBookmark(bookmark, idx = -1) {
    return {
        type: UPDATE_BOOKMARK,
        bookmark,
        idx
    };
}

/**
 * Set filter property
 * @memberof actions.searchbookmarkconfig
 * @param {string} filter the property to set
 * @return {object} of type `FILTER_BOOKMARKS` with property and value params
 */
function filterBookmarks(filter) {
    return {
        type: FILTER_BOOKMARKS,
        filter
    };
}

/**
* Actions for search
* @name actions.bookmarkconfig
*/
module.exports = {
    SET_SEARCH_BOOKMARK_CONFIG,
    RESET_BOOKMARK_CONFIG,
    UPDATE_BOOKMARK,
    FILTER_BOOKMARKS,
    setSearchBookmarkConfig,
    resetBookmarkConfig,
    updateBookmark,
    filterBookmarks
};
