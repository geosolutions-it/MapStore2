/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import searchbookmarkconfig from '../searchbookmarkconfig';
import {SET_SEARCH_BOOKMARK_CONFIG, RESET_BOOKMARK_CONFIG, UPDATE_BOOKMARK, FILTER_BOOKMARKS} from '../../actions/searchbookmarkconfig';

describe('Test the searchbookmarkconfig reducer', () => {
    it('Map config loaded with bookmarkSearchConfig', () => {

        const action = {type: 'MAP_CONFIG_LOADED',
            config: { version: 2, map: {layers: [], bookmark_search_config: {bookmarks: []}}}};

        const state = searchbookmarkconfig({}, action);
        expect(state.bookmarkSearchConfig).toExist();
        expect(state.bookmarkSearchConfig.bookmarks).toExist();
    });
    it('Map config loaded without bookmarkSearchConfig', () => {

        const action = {type: 'MAP_CONFIG_LOADED',
            config: { version: 2, map: {layers: []}}};

        const state = searchbookmarkconfig({}, action);
        expect(state.bookmarkSearchConfig).toEqual({});
    });
    it('reset searchbookmarkconfig state', () => {
        const state = searchbookmarkconfig(
            {bookmark: "test", page: 1, editIdx: 2, bookmarkSearchConfig: {}}
            , {
                type: RESET_BOOKMARK_CONFIG
            });
        expect(state.page).toBe(0);
        expect(state.bookmark).toBe(undefined);
        expect(state.editIdx).toBe(undefined);
        expect(state.bookmarkSearchConfig).toExist();
    });

    it('test bookmark update', () => {
        const state = searchbookmarkconfig({
            bookmarkSearchConfig: {bookmarks: [{title: "Bookmark1"}]}
        }, {
            type: UPDATE_BOOKMARK,
            bookmark: {title: "changed"},
            idx: 0
        });
        expect(state.bookmarkSearchConfig).toExist();
        expect(state.bookmarkSearchConfig.bookmarks[0].title).toBe("changed");
    });
    it('test bookmark add', () => {
        const state = searchbookmarkconfig({
            bookmarkSearchConfig: {bookmarks: [{title: "Bookmark1"}]}
        }, {
            type: UPDATE_BOOKMARK,
            bookmark: {title: "New Bookmark"},
            idx: -1
        });
        expect(state.bookmarkSearchConfig).toExist();
        expect(state.bookmarkSearchConfig.bookmarks[1].title).toBe("New Bookmark");
    });

    it('set a bookmark config property', () => {
        const state = searchbookmarkconfig({}, {
            type: SET_SEARCH_BOOKMARK_CONFIG,
            property: "prop",
            value: 'val'
        });
        expect(state.prop).toExist();
        expect(state.prop).toBe('val');
    });
    it('test bookmark filter property', () => {
        const state = searchbookmarkconfig({}, {
            type: FILTER_BOOKMARKS,
            filter: "New"
        });
        expect(state.filter).toExist();
        expect(state.filter).toBe('New');
    });
});
