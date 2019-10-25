/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const backgroundselector = require('../backgroundselector');
const {
    CREATE_BACKGROUNDS_LIST,
    ADD_BACKGROUND,
    UPDATE_BACKGROUND_THUMBNAIL,
    BACKGROUNDS_CLEAR,
    REMOVE_BACKGROUND,
    CLEAR_MODAL_PARAMETERS
} = require('../../actions/backgroundselector');

describe('Test the backgroundSelector reducer', () => {
    it('trigger add background action ', () => {
        const state = backgroundselector({}, {
            type: ADD_BACKGROUND,
            source: "backgroundSelector"
        });
        expect(state.source).toExist();
        expect(state.source).toBe("backgroundSelector");
    });

    it('clear background list', () => {
        const state = backgroundselector({}, {
            type: BACKGROUNDS_CLEAR
        });
        expect(state.source).toBe(undefined);
        expect(state.lastRemovedId).toBe(undefined);
        expect(state.backgrounds.length).toBe(0);
        expect(state.modalParams).toEqual({});
    });
    it('add thumbnail to the background', () => {
        const state = backgroundselector({modalParams: {identifier: '1'}, backgrounds: [{id: '1'}]}, {
            type: UPDATE_BACKGROUND_THUMBNAIL,
            thumbnailData: 'binary',
            id: '1'
        });
        expect(state.backgrounds.length).toBe(1);
        expect(state.modalParams).toEqual({identifier: '1'});
        expect(state.backgrounds[0].thumbnail).toEqual('binary');
    });
    it('clear modal parameters state', () => {
        const state = backgroundselector({modalParams: {identifier: 'id'}, backgrounds: [{id: '1'}]}, {
            type: CLEAR_MODAL_PARAMETERS
        });
        expect(state.modalParams).toBe(undefined);
    });
    it('remove a background', () => {
        const state = backgroundselector({backgrounds: [{id: '1'}]}, {
            type: REMOVE_BACKGROUND,
            backgroundId: '1'
        });
        expect(state.lastRemovedId).toBe('1');
        expect(state.backgrounds.length).toBe(0);
    });
    it('create a list of thumbs resource ID', () => {
        const state = backgroundselector({}, {
            type: CREATE_BACKGROUNDS_LIST,
            backgrounds: [{id: '1', thumbnail: 'data'}]
        });
        expect(state.backgrounds).toExist();
        expect(state.backgrounds.length).toBe(1);
        expect(state.backgrounds[0]).toEqual({id: '1', thumbnail: 'data'});
    });
});
