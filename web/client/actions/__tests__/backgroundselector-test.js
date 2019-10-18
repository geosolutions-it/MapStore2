/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {CREATE_BACKGROUNDS_LIST,
    ADD_BACKGROUND,
    ADD_BACKGROUND_PROPERTIES,
    UPDATE_BACKGROUND_THUMBNAIL,
    BACKGROUNDS_CLEAR,
    CLEAR_MODAL_PARAMETERS,
    REMOVE_BACKGROUND,
    createBackgroundsList,
    addBackgroundProperties,
    addBackground,
    updateThumbnail,
    clearModalParameters,
    clearBackgrounds,
    removeBackground} from '../backgroundselector';

describe('Test backgroundSelector actions', () => {
    it('test accessing catalog from backgroundSelector', () => {
        const action = addBackground('backgroundSelector');
        expect(action).toExist();
        expect(action.type).toBe(ADD_BACKGROUND);
        expect(action.source).toExist();
        expect(action.source).toBe('backgroundSelector');
    });
    it('test adding or updating thumbnails', () => {
        const action = updateThumbnail('binary Code', '1983');
        expect(action).toExist();
        expect(action.type).toBe(UPDATE_BACKGROUND_THUMBNAIL);
        expect(action.thumbnailData).toExist();
        expect(action.thumbnailData).toBe('binary Code');
        expect(action.id).toExist();
        expect(action.id).toBe('1983');
    });
    it('test adding or updating thumbnails', () => {
        const action = createBackgroundsList([1234, 1232, 9982]);
        expect(action).toExist();
        expect(action.type).toBe(CREATE_BACKGROUNDS_LIST);
        expect(action.backgrounds).toExist();
        expect(action.backgrounds.length).toBe(3);
    });
    it('test adding background properties', () => {
        const action = addBackgroundProperties({name: 'thumb'}, true);
        expect(action).toExist();
        expect(action.type).toBe(ADD_BACKGROUND_PROPERTIES);
        expect(action.modalParams).toExist();
        expect(action.modalParams.name).toBe('thumb');
    });
    it('test removing background thumbnail info by Id', () => {
        const action = removeBackground('1983');
        expect(action).toExist();
        expect(action.type).toBe(REMOVE_BACKGROUND);
        expect(action.backgroundId).toExist();
        expect(action.backgroundId).toBe('1983');
    });
    it('test clearing backgrounds', () => {
        const action = clearBackgrounds();
        expect(action).toExist();
        expect(action.type).toBe(BACKGROUNDS_CLEAR);
    });
    it('test clearing background\'s properties', () => {
        const action = clearModalParameters();
        expect(action).toExist();
        expect(action.type).toBe(CLEAR_MODAL_PARAMETERS);
    });
});
