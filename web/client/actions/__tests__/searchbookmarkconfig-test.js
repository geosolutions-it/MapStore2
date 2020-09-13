/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    SET_SEARCH_BOOKMARK_CONFIG,
    RESET_BOOKMARK_CONFIG,
    UPDATE_BOOKMARK,
    FILTER_BOOKMARKS,
    setSearchBookmarkConfig,
    resetBookmarkConfig,
    updateBookmark,
    filterBookmarks
} = require('../searchbookmarkconfig');

describe('Test correctness of the searchbookmarkconfig actions', () => {

    it('resetBookmarkConfig', () => {
        const action = resetBookmarkConfig();
        expect(action).toExist();
        expect(action.type).toBe(RESET_BOOKMARK_CONFIG);
    });

    it('setSearchBookmarkConfig', () => {
        const testProperty = 'prop';
        const testValue = 'val';
        const action = setSearchBookmarkConfig(testProperty, testValue);

        expect(action).toExist();
        expect(action.type).toBe(SET_SEARCH_BOOKMARK_CONFIG);
        expect(action.property).toBe(testProperty);
        expect(action.value).toBe(testValue);
    });

    it('updateBookmark', () => {
        const testBookmark = "bookmark1";
        const testIdx = 1;
        const action = updateBookmark(testBookmark, testIdx);
        expect(action).toExist();
        expect(action.type).toBe(UPDATE_BOOKMARK);
        expect(action.bookmark).toBe(testBookmark);
        expect(action.idx).toBe(testIdx);
    });

    it('filterBookmarks', () => {
        const filter = "bookmark1";
        const action = filterBookmarks(filter);
        expect(action).toExist();
        expect(action.type).toBe(FILTER_BOOKMARKS);
        expect(action.filter).toBe(filter);
    });
});
