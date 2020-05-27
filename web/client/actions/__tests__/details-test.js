/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    save, SAVE,
    saveSuccess, SAVE_SUCCESS,
    edit, EDIT,
    cancelEdit, CANCEL_EDIT,
    close, CLOSE,
    setContent, SET_CONTENT,
    setEditedContent, SET_EDITED_CONTENT,
    setSettings, SET_SETTINGS,
    setEditedSettings, SET_EDITED_SETTINGS,
    changeSetting, CHANGE_SETTING,
    reset, RESET,
    loading, LOADING
} from '../details';

describe('details actions', () => {
    it('save', () => {
        const retval = save();
        expect(retval.type).toBe(SAVE);
    });
    it('saveSuccess', () => {
        const retval = saveSuccess();
        expect(retval.type).toBe(SAVE_SUCCESS);
    });
    it('edit', () => {
        const retval = edit(true);
        expect(retval.type).toBe(EDIT);
        expect(retval.active).toBe(true);
    });
    it('cancelEdit', () => {
        const retval = cancelEdit();
        expect(retval.type).toBe(CANCEL_EDIT);
    });
    it('close', () => {
        const retval = close();
        expect(retval.type).toBe(CLOSE);
    });
    it('setContent', () => {
        const retval = setContent('content');
        expect(retval.type).toBe(SET_CONTENT);
        expect(retval.content).toBe('content');
    });
    it('setEditedContent', () => {
        const retval = setEditedContent('content', true);
        expect(retval.type).toBe(SET_EDITED_CONTENT);
        expect(retval.content).toBe('content');
        expect(retval.setChanged).toBe(true);
    });
    it('setSettings', () => {
        const retval = setSettings('settings');
        expect(retval.type).toBe(SET_SETTINGS);
        expect(retval.settings).toBe('settings');
    });
    it('setEditedSettings', () => {
        const retval = setEditedSettings('settings');
        expect(retval.type).toBe(SET_EDITED_SETTINGS);
        expect(retval.settings).toBe('settings');
    });
    it('changeSetting', () => {
        const retval = changeSetting(1, 'data');
        expect(retval.type).toBe(CHANGE_SETTING);
        expect(retval.id).toBe(1);
        expect(retval.settingData).toBe('data');
    });
    it('reset', () => {
        const retval = reset();
        expect(retval.type).toBe(RESET);
    });
    it('loading', () => {
        const retval = loading(true, 'loading');
        expect(retval.type).toBe(LOADING);
        expect(retval.value).toBe(true);
        expect(retval.name).toBe('loading');
    });
});
