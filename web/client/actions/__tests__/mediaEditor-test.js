/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    chooseMedia, CHOOSE_MEDIA,
    hide, HIDE,
    loadMedia, LOAD_MEDIA,
    loadMediaSuccess, LOAD_MEDIA_SUCCESS,
    editMedia, EDIT_MEDIA,
    saveMedia, SAVE_MEDIA,
    saveMediaSuccess, SAVE_MEDIA_SUCCESS,
    selectItem, SELECT_ITEM,
    updateItem, UPDATE_ITEM,
    setMediaService, SET_MEDIA_SERVICE,
    setMediaType, SET_MEDIA_TYPE,
    setAddingMedia, ADDING_MEDIA,
    setEditingMedia, EDITING_MEDIA,
    show, SHOW,
    removeMedia, REMOVE_MEDIA
} from '../mediaEditor';

describe('mediaEditor actions', () => {
    it('chooseMedia', () => {
        const action = chooseMedia({});
        expect(action.resource).toEqual({});
        expect(action.type).toEqual(CHOOSE_MEDIA);
    });
    it('hide', () => {
        const action = hide();
        expect(action.type).toEqual(HIDE);
    });
    it('loadMedia', () => {
        const params = {};
        const mediaType = "image";
        const sourceId = "geostory";
        const action = loadMedia(params, mediaType, sourceId);
        expect(action.params).toEqual(params);
        expect(action.mediaType).toEqual(mediaType);
        expect(action.sourceId).toEqual(sourceId);
        expect(action.type).toEqual(LOAD_MEDIA);
    });
    it('loadMediaSuccess', () => {
        const params = {};
        const resultData = {};
        const mediaType = "image";
        const sourceId = "geostory";
        const action = loadMediaSuccess({mediaType, sourceId, params, resultData});
        expect(action.params).toEqual(params);
        expect(action.mediaType).toEqual(mediaType);
        expect(action.sourceId).toEqual(sourceId);
        expect(action.resultData).toEqual(resultData);
        expect(action.type).toEqual(LOAD_MEDIA_SUCCESS);
    });
    it('editMedia', () => {
        const path = "sections[0]contents[0]";
        const owner = "geostory";
        const action = editMedia({path, owner});
        expect(action.path).toEqual(path);
        expect(action.owner).toEqual(owner);
        expect(action.type).toEqual(EDIT_MEDIA);
    });
    it('saveMedia', () => {
        const data = {};
        const type = "image";
        const source = "geostory";
        const action = saveMedia({type, source, data});
        expect(action.mediaType).toEqual(type);
        expect(action.source).toEqual(source);
        expect(action.data).toEqual(data);
        expect(action.type).toEqual(SAVE_MEDIA);
    });
    it('saveMediaSuccess', () => {
        const data = {};
        const mediaType = "image";
        const source = "geostory";
        const id = "geostory";
        const action = saveMediaSuccess({mediaType, source, data, id});
        expect(action.mediaType).toEqual(mediaType);
        expect(action.source).toEqual(source);
        expect(action.id).toEqual(id);
        expect(action.data).toEqual(data);
        expect(action.type).toEqual(SAVE_MEDIA_SUCCESS);
    });
    it('selectItem', () => {
        const id = "geostory";
        const action = selectItem(id);
        expect(action.id).toEqual(id);
        expect(action.type).toEqual(SELECT_ITEM);
    });
    it('updateItem', () => {
        const map = {id: "val"};
        let action = updateItem(map);
        expect(action.item).toEqual(map);
        expect(action.type).toEqual(UPDATE_ITEM);
        expect(action.mode).toEqual("merge");
        action = updateItem(map, "replace");
        expect(action.item).toEqual(map);
        expect(action.type).toEqual(UPDATE_ITEM);
        expect(action.mode).toEqual("replace");
    });
    it('setAddingMedia', () => {
        const adding = true;
        const action = setAddingMedia(adding);
        expect(action.adding).toEqual(adding);
        expect(action.type).toEqual(ADDING_MEDIA);
    });
    it('setEditingMedia', () => {
        const editing = true;
        const action = setEditingMedia(editing);
        expect(action.editing).toEqual(editing);
        expect(action.type).toEqual(EDITING_MEDIA);
    });
    it('setMediaService', () => {
        const value = "geostory";
        const action = setMediaService({value});
        expect(action.id).toEqual(value);
        expect(action.type).toEqual(SET_MEDIA_SERVICE);
    });
    it('setMediaType', () => {
        const mediaType = "image";
        const action = setMediaType(mediaType);
        expect(action.mediaType).toEqual(mediaType);
        expect(action.type).toEqual(SET_MEDIA_TYPE);
    });
    it('show', () => {
        const owner = "geostory";
        const action = show(owner);
        expect(action.owner).toEqual(owner);
        expect(action.type).toEqual(SHOW);
    });
    it('removeMedia', () => {
        const owner = "geostory";
        const type = "map";
        const action = removeMedia(type, owner);
        expect(action.type).toEqual(REMOVE_MEDIA);
        expect(action.mediaType).toEqual(type);
        expect(action.owner).toEqual(owner);
    });
});
