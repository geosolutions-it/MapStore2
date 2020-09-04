/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    modeSelector,
    isCollapsedSelector,
    createPathSelector,
    currentStorySelector,
    sectionsSelector,
    sectionSelectorCreator,
    settingsSelector,
    sectionAtIndexSelectorCreator,
    resourceSelector,
    canEditSelector,
    resourcesSelector,
    resourceByIdSelectorCreator,
    resourceIdSelectorCreator,
    saveDialogSelector,
    errorsSelector,
    loadingSelector,
    currentPositionSelector,
    navigableItemsSelectorCreator,
    settingsChangedSelector,
    settingsItemsSelector,
    totalItemsSelector,
    visibleItemsSelector,
    isMediaResourceUsed,
    geostoryIdSelector,
    updateUrlOnScrollSelector,
    currentStoryFonts
} from "../geostory";
import TEST_STORY from "../../test-resources/geostory/sampleStory_1.json";

describe('geostory selectors', () => { // TODO: check default
    it('isCollapsedSelector', () => { expect(isCollapsedSelector({geostory: {isCollapsed: false}})).toEqual(false); });
    it('currentStorySelector', () => { expect(currentStorySelector({geostory: {currentStory: {}}})).toEqual({}); });
    it('createPathSelector', () => {
        const path = 'sections[{"id": "section_id"}].contents[{"id": "content_id"}]';
        expect(createPathSelector(path)({geostory: {currentStory: {sections: [{id: "section_id", contents: [{ id: "content_id" }]}]}}})).toEqual({id: "content_id"});
    });
    it('resourceIdSelectorCreator', () => {
        const path = 'sections[{"id": "section_id"}].contents[{"id": "content_id"}]';
        const resourceId = "resource_id";
        expect(resourceIdSelectorCreator(path)({geostory: {currentStory: {sections: [{id: "section_id", contents: [{ id: "content_id", resourceId }]}]}}})).toEqual(resourceId);
    });
    it('modeSelector', () => { expect(modeSelector({geostory: {mode: "view"}})).toEqual("view"); });
    it('sectionsSelector', () => { expect(sectionsSelector({geostory: {currentStory: {sections: []}}})).toEqual([]); });
    it('sectionSelectorCreator', () => { expect(sectionSelectorCreator("id")({geostory: {currentStory: {sections: [{id: "id"}]}}})).toEqual({id: "id"}); });
    it('sectionAtIndexSelectorCreator', () => { expect(sectionAtIndexSelectorCreator(0)({geostory: {currentStory: {sections: [{id: "id"}]}}})).toEqual({id: "id"}); });
    it('resourcesSelector', () => { expect(resourcesSelector({geostory: {currentStory: {resources: []}}})).toEqual([]); });
    it('canEditSelector false', () => { expect(canEditSelector({geostory: {resource: {id: 123}}})).toEqual(false); });
    it('canEditSelector true', () => { expect(canEditSelector({geostory: {resource: {canEdit: true}}})).toEqual(true); });
    it('resourceSelector', () => { expect(resourceSelector({geostory: {resource: {id: 123}}})).toEqual({id: 123}); });
    it('resourceByIdSelectorCreator', () => { expect(resourceByIdSelectorCreator("id")({geostory: {currentStory: {resources: [{id: "id"}]}}})).toEqual({id: "id"}); });
    it('saveDialogSelector', () => {
        expect(saveDialogSelector({
            geostory: {
                controls: {
                    save: { // Note: this is the path of Controls.SHOW_SAVE
                        show: "save"
                    }
                }
            }
        })).toEqual("save");
    });
    it('loadingSelector', () => expect(loadingSelector({ geostory: { loading: true } })).toBe(true));
    it('errorsSelector', () => expect(errorsSelector({ geostory: { errors: ["some", "error"] } })).toBeTruthy());
    describe('navigableItemsSelectorCreator', () => {
        it('with all sections except immersive, and columns', () => {
            expect(navigableItemsSelectorCreator()({
                geostory: {
                    currentStory: TEST_STORY
                }}).map(item => item.id)).toEqual([ 'SomeID', 'col1', 'col2', 'SomeID_title', 'SomeID_banner' ]);
        });
        it('with all sections and columns', () => {
            expect(navigableItemsSelectorCreator({withImmersiveSection: true})({
                geostory: {
                    currentStory: TEST_STORY
                }}).map(item => item.id)).toEqual([ 'SomeID', 'SomeID2', 'col1', 'col2', 'SomeID_title', 'SomeID_banner']);
        });
        it('with all sections except immersive, and columns, with some items disabled', () => {
            expect(navigableItemsSelectorCreator({includeAlways: false})({
                geostory: {
                    currentStory: {...TEST_STORY, settings: {checked: ["col2", "col1"] }}
                }}).map(item => item.id)).toEqual([ 'col1', 'col2' ]);
        });
        it('with all sections and columns, with some items disabled', () => {
            expect(navigableItemsSelectorCreator({withImmersiveSection: true, includeAlways: false})({
                geostory: {
                    currentStory: {...TEST_STORY, settings: {checked: ["col2", "col1"] }}
                }}).map(item => item.id)).toEqual([ 'SomeID2', 'col1', 'col2' ]);
        });
    });
    it('settingsItemsSelector ', () => expect(settingsItemsSelector({ geostory: { currentStory: TEST_STORY } })).toEqual(
        [
            { label: 'Abstract', value: 'SomeID' },
            { label: 'Abstract', value: 'SomeID2', children: [ { label: "", value: 'col1' }, { label: "", value: 'col2' } ] },
            { label: 'Abstract', value: 'SomeID_title' },
            { label: 'Abstract', value: 'SomeID_banner' }
        ])
    );
    it('currentPositionSelector ', () => expect(currentPositionSelector({ geostory: { currentStory: TEST_STORY, currentPage: {
        sectionId: "SomeID"
    } } })).toBe(0));
    it('totalItemsSelector ', () => expect(totalItemsSelector({ geostory: { currentStory: TEST_STORY } })).toBe(5));
    it('settingsSelector ', () => expect(settingsSelector({ geostory: { currentStory: {...TEST_STORY, settings: {
        checked: ["col2"]
    }} } })).toEqual({checked: [ 'col2' ], expanded: [ 'SomeID2' ] }));
    it('visibleItemsSelector ', () => expect(visibleItemsSelector({ geostory: { currentStory: {settings: {checked: ["id"]}} } })).toEqual({"id": true}));
    it('settingsChangedSelector ', () => expect(settingsChangedSelector({ geostory: { currentStory: {settings: {checked: ["id"]}}, oldSettings: {checked: ["id", "otherid"]} } })).toBe(true));
    it('isMediaResourceUsed ', () => expect(isMediaResourceUsed({ geostory: { currentStory: TEST_STORY} }, "resId")).toBe(false));
    it('geostoryIdSelector ', () => {
        const GEOSTORY_ID = 'GEOSTORY_ID';
        const state = {
            geostory: {
                resource: {
                    id: GEOSTORY_ID
                }
            }
        };
        expect(geostoryIdSelector(state)).toBe(GEOSTORY_ID);
        expect(geostoryIdSelector({})).toBe(undefined);
    });
    it('geostoryIdSelector ', () => {
        expect(updateUrlOnScrollSelector({ geostory: { updateUrlOnScroll: false} })).toBe(false);
        expect(updateUrlOnScrollSelector({ geostory: { updateUrlOnScroll: true} })).toBe(true);
    });
    it('currentStoryFonts ', () => {
        expect(currentStoryFonts({})).toEqual([]);
        const fontFamilies = [{
            family: "test",
            src: "test"
        }];
        expect(currentStoryFonts({ geostory: { currentStory: {settings: { theme: { fontFamilies } }}}})).toEqual(fontFamilies);
    });
});
