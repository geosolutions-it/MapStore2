/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

import {
    add,
    setCurrentStory,
    setEditing
} from '../../actions/geostory';
import {
    currentStorySelector,
    modeSelector,
    sectionsSelector,
    sectionAtIndexSelectorCreator
} from '../../selectors/geostory';
import TEST_STORY from "json-loader!../../test-resources/geostory/sampleStory_1.json";

import geostory from '../../reducers/geostory';
import { Modes } from '../../utils/GeoStoryUtils';

describe('geostory reducer', () => {
    it('setEditing sets mode', () => {
        expect(modeSelector({
            geostory: geostory(undefined, setEditing(true))
        })).toBe(Modes.EDIT);
        expect(modeSelector({geostory: geostory(undefined, setEditing(false))})).toBe(Modes.VIEW);
    });
    it('setCurrentStory sets story', () => {
        expect(currentStorySelector({ geostory: geostory(undefined, setCurrentStory(TEST_STORY)) })).toBe(TEST_STORY);
    });
    describe('add Section', () => {
        const STATE_STORY_1 = geostory(undefined, setCurrentStory(TEST_STORY));
        it('no position provided (append)', () => {
            const SECTION_ID_1 = "UNIT_TEST_SECTION_ID_1";
            const ADD_ACTION_1 = add('sections', undefined, {id: SECTION_ID_1});
            const SECTION_ID_2 = "UNIT_TEST_SECTION_ID_2";
            const ADD_ACTION_2 = add('sections', undefined, { id: SECTION_ID_2 });
            const SESSIONS_SIZE = sectionsSelector({geostory: STATE_STORY_1}).length;
            const STATE_1 = { geostory: geostory(STATE_STORY_1, ADD_ACTION_1) };
            expect(sectionAtIndexSelectorCreator(SESSIONS_SIZE)(STATE_1).id).toBe(SECTION_ID_1);
            const STATE_2 = { geostory: geostory(STATE_1.geostory, ADD_ACTION_2) };
            expect(sectionAtIndexSelectorCreator(SESSIONS_SIZE + 1)(STATE_2).id).toBe(SECTION_ID_2);
        });
        it('insert at index (position is a number)', () => {
            const SECTION_ID_1 = "UNIT_TEST_SECTION_ID_1";
            const ADD_ACTION_1 = add('sections', 0, { id: SECTION_ID_1 });
            const SECTION_ID_2 = "UNIT_TEST_SECTION_ID_2";
            const ADD_ACTION_2 = add('sections', 100, { id: SECTION_ID_2 });
            const SESSIONS_SIZE = sectionsSelector({ geostory: STATE_STORY_1 }).length;
            const STATE_1 = { geostory: geostory(STATE_STORY_1, ADD_ACTION_1) };
            expect(sectionAtIndexSelectorCreator(0)(STATE_1).id).toBe(SECTION_ID_1);
            const STATE_2 = { geostory: geostory(STATE_1.geostory, ADD_ACTION_2) };
            expect(sectionAtIndexSelectorCreator(SESSIONS_SIZE + 1)(STATE_2).id).toBe(SECTION_ID_2);
        });
        it('insert at index (position is a string, as ID)', () => {
            const ID_SECTION = TEST_STORY.sections[0].id;
            const SECTION_ID_1 = "UNIT_TEST_SECTION_ID_1";
            const ADD_ACTION_1 = add('sections', ID_SECTION, { id: SECTION_ID_1 });
            const SECTION_ID_2 = "UNIT_TEST_SECTION_ID_2";
            const ADD_ACTION_2 = add('sections', SECTION_ID_1, { id: SECTION_ID_2 });
            const STATE_1 = { geostory: geostory(STATE_STORY_1, ADD_ACTION_1) };
            expect(sectionAtIndexSelectorCreator(1)(STATE_1).id).toBe(SECTION_ID_1);
            const STATE_2 = { geostory: geostory(STATE_1.geostory, ADD_ACTION_2) };
            expect(sectionAtIndexSelectorCreator(2)(STATE_2).id).toBe(SECTION_ID_2);
        });
    });
});
