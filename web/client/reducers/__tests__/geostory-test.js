/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    add,
    addResource,
    editResource,
    setCurrentStory,
    loadingGeostory,
    setEditing,
    update,
    remove,
    toggleCardPreview,
    updateCurrentPage,
    setControl,
    setResource,
    saveGeoStoryError,
    storySaved
} from '../../actions/geostory';
import {
    isCollapsedSelector,
    currentStorySelector,
    modeSelector,
    sectionsSelector,
    sectionAtIndexSelectorCreator,
    resourceSelector,
    resourcesSelector,
    currentPageSelector,
    loadingSelector,
    controlSelectorCreator,
    errorsSelector
} from '../../selectors/geostory';
import TEST_STORY from "../../test-resources/geostory/sampleStory_1.json";

import geostory from '../../reducers/geostory';
import { Modes, lists, getDefaultSectionTemplate, Controls } from '../../utils/GeoStoryUtils';

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
        it('using a template', () => {
            const SectionTypes = lists.SectionTypes;
            SectionTypes.map( type => {
                const ADD_ACTION = add("sections", 0, type, i => i);
                const STATE = { geostory: geostory(STATE_STORY_1, ADD_ACTION) };
                const section = sectionAtIndexSelectorCreator(0)(STATE);
                expect(section.type).toEqual(getDefaultSectionTemplate(type, i => i).type);
                expect(section.contents.length).toEqual(getDefaultSectionTemplate(type, i => i).contents.length);
            });
        });
    });
    describe('update contents', () => {
        const STATE_STORY = geostory(undefined, setCurrentStory(TEST_STORY));
        it('update with index path', () => {
            const TEST_CONTENT = "<h1>UNIT TEST CONTENT</h1>";
            const pathToContentHtml = `sections[0].contents[0].html`;
            const STATE = { geostory: geostory(STATE_STORY, update(pathToContentHtml, TEST_CONTENT)) };
            expect(sectionAtIndexSelectorCreator(0)(STATE).contents[0].html).toBe(TEST_CONTENT);
        });
        it('update with ID path', () => {
            const TEST_CONTENT = "<h1>UNIT TEST CONTENT</h1>";
            const SECTION_ID = TEST_STORY.sections[0].id;
            const CONTENT_ID = TEST_STORY.sections[0].contents[0].id;
            const pathToContentHtml = `sections[{"id":"${SECTION_ID}"}].contents[{"id":"${CONTENT_ID}"}].html`;
            const STATE = { geostory: geostory(STATE_STORY, update(pathToContentHtml, TEST_CONTENT)) };
            expect(sectionAtIndexSelectorCreator(0)(STATE).contents[0].html).toBe(TEST_CONTENT);
        });
        it('update with ID pat, merge mode', () => {
            const TEST_CONTENT = "<h1>UNIT TEST CONTENT</h1>";
            const SECTION_ID = TEST_STORY.sections[0].id;
            const CONTENT_ID = TEST_STORY.sections[0].contents[0].id;
            const pathToContentHtml = `sections[{"id":"${SECTION_ID}"}].contents[{"id":"${CONTENT_ID}"}]`;
            const STATE = { geostory: geostory(STATE_STORY, update(pathToContentHtml, {html: TEST_CONTENT, newProp: "PROP"})) };
            expect(sectionAtIndexSelectorCreator(0)(STATE).contents[0].html).toBe(TEST_CONTENT);
            expect(sectionAtIndexSelectorCreator(0)(STATE).contents[0].newProp).toBe("PROP");
        });
    });
    it('geostory updateCurrentPage', () => {
        const action = updateCurrentPage({sectionId: "ID"});
        const state = geostory( undefined, action);
        const currentPage = currentPageSelector({geostory: state});
        expect(currentPage.sectionId).toBe("ID");
    });
    it('ADD_RESOURCE', () => {
        expect(
            resourcesSelector({ geostory: geostory({}, addResource("id", "image", {}))})
        ).toEqual([{id: "id", type: "image", data: {}}]);
    });
    it('EDIT_RESOURCE', () => {
        expect(
            resourcesSelector({ geostory: geostory({
                currentStory: {resources: [{id: "id", type: "image", data: {title: "tit"}}]}
            },
            editResource("id", "image", {title: "title"}))})
        ).toEqual([{id: "id", type: "image", data: {title: "title"}}]);
    });
    it('TOGGLE_CARD_PREVIEW', () => {
        expect(
            isCollapsedSelector({ geostory: geostory({
                isCollapsed: false
            },
            toggleCardPreview())})
        ).toEqual(true);
    });
    describe('remove', () => {
        const STATE_STORY = geostory(undefined, setCurrentStory(TEST_STORY));
        it.skip('as entry', () => {
            const SECTION_ID = TEST_STORY.sections[0].id;
            const CONTENT_ID = TEST_STORY.sections[0].contents[0].id;
            const pathToContentHtml = `sections[{"id":"${SECTION_ID}"}].contents[{"id":"${CONTENT_ID}"}].html`;
            const STATE = { geostory: geostory(STATE_STORY, remove(pathToContentHtml)) };
            expect(sectionAtIndexSelectorCreator(0)(STATE).contents[0].html).toNotExist();
        });
        it('as array index', () => {
            const SECTION_ID = TEST_STORY.sections[1].id;
            const CONTENT_ID = TEST_STORY.sections[1].contents[0].id;
            const pathToContentHtml = `sections[{"id":"${SECTION_ID}"}].contents[{"id":"${CONTENT_ID}"}]`;
            const STATE = { geostory: geostory(STATE_STORY, remove(pathToContentHtml)) };
            expect(sectionAtIndexSelectorCreator(1)(STATE).contents[1]).toNotExist(); // removes only the item at index
            expect(sectionAtIndexSelectorCreator(1)(STATE).contents[0]).toExist();
            expect(sectionAtIndexSelectorCreator(1)(STATE).contents.length).toBe(1);
            expect(sectionAtIndexSelectorCreator(1)(STATE).contents[0].id).toBe("col2"); // 2nd element of the array shifted in first position
        });
        it('as array index for sub contents', () => {
            const SECTION_ID = TEST_STORY.sections[1].id;
            const CONTENT_ID = TEST_STORY.sections[1].contents[0].id;
            const pathToContentHtml = `sections[{"id":"${SECTION_ID}"}].contents[{"id":"${CONTENT_ID}"}].contents[0]`;
            const STATE = { geostory: geostory(STATE_STORY, remove(pathToContentHtml)) };
            expect(sectionAtIndexSelectorCreator(1)(STATE).contents[1]).toExist(); // removes only the item at index
            expect(sectionAtIndexSelectorCreator(1)(STATE).contents[0]).toExist();
            expect(sectionAtIndexSelectorCreator(1)(STATE).contents[0].contents.length).toBe(1);
            expect(sectionAtIndexSelectorCreator(1)(STATE).contents[0].contents[0].type).toBe("media"); // 2nd element of the array shifted in first position
        });
    });
    it('save (storySaved and saveGeoStoryError)', () => {
        // check errors handling for save and save error events
        const SAMPLE_ERROR = { my: "error" };
        const STATE_1 = geostory(undefined, saveGeoStoryError(SAMPLE_ERROR));
        expect(errorsSelector({ geostory: STATE_1 }).save[0]).toBe(SAMPLE_ERROR);
        const STATE_2 = geostory(STATE_1, storySaved(1234));
        expect(errorsSelector({ geostory: STATE_2 }).save).toBeFalsy();
    });
    it('loadingGeostory', () => {
        const action = loadingGeostory(true, "saving");
        const state = geostory(undefined, action);
        expect(state).toExist();
        expect(loadingSelector({geostory: state})).toBe(true);
        expect(state.loading).toBe(true);
        expect(state.loadFlags.saving).toBe(true);
    });
    // note: this is the GeoSore resource, with permissions, id and so on.
    it('setResource', () => {
        const SAMPLE_RESOURCE = {
            canEdit: true,
            canDelete: true
        };
        expect(
            resourceSelector({
                geostory: geostory(undefined, setResource(SAMPLE_RESOURCE))
            })
        ).toBe(SAMPLE_RESOURCE);
    });
    describe('setControl', () => {
        Object.keys(Controls).forEach(k => {
            const CONTROL = Controls[k];
            it(CONTROL, () => {
                const controlState = controlSelectorCreator(CONTROL)({
                    geostory: geostory(undefined, setControl(CONTROL, true))
                });
                expect(controlState).toBeTruthy();
            });
        });
    });
});
