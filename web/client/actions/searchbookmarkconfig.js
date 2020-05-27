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
* @memberof actions.search
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

function resetBookmarkConfig(page = 0 ) {
    return {
        type: RESET_BOOKMARK_CONFIG,
        page
    };
}
function updateBookmark(bookmark, idx = -1) {
    return {
        type: UPDATE_BOOKMARK,
        bookmark,
        idx
    };
}

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
