/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { createStateMocker } from './reducersTestUtils';
import {
    edit,
    setContent,
    setEditedContent,
    setSettings,
    setEditedSettings,
    changeSetting,
    reset,
    loading
} from '../../actions/details';
import {
    editingSelector,
    contentSelector,
    editedContentSelector,
    contentChangedSelector,
    settingsSelector,
    editedSettingsSelector,
    loadingSelector,
    loadFlagsSelector
} from '../../selectors/details';

import details from '../details';

describe('details reducer', () => {
    const stateMocker = createStateMocker({details});

    it('setContent', () => {
        const state = stateMocker(setContent('content'));
        expect(contentSelector(state)).toBe('content');
    });
    it('setEditedContent', () => {
        const state = stateMocker(setEditedContent('content'));
        expect(editedContentSelector(state)).toBe('content');
    });
    it('setSettings', () => {
        const state = stateMocker(setSettings('settings'));
        expect(settingsSelector(state)).toBe('settings');
    });
    it('setEditedSettings', () => {
        const state = stateMocker(setEditedSettings('editedSettings'));
        expect(editedSettingsSelector(state)).toBe('editedSettings');
    });
    it('changeSetting', () => {
        const settings = {
            setting1: 1,
            setting2: 'value'
        };
        const state = stateMocker(setEditedSettings(settings), changeSetting('setting1', 2));
        expect(editedSettingsSelector(state)).toEqual({
            setting1: 2,
            setting2: 'value'
        });
    });
    it('reset', () => {
        const state = stateMocker(setSettings('settings'), setContent('content'), reset());
        expect(state.details).toEqual({});
    });
    it('loading', () => {
        const state = stateMocker(loading(true, 'loadingDetails'));
        expect(loadingSelector(state)).toBe(true);
        expect(loadFlagsSelector(state)).toEqual({
            loadingDetails: true
        });
    });
    it('edit enable', () => {
        const state = stateMocker(setContent('content'), edit(true));
        expect(editingSelector(state)).toBe(true);
        expect(editedContentSelector(state)).toBe('content');
        expect(contentChangedSelector(state)).toNotExist();
    });
    it('edit disable', () => {
        const state = stateMocker(setContent('content'), edit(true), setEditedContent('contentEdited'), edit(false));
        expect(editingSelector(state)).toBe(false);
        expect(editedContentSelector(state)).toBe('contentEdited');
        expect(contentChangedSelector(state)).toBe(false);
    });
});
