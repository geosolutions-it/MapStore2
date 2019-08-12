/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

import {
    ADD,
    add,
    CHANGE_MODE,
    setEditing,
    SET_CURRENT_STORY,
    setCurrentStory,
    UPDATE,
    update

} from '../geostory';
const { Modes } = require('../../utils/GeoStoryUtils');
import TEST_STORY from "json-loader!../../test-resources/geostory/sampleStory_1.json";

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
    describe('add', () => {
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
    it('update', () => {
        const PATH = 'sections';
        const SECTION = { type: 'dummy' };
        const action = update(PATH, SECTION);
        expect(action.type).toBe(UPDATE);
        expect(action.path).toBe(PATH);
        expect(action.element).toBe(SECTION);
        expect(action.mode).toBe('replace');
    });
});
