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
    cardPreviewEnabledSelector,
    createPathSelector,
    currentStorySelector,
    sectionsSelector,
    sectionSelectorCreator,
    sectionAtIndexSelectorCreator,
    resourcesSelector,
    resourceByIdSelectorCreator,
    resourceIdSelectorCreator
} from "../geostory";

describe('geostory selectors', () => { // TODO: check default
    it('cardPreviewEnabledSelector', () => { expect(cardPreviewEnabledSelector({geostory: {cardPreviewEnabled: false}})).toEqual(false); });
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
    it('resourceByIdSelectorCreator', () => { expect(resourceByIdSelectorCreator("id")({geostory: {currentStory: {resources: [{id: "id"}]}}})).toEqual({id: "id"}); });
});
