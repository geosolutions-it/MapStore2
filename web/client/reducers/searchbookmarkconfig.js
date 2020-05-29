/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {
    SET_SEARCH_BOOKMARK_CONFIG,
    RESET_BOOKMARK_CONFIG,
    UPDATE_BOOKMARK,
    FILTER_BOOKMARKS
} = require('../actions/searchbookmarkconfig');
const {RESET_CONTROLS} = require('../actions/controls');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const assign = require('object-assign');

const searchbookmarkconfig = (state = null, action) => {
    switch (action.type) {
    case SET_SEARCH_BOOKMARK_CONFIG:
        return assign({}, state, {
            [action.property]: action.value
        });
    case MAP_CONFIG_LOADED: {
        const bookmarkSearchConfig = action.config.map.bookmark_search_config || action.config.map.bookmark_search_config;
        return assign({}, state, {bookmarkSearchConfig});
    }
    case RESET_CONTROLS:
    case RESET_BOOKMARK_CONFIG: {
        return assign({}, state, {bookmark: undefined, page: 0, editIdx: undefined});
    }
    case UPDATE_BOOKMARK: {
        let newBookmarks = (state.bookmarkSearchConfig && state.bookmarkSearchConfig.bookmarks || []).slice();
        const newBookmark = assign({}, action.bookmark);
        if (action.idx !== -1) {
            newBookmarks[action.idx] = newBookmark;
        } else {
            newBookmarks.push(newBookmark);
        }
        return assign({}, state, {bookmark: undefined, page: 0, editIdx: undefined, bookmarkSearchConfig: {bookmarks: newBookmarks}});
    }
    case FILTER_BOOKMARKS: {
        return assign({}, state, {filter: action.filter});
    }
    default:
        return state;
    }
};

module.exports = searchbookmarkconfig;
