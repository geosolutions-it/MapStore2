/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import TEST_STORY from "../../test-resources/geostory/sampleStory_1.json";

import { Modes } from '../../utils/GeoStoryUtils';
import {
    ADD, add,
    CHANGE_MODE, setEditing,
    SET_CURRENT_STORY, setCurrentStory,
    UPDATE, update,
    UPDATE_CURRENT_PAGE, updateCurrentPage,
    LOAD_GEOSTORY, loadGeostory,
    LOADING_GEOSTORY, loadingGeostory,
    LOAD_GEOSTORY_ERROR, loadGeostoryError,
    editResource, EDIT_RESOURCE,
    move, MOVE,
    remove, REMOVE,
    selectCard, SELECT_CARD,
    SAVE, saveStory,
    setFocusOnContent,
    TOGGLE_CONTENT_FOCUS,
    toggleSettingsPanel, TOGGLE_SETTINGS_PANEL,
    toggleSetting, TOGGLE_SETTING,
    toggleCardPreview, TOGGLE_CARD_PREVIEW,
    updateSetting, UPDATE_SETTING, toggleWebPageCreator, TOGGLE_WEBPAGE_CREATOR
} from '../geostory';

describe('test geostory action creators', () => {
    it('setEditing', () => {
        const action = setEditing(true);
        expect(action.type).toBe(CHANGE_MODE);
        expect(action.mode).toBe(Modes.EDIT);
        const action2 = setEditing(false);
        expect(action2.type).toBe(CHANGE_MODE);
        expect(action2.mode).toBe(Modes.VIEW);
    });
    it('setCurrentStory', () => {
        expect(setCurrentStory(TEST_STORY)).toEqual({
            type: SET_CURRENT_STORY,
            story: TEST_STORY
        });
    });
    it('add', () => {
        const PATH = 'sections';
        const POSITION = 0;
        const SECTION = { type: 'dummy' };
        const action = add(PATH, POSITION, SECTION);
        expect(action.type).toBe(ADD);
        expect(action.path).toBe(PATH);
        expect(action.position).toBe(POSITION);
        expect(action.element).toBe(SECTION);
        expect(action.id).toExist("action didn't generated missing ID");
    });
    it('loadGeostory', () => {
        const id = 'sampleStory';
        const action = loadGeostory(id);
        expect(action.type).toBe(LOAD_GEOSTORY);
        expect(action.id).toBe(id);
    });
    it('editResource', () => {
        const mediaType = "image";
        const id = "id";
        const data = {type: "image"};
        const action = editResource(id, mediaType, data);
        expect(action.type).toBe(EDIT_RESOURCE);
        expect(action.id).toEqual(id);
        expect(action.mediaType).toEqual(mediaType);
        expect(action.data).toEqual(data);
    });
    it('loadingGeostory', () => {
        // defaults
        const action = loadingGeostory();
        expect(action.type).toBe(LOADING_GEOSTORY);
        expect(action.value).toBe(false);
        expect(action.name).toBe("loading");
        // with sample values
        const action2 = loadingGeostory(true, "saving");
        expect(action2.type).toBe(LOADING_GEOSTORY);
        expect(action2.value).toBe(true);
        expect(action2.name).toBe("saving");
    });
    it('loadGeostoryError', () => {
        const error = {message: "this story does not exist"};
        const action = loadGeostoryError(error);
        expect(action.type).toBe(LOAD_GEOSTORY_ERROR);
        expect(action.error).toEqual(error);
    });
    it('remove', () => {
        const PATH = 'sections';
        const action = remove(PATH);
        expect(action.type).toBe(REMOVE);
        expect(action.path).toBe(PATH);
    });
    it('toggleCardPreview', () => {
        const action = toggleCardPreview();
        expect(action.type).toBe(TOGGLE_CARD_PREVIEW);
    });
    it('update', () => {
        const PATH = 'sections';
        const SECTION = { type: 'dummy' };
        const action = update(PATH, SECTION);
        expect(action.type).toBe(UPDATE);
        expect(action.path).toBe(PATH);
        expect(action.element).toBe(SECTION);
        expect(action.mode).toBe('replace');
    });
    it('updateCurrentPage', () => {
        const retVal = updateCurrentPage({sectionId: "TEST"});
        expect(retVal).toExist();
        expect(retVal.type).toBe(UPDATE_CURRENT_PAGE);
        expect(retVal.sectionId).toBe('TEST');
    });
    it('saveStory', () => {
        const SAMPLE_RESOURCE = { id: 1234, data: { } };
        const retVal = saveStory(SAMPLE_RESOURCE);
        expect(retVal).toExist();
        expect(retVal.type).toBe(SAVE);
        expect(retVal.resource).toBe(SAMPLE_RESOURCE);
    });
    it('selectCard', () => {
        const card = "id-card";
        const retVal = selectCard(card);
        expect(retVal).toExist();
        expect(retVal.type).toBe(SELECT_CARD);
        expect(retVal.card).toBe(card);
    });
    it('move', () => {
        const source = "source";
        const target = "target";
        const position = 0;
        const retVal = move(source, target, position);
        expect(retVal).toExist();
        expect(retVal.type).toBe(MOVE);
        expect(retVal.source).toBe(source);
        expect(retVal.target).toBe(target);
        expect(retVal.position).toBe(position);
    });
    it('set focus on a content', () => {
        const retVal = setFocusOnContent(false, "target", "selector", true, "path");
        expect(retVal).toExist();
        expect(retVal.type).toBe(TOGGLE_CONTENT_FOCUS);
        expect(retVal.status).toBe(false);
        expect(retVal.target).toBe("target");
        expect(retVal.selector).toBe("selector");
        expect(retVal.hideContent).toBe(true);
        expect(retVal.path).toBe("path");
    });
    it('toggleSetting', () => {
        const option = "isLogoEnabled";
        const retVal = toggleSetting(option);
        expect(retVal).toExist();
        expect(retVal.type).toBe(TOGGLE_SETTING);
        expect(retVal.option).toBe(option);
    });
    it('toggleSettingsPanel', () => {
        const withSave = true;
        const retVal = toggleSettingsPanel(withSave );
        expect(retVal).toExist();
        expect(retVal.type).toBe(TOGGLE_SETTINGS_PANEL);
        expect(retVal.withSave).toBe(withSave);
    });
    it('updateSetting', () => {
        const prop = "isLogoEnabled";
        const value = true;
        const retVal = updateSetting(prop, value);
        expect(retVal).toExist();
        expect(retVal.type).toBe(UPDATE_SETTING);
        expect(retVal.prop).toBe(prop);
        expect(retVal.value).toBe(value);
    });
    it('toggleWebPageCreator', () => {
        const open = true;
        const retVal = toggleWebPageCreator(open);
        expect(retVal).toExist();
        expect(retVal.type).toBe(TOGGLE_WEBPAGE_CREATOR);
        expect(retVal.show).toBe(true);
    });
});
