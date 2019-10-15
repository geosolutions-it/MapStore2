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
        let e = addBackground('backgroundSelector');
        expect(e).toExist();
        expect(e.type).toBe(ADD_BACKGROUND);
        expect(e.source).toExist();
        expect(e.source).toBe('backgroundSelector');
    });
    it('test adding or updating thumbnails', () => {
        let e = updateThumbnail('binary Code', 'https:/link', '1983');
        expect(e).toExist();
        expect(e.type).toBe(UPDATE_BACKGROUND_THUMBNAIL);
        expect(e.thumbnailData).toExist();
        expect(e.thumbnailData).toBe('binary Code');
        expect(e.thumbnail).toExist();
        expect(e.thumbnail).toBe('https:/link');
        expect(e.id).toExist();
        expect(e.id).toBe('1983');
    });
    it('test adding or updating thumbnails', () => {
        let e = createBackgroundsList([1234, 1232, 9982]);
        expect(e).toExist();
        expect(e.type).toBe(CREATE_BACKGROUNDS_LIST);
        expect(e.backgrounds).toExist();
        expect(e.backgrounds.length).toBe(3);
    });
    it('test adding background properties', () => {
        let e = addBackgroundProperties({name: 'thumb'}, true);
        expect(e).toExist();
        expect(e.type).toBe(ADD_BACKGROUND_PROPERTIES);
        expect(e.modalParams).toExist();
        expect(e.modalParams.name).toBe('thumb');
    });
    it('test removing background thumbnail info by Id', () => {
        let e = removeBackground('1983');
        expect(e).toExist();
        expect(e.type).toBe(REMOVE_BACKGROUND);
        expect(e.backgroundId).toExist();
        expect(e.backgroundId).toBe('1983');
    });
    it('test clearing backgrounds', () => {
        let e = clearBackgrounds();
        expect(e).toExist();
        expect(e.type).toBe(BACKGROUNDS_CLEAR);
    });
    it('test clearing background\'s properties', () => {
        let e = clearModalParameters();
        expect(e).toExist();
        expect(e.type).toBe(CLEAR_MODAL_PARAMETERS);
    });
});
