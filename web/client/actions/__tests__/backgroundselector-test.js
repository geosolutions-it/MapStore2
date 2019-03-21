/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {CREATE_BACKGROUNDS_LIST,
    ADD_BACKGROUND,
    ADD_BACKGROUND_PROPERTIES,
    UPDATE_BACKGROUND_THUMBNAIL,
    BACKGROUNDS_CLEAR,
    REMOVE_BACKGROUND_THUMBNAIL,
    BACKGROUND_THUMBS_UPDATED,
    EDIT_BACKGROUND_PROPERTIES,
    CLEAR_MODAL_PARAMETERS,
    editBackgroundProperties,
    createBackgroundsList,
    addBackgroundProperties,
    addBackground,
    updateThumbnail,
    clearModalParameters,
    clearBackgrounds,
    removeThumbnail,
    backgroundThumbnailsUpdated} = require('../backgroundselector');

describe('Test backgroundSelector actions', () => {
    it('test accessing catalog from backgroundSelector', (done) => {
        let e = addBackground('backgroundSelector');
        expect(e).toExist();
        expect(e.type).toBe(ADD_BACKGROUND);
        expect(e.source).toExist();
        expect(e.source).toBe('backgroundSelector');
        done();
    });
    it('test adding or updating thumbnails', (done) => {
        let e = updateThumbnail('binary Code', 'https:/link', true, '1983');
        expect(e).toExist();
        expect(e.type).toBe(UPDATE_BACKGROUND_THUMBNAIL);
        expect(e.thumbnailData).toExist();
        expect(e.thumbnailData).toBe('binary Code');
        expect(e.thumbnail).toExist();
        expect(e.thumbnail).toBe('https:/link');
        expect(e.unsavedChanges).toExist();
        expect(e.unsavedChanges).toBe(true);
        expect(e.id).toExist();
        expect(e.id).toBe('1983');

        done();
    });
    it('test adding or updating thumbnails', (done) => {
        let e = createBackgroundsList([1234, 1232, 9982]);
        expect(e).toExist();
        expect(e.type).toBe(CREATE_BACKGROUNDS_LIST);
        expect(e.backgrounds).toExist();
        expect(e.backgrounds.length).toBe(3);
        done();
    });
    it('test saving map with newly created backgrounds', (done) => {
        let e = backgroundThumbnailsUpdated('string', {name: 'thumb'}, {});
        expect(e).toExist();
        expect(e.type).toBe(BACKGROUND_THUMBS_UPDATED);
        expect(e.mapThumb).toExist();
        expect(e.mapThumb).toBe('string');
        expect(e.metadata).toExist();
        expect(e.metadata.name).toBe('thumb');
        expect(e.data).toExist();
        done();
    });
    it('test adding background properties', (done) => {
        let e = addBackgroundProperties({name: 'thumb'}, true);
        expect(e).toExist();
        expect(e.type).toBe(ADD_BACKGROUND_PROPERTIES);
        expect(e.modalParams).toExist();
        expect(e.modalParams.name).toBe('thumb');
        expect(e.unsavedChanges).toExist();
        expect(e.unsavedChanges).toBe(true);
        done();
    });
    it('test editing action of a background properties', (done) => {
        let e = editBackgroundProperties(true);
        expect(e).toExist();
        expect(e.type).toBe(EDIT_BACKGROUND_PROPERTIES);
        expect(e.editing).toExist();
        expect(e.editing).toBe(true);
        done();
    });
    it('test removing thumbnail by Id', (done) => {
        let e = removeThumbnail('1983');
        expect(e).toExist();
        expect(e.type).toBe(REMOVE_BACKGROUND_THUMBNAIL);
        expect(e.backgroundId).toExist();
        expect(e.backgroundId).toBe('1983');
        done();
    });
    it('test clearing backgrounds', (done) => {
        let e = clearBackgrounds();
        expect(e).toExist();
        expect(e.type).toBe(BACKGROUNDS_CLEAR);
        done();
    });
    it('test clearing background\'s properties', (done) => {
        let e = clearModalParameters();
        expect(e).toExist();
        expect(e.type).toBe(CLEAR_MODAL_PARAMETERS);
        done();
    });
});
