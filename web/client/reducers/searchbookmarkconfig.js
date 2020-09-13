/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import {
    SET_SEARCH_BOOKMARK_CONFIG,
    RESET_BOOKMARK_CONFIG,
    UPDATE_BOOKMARK,
    FILTER_BOOKMARKS
} from '../actions/searchbookmarkconfig';
import {RESET_CONTROLS} from '../actions/controls';
import {MAP_CONFIG_LOADED} from '../actions/config';

export default (state = null, action) => {
    switch (action.type) {
    case SET_SEARCH_BOOKMARK_CONFIG:
        return {...state, [action.property]: action.value};
    case MAP_CONFIG_LOADED: {
        const bookmarkSearchConfig = action.config.map.bookmark_search_config || {};
        return {...state, bookmarkSearchConfig};
    }
    case RESET_CONTROLS:
    case RESET_BOOKMARK_CONFIG: {
        return {...state, bookmark: undefined, page: 0, editIdx: undefined};
    }
    case UPDATE_BOOKMARK: {
        let newBookmarks = (state.bookmarkSearchConfig && state.bookmarkSearchConfig.bookmarks || []).slice();
        const newBookmark = {...action.bookmark};
        if (action.idx !== -1) {
            newBookmarks[action.idx] = newBookmark;
        } else {
            newBookmarks.push(newBookmark);
        }
        return {...state, bookmark: undefined, page: 0, editIdx: undefined, bookmarkSearchConfig: {...state.bookmarkSearchConfig, bookmarks: newBookmarks}};
    }
    case FILTER_BOOKMARKS: {
        return {...state, filter: action.filter};
    }
    default:
        return state;
    }
};
